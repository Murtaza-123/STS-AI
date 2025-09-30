declare module "@langchain/langgraph" {
  export const END: "__end__";

  export class StateGraph<T> {
    constructor(config: { channels: Record<string, { type: string }> });

    addNode(name: string, fn: (state: T) => Promise<T> | T): void;

    // Edge to a fixed target node
    addEdge(from: string, to: string): void;

    // Edge that routes based on state
    addEdge(from: string, router: (state: T) => string): void;

    compile(): { invoke: (state: T) => Promise<T> };
  }
}
