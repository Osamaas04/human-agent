import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { Agent } from "@/model/agent-model";
import { getUserIdFromToken } from "@/utils/getUserIdFromToken";

export async function GET(request) {
    try {
        const user_id = getUserIdFromToken(request);
        if (!user_id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const agents = await Agent.find({ user_id }).select("name email password status");

        return NextResponse.json({ agents }, { status: 200 });
    } catch (error) {
        console.error("Error fetching agents:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
