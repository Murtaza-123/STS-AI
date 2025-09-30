import Objective from "../models/objective.model";
import { openai } from "../config/openAI"; // assuming you have openai config setup

class ObjectiveService {
  async generateAndSaveObjectives(
    topic: string,
    grade: string,
    subject: string,
    title: string
    // createdBy?: string
  ) {
    const prompt = `Generate 2 learning objectives for ${grade} students on topic "${topic}" in subject "${subject}" using the ABCD model.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0].message?.content || "";
    const objectivesArray = content
      .split("\n")
      .filter((line) => line.trim() !== "");

    const objectiveDoc = new Objective({
      topic,
      grade,
      subject,
      title,
      objectives: objectivesArray,
      // createdBy,
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
}

export default new ObjectiveService();
