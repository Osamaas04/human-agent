import { listenForNewMessages } from "@/lib/listenForNewMessages";
import { NextResponse } from "next/server";

let initialized = false;

export const POST = async () => {
  if (!initialized) {
    await listenForNewMessages();
    initialized = true;
  }

  return NextResponse.json({ message: "Listener started" });
};
