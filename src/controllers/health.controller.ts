import { Request, Response } from "express";
import {
  successResponse,
  errorResponse,
  badRequestErrorResponse,
} from "../utils/response.utils";
import healthService from "../services/health.service";

export const healthCheck = (req: Request, res: Response) => {
  return successResponse(res, "AI Agent API is healthy 🚀");
};

const testFunction = async (req: Request, res: Response) => {
  try {
    const data = await healthService.testFunction(req, res);
    return successResponse(res, "Request successful", data);
  } catch (error: any) {
    console.error("API Error:", error);
    if (error.name === "ValidationError") {
      return badRequestErrorResponse(res, error.message);
    }
    return errorResponse(res, error.message || "Internal Server Error");
  }
};

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await healthService.createTest(req, res);
    return successResponse(res, "Request successful", result);
  } catch (error: any) {
    console.error("API Error:", error);
    if (error.name === "ValidationError") {
      return badRequestErrorResponse(res, error.message);
    }
    return errorResponse(res, error.message || "Internal Server Error");
  }
};

export default {
  healthCheck,
  testFunction,
  createUser,
};
