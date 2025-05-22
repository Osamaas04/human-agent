import { dbConnect } from "./mongo";
import { Message } from "@/model/message-model";

let listenerStarted = false;

export async function listenForNewMessages() {
  if (listenerStarted) return;
  listenerStarted = true;

  await dbConnect();

  const changeStream = Message.watch([
    { $match: { operationType: "insert" } },
  ]);

  console.log("📡 Listening for new Message inserts...");

  changeStream.on("change", async (change) => {
    const newMessage = change.fullDocument;
    console.log("📥 New Message inserted:", newMessage);

    try {
      await fetch("https://human-agent.replix.space/api/webhook/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });
      console.log("✅ Webhook sent");
    } catch (err) {
      console.error("❌ Webhook failed:", err);
    }
  });
}
