import Objective from "../models/objective.model";
import { openai } from "../config/openAI"; // assuming you have openai config setup
import { OBJECTIVE_ENUMS } from "../constants";

class ObjectiveService {
  async generateAndSaveObjectives(
    topic: string,
    grade: string,
    instructions?: string,
    title?: string,
    subject?: string,
    moduleType?: OBJECTIVE_ENUMS
    // createdBy?: string
  ) {
    const prompt = `
    You are an AI teaching assistant.
    Grade: ${grade}
    Topic: ${topic}
    ${instructions ? `Additional Instructions: ${instructions}` : ""}

    Generate 2 clear and measurable learning objectives using the ABCD model.
    `;

    const { choices } = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
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
      moduleType,
      subject,
      objectives: objectivesArray,
      session: crypto.randomUUID(),

      //createdBy,
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
    return Objective.find(query, { title: 1, _id: 0 });
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
