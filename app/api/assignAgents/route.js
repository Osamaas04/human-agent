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
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    while (password.length < 8) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password.split("").sort(() => 0.5 - Math.random()).join("");
}


export async function POST(request) {
    try {
        const { name, companyName } = await request.json();

        const user_id = getUserIdFromToken(request)

        if (!user_id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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

        const responseText = await res.text();

        if (!res.ok) {
            const contentType = res.headers.get("content-type");
            let errorMessage = "Failed to register agent.";

            if (contentType && contentType.includes("application/json")) {
                const result = await res.json();
                console.log("result:", result)
                errorMessage = result.message || errorMessage;
            } else {
                const text = await res.text();
                console.log("text:", text)
                console.error("Non-JSON response:", text);
                errorMessage = text || errorMessage;
            }

            return NextResponse.json({ error: errorMessage }, { status: res.status });
        }

        const result = JSON.parse(responseText);

        await createAssignedAgents({
            user_id,
            name,
            companyName,
            email,
            password,
            agentId: result.userId
        });


        return NextResponse.json({
            message: "Agent registered successfully.",
            agent: { name, email, password, status: "offline" },
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}