import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    assignedAgentId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['idle', 'busy', 'offline'],
        default: 'offline',
    },
    maxConcurrentCases: {
        type: Number,
        default: 3,
    },
    currentlyAssignedCount: {
        type: Number,
        default: 0,
    },
    lastAssignedAt: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Agent = mongoose.models.Agent || mongoose.model("Agent", agentSchema);