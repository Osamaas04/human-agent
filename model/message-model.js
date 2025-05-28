import mongoose from "mongoose";

const STATUS = {
  ESCALATED: 0,
  ASSIGNED: 1,
  RESOLVED: 2,
}

const PLATFORM = {
  FACEBOOK: "F",
  INSTAGRAM: "I",
  WHATSAPP: "W",
}

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  recipientId: { type: String, required: true },
  messageId: { type: String, required: true },
  text: { type: String },
  pageAccessToken: { type: String, required: true },
  status: {
    type: Number,
    enum: Object.values(STATUS),
    default: STATUS.ESCALATED,
  },
  createdAt: { type: Date, default: Date.now },
  sentAt: { type: Date, required: true },
  platform: {
    type: String,
    enum: Object.values(PLATFORM),
    required: true,
  },
  userId: { type: String, required: true },
  fullName: { type: String, required: true },
  ProfilePicture: { type: String, required: true },
  caseNumber: { type: String, required: true },
  assignedAgentId: { type: String, default: null },
});

export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
export const MessageStatus = STATUS;
export const MessagePlatform = PLATFORM;
