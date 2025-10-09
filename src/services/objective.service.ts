import Objective from "../models/objective.model";
import { openai } from "../config/openAI";
import { OBJECTIVE_ENUMS } from "../constants";
import crypto from "crypto";

class ObjectiveService {
  async basePromptForTask(moduleType: OBJECTIVE_ENUMS) {
    switch (moduleType) {
      case OBJECTIVE_ENUMS.LEARNING_OBJECTIVE:
        return "Generate 3-5 measurable learning objectives in ABCD format.";
      case OBJECTIVE_ENUMS.CONNECTION_TO_PRIOR_KNOWLEDGE:
        return "List connections to prior knowledge and how this prepares students for future topics.";
      case OBJECTIVE_ENUMS.PRIMARY_PRESENTATION_FORM:
        return "Provide a clear lesson structure: introduction, general concepts, specific details, and summary.";
      case OBJECTIVE_ENUMS.EVIDENCE_BASED_STRATEGIES:
        return "Recommend evidence-based teaching strategies, with differentiation tips if relevant.";
      case OBJECTIVE_ENUMS.ZOOMING:
        return "Suggest ways to zoom in and out conceptually, connecting detailed ideas to big-picture concepts.";
      case OBJECTIVE_ENUMS.POWER_POINT:
        return "Suggest slide-level ideas and design suggestions for an engaging presentation.";
      default:
        throw new Error(`Unsupported module type: ${moduleType}`);
    }
  }

  async baseSystemPrompt(ctx: {
    topic: string;
    grade: string;
    subject?: string;
  }) {
    return `
  You are TeachMate AI, a helpful assistant for teachers.
  Always return clear, structured, and educationally sound content.
  
  Lesson Context:
  - Topic: ${ctx.topic}
  - Subject: ${ctx.subject || "Not specified"}
  - Grade: ${ctx.grade}
  `;
  }

  buildPrompt(payload: any) {
    const {
      topic,
      grade,
      subject,
      moduleType,
      instructions,
      previousTopic,
      noOfExamples,
    } = payload;

    switch (moduleType) {
      case OBJECTIVE_ENUMS.LEARNING_OBJECTIVE:
        return `
  Generate 3–5 measurable learning objectives for the topic "${topic}" for grade "${grade}" students in "${subject}".
  ${instructions ? `Follow these additional instructions: ${instructions}` : ""}
  Use clear, student-friendly language.
  Return only a JSON array of objectives, like:
  ["Objective 1", "Objective 2", "Objective 3"]
        `;

      case OBJECTIVE_ENUMS.CONNECTION_TO_PRIOR_KNOWLEDGE:
        return `
  Generate 3–5 objectives that connect the topic "${topic}" with prior knowledge from topics: ${
          previousTopic?.join(", ") || "N/A"
        }.
  ${instructions || ""}
  Return only a JSON array.
        `;

      case OBJECTIVE_ENUMS.PRIMARY_PRESENTATION_FORM:
        return `
  Generate ${
    noOfExamples || 3
  } examples of how the topic "${topic}" can be presented visually or interactively in a classroom.
  ${instructions || ""}
  Return only a JSON array.
        `;

      case OBJECTIVE_ENUMS.EVIDENCE_BASED_STRATEGIES:
        return `
  Generate 3–5 evidence-based teaching strategies for teaching "${topic}" to grade "${grade}" students.
  ${instructions || ""}
  Return only a JSON array.
        `;

      case OBJECTIVE_ENUMS.ZOOMING:
        return `
  Generate 3–5 zooming (deep dive) learning prompts to explore advanced aspects of "${topic}".
  ${instructions || ""}
  Return only a JSON array.
        `;

      case OBJECTIVE_ENUMS.POWER_POINT:
        return `
  Generate 5 slide titles and key points for a PowerPoint presentation about "${topic}".
  ${instructions || ""}
  Return only a JSON array.
        `;

      default:
        return `
  Generate 3–5 objectives for "${topic}".
  Return only a JSON array.
        `;
    }
  }
  generateModuleTitle(moduleType: OBJECTIVE_ENUMS, topic: string) {
    switch (moduleType) {
      case OBJECTIVE_ENUMS.LEARNING_OBJECTIVE:
        return `Learning Objectives for ${topic}`;
      case OBJECTIVE_ENUMS.CONNECTION_TO_PRIOR_KNOWLEDGE:
        return `Connecting ${topic} to Prior Knowledge`;
      case OBJECTIVE_ENUMS.PRIMARY_PRESENTATION_FORM:
        return `Lesson Presentation Plan for ${topic}`;
      case OBJECTIVE_ENUMS.EVIDENCE_BASED_STRATEGIES:
        return `Evidence-Based Strategies for Teaching ${topic}`;
      case OBJECTIVE_ENUMS.ZOOMING:
        return `Conceptual Zooming: Understanding ${topic}`;
      case OBJECTIVE_ENUMS.POWER_POINT:
        return `PowerPoint Outline for ${topic}`;
      default:
        return `Teaching Resource for ${topic}`;
    }
  }
  async generateAndSaveObjectives(
    topic: string,
    grade: string,
    instructions?: string,
    subject?: string,
    moduleType: OBJECTIVE_ENUMS = OBJECTIVE_ENUMS.LEARNING_OBJECTIVE,
    previousTopic?: string[],
    noOfExamples?: number
  ) {
    const systemPrompt = await this.baseSystemPrompt({ topic, grade, subject });
    const taskPrompt = this.buildPrompt({
      topic,
      grade,
      subject,
      moduleType,
      instructions,
      previousTopic,
      noOfExamples,
    });

    const title = this.generateModuleTitle(moduleType, topic);
    const finalPrompt = `${systemPrompt}\n${taskPrompt}`;

    const { choices } = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: finalPrompt },
      ],
    });

    let objectivesArray: string[] = [];
    const rawContent = choices[0].message?.content || "";

    const rawJoined = Array.isArray(rawContent)
      ? rawContent.join("\n")
      : rawContent;

    try {
      const cleanedJson = rawJoined
        .replace(/\n/g, "")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");

      const parsed = JSON.parse(cleanedJson);

      const flatten = (obj: any): string[] => {
        if (typeof obj === "string") return [obj.trim()];
        if (Array.isArray(obj)) return obj.flatMap(flatten);
        if (typeof obj === "object") {
          return Object.values(obj).flatMap(flatten);
        }
        return [];
      };

      objectivesArray = flatten(parsed);
    } catch (err) {
      objectivesArray = rawJoined
        .split(/[\n\r]+|•|-/)
        .map((line) => line.trim())
        .filter(Boolean);
    }
    objectivesArray = [...new Set(objectivesArray)].filter(Boolean);
    console.log("Saving objective with data:", objectivesArray);
    console.log(
      "Data type:",
      Array.isArray(objectivesArray),
      typeof objectivesArray
    );

    const objectiveDoc = new Objective({
      topic,
      grade,
      instructions,
      title,
      subject,
      moduleType,
      previousTopic,
      noOfExamples,
      data: objectivesArray,
      session: crypto.randomUUID(),
    });

    await objectiveDoc.save();
    return objectiveDoc;
  }

  async getAllObjectives() {
    return Objective.find().sort({ createdAt: -1 });
  }

  async getObjectiveById(id: string) {
    return Objective.findById(id);
  }

  async getHistory(id: string) {
    return Objective.findOne({ session: id });
  }

  async getTitle(moduleType?: string) {
    const query: any = {};
    if (moduleType) query.moduleType = moduleType;
    return Objective.find(query, { title: 1, _id: 0, session: 1 });
  }
}

export default new ObjectiveService();
