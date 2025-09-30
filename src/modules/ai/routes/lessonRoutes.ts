import { Router } from "express";
import { runLesson } from "../controllers/lessonController";

const lesrouter = Router();

lesrouter.post("/run", runLesson);

export default lesrouter;
