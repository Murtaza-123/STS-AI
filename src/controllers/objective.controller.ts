import { Request, Response } from "express";
import objectiveService from "../services/objective.service";
import { successResponse, errorResponse } from "../utils/response.utils";

export const createObjective = async (req: Request, res: Response) => {
  try {
    const { topic, grade, subject, title, createdBy } = req.body;
    const objective = await objectiveService.generateAndSaveObjectives(
      topic,
      grade,
      subject,
      title
      // createdBy
    );

    return successResponse(res, "Objectives generated successfully", objective);
  } catch (error: any) {
    console.error("Objective Error:", error);
    return errorResponse(res, error.message || "Failed to generate objectives");
  }
};

export const getObjectives = async (req: Request, res: Response) => {
  try {
    const objectives = await objectiveService.getAllObjectives();
    return successResponse(res, "Objectives fetched successfully", objectives);
  } catch (error: any) {
    return errorResponse(res, error.message || "Failed to fetch objectives");
  }
};

export const getObjectiveById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const objective = await objectiveService.getObjectiveById(id);
    return successResponse(res, "Objective fetched successfully", objective);
  } catch (error: any) {
    return errorResponse(res, error.message || "Failed to fetch objective");
  }
};

export default {
  createObjective,
  getObjectives,
  getObjectiveById,
};
