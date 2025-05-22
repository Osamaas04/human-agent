import { listenForMessages } from "@/lib/listenForMessages";

let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    await listenForMessages();
    initialized = true;
  }

  res.status(200).send("Listener started");
}
