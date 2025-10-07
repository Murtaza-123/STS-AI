import Objective from "../models/objective.model";
import { openai } from "../config/openAI"; // assuming you have openai config setup
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

  // async generateAndSaveObjectives(
  //   topic: string,
  //   grade: string,
  //   instructions?: string,
  //   title?: string,
  //   subject?: string,
  //   moduleType?: OBJECTIVE_ENUMS
  //   // createdBy?: string
  // ) {
  //   const prompt = `
  //   You are an AI teaching assistant.
  //   Grade: ${grade}
  //   Topic: ${topic}
  //   ${instructions ? `Additional Instructions: ${instructions}` : ""}

  //   Generate 2 clear and measurable learning objectives using the ABCD model.
  //   `;

  //   const { choices } = await openai.chat.completions.create({
  //     model: "gpt-4",
  //     messages: [{ role: "user", content: prompt }],
  //   });

  //   const objectivesArray = (choices[0].message?.content || "")
  //     .split("\n")
  //     .map((line) => line.trim())
  //     .filter(Boolean);

  //   const objectiveDoc = new Objective({
  //     topic,
  //     grade,
  //     instructions,
  //     title,
  //     moduleType,
  //     subject,
  //     objectives: objectivesArray,
  //     session: crypto.randomUUID(),

  //     //createdBy,
  //   });

  //   await objectiveDoc.save();

  //   return objectiveDoc;
  // }

  async generateAndSaveObjectives(
    topic: string,
    grade: string,
    instructions?: string,
    title?: string,
    subject?: string,
    moduleType: OBJECTIVE_ENUMS = OBJECTIVE_ENUMS.LEARNING_OBJECTIVE
  ) {
    const systemPrompt = this.baseSystemPrompt({ topic, grade, subject });
    const taskPrompt = this.basePromptForTask(moduleType);

    const userPrompt = `
  ${systemPrompt}
  ${instructions ? `Additional Instructions: ${instructions}\n` : ""}
  ${taskPrompt}
  `;

    const { choices } = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: await systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const objectivesArray = (choices[0].message?.content || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const objectiveDoc = new Objective({
      topic,
      grade,
      instructions,
      title,
      subject,
      moduleType,
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

  async getHistory(session?: string) {
    const query: any = {};
    if (session) query.session = session;
    return Objective.findOne(query);
  }

  async getTitle(moduleType?: string) {
    const query: any = {};
    if (moduleType) query.moduleType = moduleType;
    // Only return the 'title' field
    return Objective.find(query, { title: 1, _id: 0, session: 1 });
  }

  async generateNextTopicAndSave(
    grade: string,
    subject: string,
    previousTopics: string[],
    title: string,
    createdBy?: string
  ) {
    const currentTopic = previousTopics[previousTopics.length - 1] || "None";

    // Prompt ONLY for the next topic
    const topicPrompt = `
    You are a teaching assistant. 
    Grade: ${grade}
    Subject: ${subject}
    Previous topics covered: ${previousTopics.join(", ") || "None"}
    Current topic: ${currentTopic}
    
    Suggest the NEXT topic that should logically follow in the teaching roadmap. 
    Give only the topic title (no explanation).
    `;

    const topicCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: topicPrompt }],
    });

    const nextTopic =
      topicCompletion.choices[0].message?.content?.trim() ||
      "Next topic unavailable";

    // Prompt for learning objectives for the generated topic
    const objectivePrompt = `Generate 2 learning objectives for grade ${grade} in subject "${subject}" on topic "${nextTopic}" using the ABCD model.`;

    const objectiveCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: objectivePrompt }],
    });

    const objectivesArray =
      objectiveCompletion.choices[0].message?.content
        ?.split("\n")
        .filter((line) => line.trim() !== "") || [];

    // Save document
    const objectiveDoc = new Objective({
      topic: nextTopic,
      grade,
      subject,
      title,
      previousTopics,
      objectives: objectivesArray,
      createdBy,
    });

    await objectiveDoc.save();

    return objectiveDoc;
  }
}

export default new ObjectiveService();
