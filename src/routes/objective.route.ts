import { Router } from "express";
import objectiveController from "../controllers/objective.controller";

const router = Router();

router.get("/history", objectiveController.getHistory);
router.get("/title", objectiveController.getTitle);

router.post("/", objectiveController.createObjective);
router.get("/", objectiveController.getObjectives);
router.get("/:id", objectiveController.getObjectiveById);
//router.post("/next-topic", objectiveController.generateNextTopicController);

export default router;
