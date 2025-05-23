import { Agent } from "@/model/agent-model";

export async function createAssignedAgents(assignAgents) {
  try {
    await Agent.create(assignAgents);
  } catch (error) {
    throw new Error(error);
  }
}
