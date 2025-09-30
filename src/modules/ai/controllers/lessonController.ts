import { Request, Response } from "express";
import { z } from "zod";
import { runLessonAgent } from "../services/lessonService";

const ALLOWED_TASKS = [
  "objectives",
  "priorKnowledge",
  "strategies",
  "structure",
  "presentation",
];

const lessonSchema = z.object({
  task: z.string(),
  topic: z.string(),
  grade: z.string(),
});

export async function runLesson(req: Request, res: Response) {
  try {
    const parsed = lessonSchema.parse(req.body);

    if (!ALLOWED_TASKS.includes(parsed.task)) {
      return res.status(400).json({
        success: false,
        message:
          "Only teaching-related tasks are supported: objectives, priorKnowledge, strategies, structure, presentation.",
      });
    }

    const response = await runLessonAgent(parsed);

    res.json({
      success: true,
      task: parsed.task,
      response,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Invalid input",
    });
  }
}
