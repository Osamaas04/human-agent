import { NextResponse } from "next/server";
import { Agent } from "@/model/agent-model";
import { createAssignedAgents } from "@/queries/assignAgents";
import { dbConnect } from "@/lib/mongo";
import { getUserIdFromToken } from "@/utils/getUserIdFromToken";

function generateEmail(name, company) {
    const cleanedName = name.toLowerCase().replace(/\s+/g, "");
    const cleanedCompany = company.toLowerCase().replace(/\s+/g, "");
    return `${cleanedName}@${cleanedCompany}.com`;
}

function generatePassword() {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const allChars = upper + lower + numbers + special;

    let password = "";
    password += upper[Math.floor(Math.random() * upper.length)];
    password += special[Math.floor(Math.random() * special.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    while (password.length < 8) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password.split("").sort(() => 0.5 - Math.random()).join("");
}

export async function POST(request) {
    try {
        const { name, companyName } = await request.json();

        const userId = getUserIdFromToken(request)

        await dbConnect();

        if (!name || !companyName) {
            return NextResponse.json(
                { error: "Name and companyName are required." },
                { status: 400 }
            );
        }

        const email = generateEmail(name, companyName);
        const existingAgent = await Agent.findOne({ email });
        if (existingAgent) {
            return NextResponse.json(
                { error: "Agent with this email already exists." },
                { status: 409 }
            );
        }

        const password = generatePassword();

        const params = new URLSearchParams();
        params.append("Name", name);
        params.append("CompanyName", companyName);
        params.append("Email", email);
        params.append("Password", password);
        params.append("ConfirmPassword", password);

        const res = await fetch("https://gw.replix.space/account/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        if (!res.ok) {
            const contentType = res.headers.get("content-type");
            let errorMessage = "Failed to register agent.";

            if (contentType && contentType.includes("application/json")) {
                const result = await res.json();
                errorMessage = result.message || errorMessage;
            } else {
                const text = await res.text();
                console.error("Non-JSON response:", text);
                errorMessage = text || errorMessage;
            }

            return NextResponse.json({ error: errorMessage }, { status: res.status });
        }

        await createAssignedAgents({ user_id: userId, name, companyName, email });

        return NextResponse.json({
            message: "Agent registered successfully.",
            agent: { name, email, password },
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}