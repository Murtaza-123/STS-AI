// testFunction.ts
import { Response, Request } from "express";
import { Test } from "../models";

const obj = {
  name: "test",
  age: 20,
};

const testFunction = async (req: Request, res: Response) => {
  try {
    const data = obj;
    return data;
  } catch (error: any) {
    throw error;
  }
};

const createTest = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const createTest = await Test.create(data);
    return createTest;
  } catch (error) {
    throw error;
  }
};

export default { testFunction, createTest };
