import { Router } from "express";
import { runLessonWorkflow } from "../controllers/ai.controller";

const router = Router();

router.post("/lesson", runLessonWorkflow);

export default router;
