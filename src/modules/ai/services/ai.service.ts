import { openai } from "../../../config/openAI";

export class AIService {
  async generateObjectives(topic: string, grade: string) {
    const prompt = `Generate 2 learning objectives for ${grade} on topic "${topic}" using the ABCD model.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return completion.choices[0].message?.content;
  }

  async linkPriorKnowledge(topic: string, grade: string) {
    const prompt = `Link topic "${topic}" for ${grade} with prior knowledge and future concepts.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return completion.choices[0].message?.content;
  }

  async suggestStrategies(topic: string, grade: string) {
    const prompt = `Suggest 2 evidence-based teaching strategies for topic "${topic}" in ${grade}.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return completion.choices[0].message?.content;
  }
}
