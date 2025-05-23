import { listenForNewMessages } from "@/lib/listenForNewMessages";
import { NextResponse } from "next/server";

let initialized = false;

export async function POST(request) {
  if (!initialized) {
    await listenForNewMessages();
    initialized = true;
  }

  return NextResponse.json({ message: "Listener started" });
};
