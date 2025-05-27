import { dbConnect } from "@/lib/mongo";
import { Agent } from "@/model/agent-model";
import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/utils/getUserIdFromToken";

export async function POST(request) {
  try {
    const user_id = getUserIdFromToken(request);

    if (!user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!["idle", "offline"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await dbConnect();

    const updatedAgent = await Agent.findOneAndUpdate(
      { user_id },
      { status },
      { new: true }
    );

    if (!updatedAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, agent: updatedAgent });
  } catch (error) {
    console.error("❌ Status update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
