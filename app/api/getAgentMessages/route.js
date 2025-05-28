import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { Message } from "@/model/message-model";
import { getUserIdFromToken } from "@/utils/getUserIdFromToken";

export async function GET(request) {
  try {
    const agentId = getUserIdFromToken(request);

    if (!agentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const messages = await Message.find({ assignedAgentId: agentId })
      .sort({ sentAt: -1 })
      .lean();

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("❌ Fetch messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
