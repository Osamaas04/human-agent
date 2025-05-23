import { NextResponse } from "next/server";
import { Agent } from "@/model/agent-model";
import { createAssignedAgents } from "@/queries/assignAgents";
import FormData from "form-data";
import { dbConnect } from "@/lib/mongo";

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
    console.log(name)
    console.log(companyName)
    console.log(email)
    console.log(password)

    const formData = new FormData();
    formData.append("name", name);
    formData.append("companyName", companyName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmPassword", password);

    const res = await fetch("https://gw.replix.space/account/register", {
      method: "POST",
      credentials:"include",
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: result.message || "Failed to register agent." },
        { status: res.status }
      );
    }

    await createAssignedAgents({ name, companyName, email });

    return NextResponse.json({
      message: "Agent registered successfully.",
      agent: { name, email, password },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
