import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";

export interface LessonInput {
  task: string;
  topic: string;
  grade: string;
  constraints?: string;
  priorTaught?: string;      // for priorKnowledge
  preferredStyle?: string;   // for strategies/presentation
}

// ✅ System Prompt for HOST Method
const systemPrompt = (context: LessonInput) => `
You are TeachMate AI, an assistant that helps teachers plan and deliver effective lessons using the HOST framework.

HOST = 
H: Learning Objectives (ABCD format)
O: Linking Prior and Future Knowledge
S: Teaching Strategies (evidence-based, student-centered)
T: Lesson Structure and Presentation (general → specific, visual aids)

Your role:
- Always generate responses aligned with the HOST framework.
- Always use the lesson context provided by the teacher (Topic, Grade, Constraints, Prior Knowledge).
- Always respond in clear, structured JSON format as defined.
- If a teacher asks something unrelated to teaching or outside HOST, decline politely:
  "Sorry, I can only help with lesson planning using the HOST method."

Lesson Context:
- Topic: ${context.topic}
- Grade: ${context.grade}
${context.constraints ? `- Constraints: ${context.constraints}` : ""}
${context.priorTaught ? `- Prior Knowledge Students Have: ${context.priorTaught}` : ""}
${context.preferredStyle ? `- Preferred Teaching Style: ${context.preferredStyle}` : ""}
`;

const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

// 🔹 Define parsers for each task
const parsers = {
  objectives: StructuredOutputParser.fromZodSchema(
    z.object({
      objectives: z.array(z.string()),
    })
  ),
  priorKnowledge: StructuredOutputParser.fromZodSchema(
    z.object({
      connectionsToPrior: z.array(z.string()),
      connectionsToFuture: z.array(z.string()),
    })
  ),
  strategies: StructuredOutputParser.fromZodSchema(
    z.object({
      strategies: z.array(z.string()),
    })
  ),
  structure: StructuredOutputParser.fromZodSchema(
    z.object({
      introduction: z.string(),
      generalConcepts: z.array(z.string()),
      specificDetails: z.array(z.string()),
      summary: z.string(),
    })
  ),
  presentation: StructuredOutputParser.fromZodSchema(
    z.object({
      slideIdeas: z.array(z.string()),
      designSuggestions: z.array(z.string()),
    })
  ),
};

// 🔹 Prompt factory (with HOST system prompt)
function buildPrompt(
  task: string,
  formatInstructions: string,
  context: LessonInput
) {
  let basePrompt = "";

  switch (task) {
    case "objectives":
      basePrompt = `Generate 3-5 learning objectives in ABCD format for the lesson.`;
      break;
    case "priorKnowledge":
      basePrompt = `Based on what the teacher says students already know, suggest:
- How this prior knowledge connects to the new topic
- What future knowledge this topic prepares students for`;
      break;
    case "strategies":
      basePrompt = `Recommend effective teaching strategies for this lesson. Consider the teacher’s preferred style if given.`;
      break;
    case "structure":
      basePrompt = `Outline a structured lesson plan:
- Introduction
- General concepts
- Specific details
- Summary`;
      break;
    case "presentation":
      basePrompt = `Suggest presentation and visual aids:
- Slide ideas
- Design suggestions (consider teacher’s preferred style if given)`;
      break;
    default:
      throw new Error("Unsupported task");
  }

  return new PromptTemplate({
    template: `${systemPrompt(context)}\n\n${basePrompt}\n\nFormat the output as JSON strictly following these rules:\n{format_instructions}`,
    inputVariables: ["topic", "grade", "constraints", "priorTaught", "preferredStyle"],
    partialVariables: { format_instructions: formatInstructions },
  });
}

// 🔹 Main agent
export async function runLessonAgent(input: LessonInput) {
  const { task } = input;

  const parser = parsers[task as keyof typeof parsers];
  if (!parser) throw new Error("Unsupported task");

  const prompt = buildPrompt(task, parser.getFormatInstructions(), input);

  // 👇 ensure we pass all input vars, defaulting missing ones
  const inputPrompt = await prompt.format({
    topic: input.topic,
    grade: input.grade,
    constraints: input.constraints ?? "Not provided",
    priorTaught: input.priorTaught ?? "Not provided",
    preferredStyle: input.preferredStyle ?? "Not provided",
  });

  const response = await llm.invoke(inputPrompt);

  return await parser.parse(response.content as string);
}
