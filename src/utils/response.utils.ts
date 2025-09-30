// response.utils.ts
import { Response } from "express";
import { HTTP_STATUS_CODES } from "../constants/status-code.constant";

export const successResponse = (
  res: Response,
  message: string,
  result?: unknown,
  statusCode: number = HTTP_STATUS_CODES.OK
) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    result,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};

export const badRequestErrorResponse = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS_CODES.BAD_REQUEST
) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};
