import { Request, Response } from "express";
import { createLessonWorkflow } from "../workflows/lessonWorkflow";

export const runLessonWorkflow = async (req: Request, res: Response) => {
  try {
    const { task, topic, grade } = req.body;
    const workflow = createLessonWorkflow();

    const result = await workflow.invoke({ task, topic, grade });

    res.json({
      success: true,
      task,
      data: result.response
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
