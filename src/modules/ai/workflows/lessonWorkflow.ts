import { StateGraph, END } from "@langchain/langgraph";
import { AIService } from "../services/ai.service";

const aiService = new AIService();

export type LessonState = {
  task: "objectives" | "priorKnowledge" | "strategies";
  topic: string;
  grade: string;
  response?: any;
};

export function createLessonWorkflow() {
  const workflow = new StateGraph<LessonState>({
    channels: {
      task: { type: "string" },
      topic: { type: "string" },
      grade: { type: "string" },
      response: { type: "any" },
    },
  });

  // Node: Objectives
  workflow.addNode("objectives", async (state: LessonState) => {
    const result = await aiService.generateObjectives(state.topic, state.grade);
    return { ...state, response: result };
  });

  // Node: Prior Knowledge
  workflow.addNode("priorKnowledge", async (state: LessonState) => {
    const result = await aiService.linkPriorKnowledge(state.topic, state.grade);
    return { ...state, response: result };
  });

  // Node: Strategies
  workflow.addNode("strategies", async (state: LessonState) => {
    const result = await aiService.suggestStrategies(state.topic, state.grade);
    return { ...state, response: result };
  });

  // ✅ Router node to choose the path based on task
  workflow.addNode("router", async (state: any) => {
    return state.task; // must match one of the node names
  });

  // ✅ Edges: start → router → chosen task → END
  workflow.addEdge("__start__", "router");
  workflow.addEdge("router", "objectives");
  workflow.addEdge("router", "priorKnowledge");
  workflow.addEdge("router", "strategies");

  workflow.addEdge("objectives", END);
  workflow.addEdge("priorKnowledge", END);
  workflow.addEdge("strategies", END);

  return workflow.compile();
}
