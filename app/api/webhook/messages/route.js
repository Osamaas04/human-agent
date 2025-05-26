import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { Message } from "@/model/message-model";
import { Agent } from "@/model/agent-model";
import { MessageStatus } from "@/model/message-model";

export async function POST(request) {
  try {
    await dbConnect();
    const message = await request.json();
    console.log("📨 Webhook received message");

    // Find eligible agents
    const agents = await Agent.find({
      $or: [
        { status: "idle" },
        {
          status: "busy",
          $expr: { $lt: ["$currentlyAssignedCount", "$maxConcurrentCases"] },
        },
      ],
    }).sort({ currentlyAssignedCount: 1, lastAssignedAt: 1 });

    if (!agents.length) {
      console.warn("⚠️ No agents available");
      return NextResponse.json({ error: "No agents available" }, { status: 503 });
    }

    const selected = agents[0];

    // Update the message in DB with assigned agent
    await Message.findByIdAndUpdate(message._id, {
      assignedAgentId: selected.user_id,
      status: MessageStatus.ASSIGNED,
    });

    // Update the agent's load
    await Agent.updateOne(
      { user_id: selected.user_id },
      {
        $inc: { currentlyAssignedCount: 1 },
        status: "busy",
        lastAssignedAt: new Date(),
      }
    );

    console.log(`✅ Assigned to agent: ${selected.name}`);

    return NextResponse.json({ assignedTo: selected.user_id });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
