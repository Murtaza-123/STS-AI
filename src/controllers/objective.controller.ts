import { Request, Response } from "express";
import objectiveService from "../services/objective.service";
import { successResponse, errorResponse } from "../utils/response.utils";

export const createObjective = async (req: Request, res: Response) => {
  try {
    const {
      topic,
      grade,
      createdBy,
      title,
      instructions,
      subject,
      moduleType,
    } = req.body;
    const objective = await objectiveService.generateAndSaveObjectives(
      topic,
      grade,
      instructions,
      title,
      subject,
      moduleType

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

// export const generateNextTopicController = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const data = req.body;
//     const result = await objectiveService.generateNextTopicAndSave(data);

//     return successResponse(res, "Next topic generated successfully", result);
//   } catch (error: any) {
//     console.error("Objective Error:", error);
//     return errorResponse(res, error.message || "Internal Server Error");
//   }
// };

const getHistory = async (req: Request, res: Response) => {
  try {
    const { session } = req.query;
    const result = await objectiveService.getHistory(session as string);

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
  //generateNextTopicController,
  getHistory,
  getTitle,
};
