import { Request, Response } from "express";
import objectiveService from "../services/objective.service";
import { successResponse, errorResponse } from "../utils/response.utils";
import { OBJECTIVE_ENUMS } from "../constants/objective.constant";

export const createObjective = async (req: Request, res: Response) => {
  try {
    const {
      topic,
      grade,
      createdBy,
      instructions,
      subject,
      moduleType,
      previousTopic,
      noOfExamples,
    } = req.body;

    if (!topic || !grade) {
      return errorResponse(res, "Topic and grade are required fields", 400);
    }
    const validModuleType =
      moduleType && OBJECTIVE_ENUMS[moduleType as keyof typeof OBJECTIVE_ENUMS]
        ? moduleType
        : OBJECTIVE_ENUMS.LEARNING_OBJECTIVE;

    const objective = await objectiveService.generateAndSaveObjectives(
      topic,
      grade,
      instructions,
      subject,
      moduleType,
      previousTopic,
      noOfExamples
    );

    return successResponse(res, "Objectives generated successfully", objective);
  } catch (error: any) {
    console.error("Objective Error:", error);
    return errorResponse(
      res,
      error.message || "Failed to generate objectives",
      500
    );
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

const getHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    console.log(id, "id");
    const result = await objectiveService.getHistory(id as string);

    return successResponse(res, "History fetched successfully", result);
  } catch (error: any) {
    return errorResponse(res, error.message || "Failed to fetch history");
  }
};

const getTitle = async (req: Request, res: Response) => {
  try {
    const { module } = req.query;
    const result = await objectiveService.getTitle(module as string);

    return successResponse(res, "History fetched successfully", result);
  } catch (error: any) {
    return errorResponse(res, error.message || "Failed to fetch history");
  }
};

export default {
  createObjective,
  getObjectives,
  getObjectiveById,
  getHistory,
  getTitle,
};
