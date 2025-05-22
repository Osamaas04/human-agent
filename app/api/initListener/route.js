import { listenForNewMessages } from "@/lib/listenForNewMessages";

let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    await listenForNewMessages();
    initialized = true;
  }

  res.status(200).send("Listener started");
}
