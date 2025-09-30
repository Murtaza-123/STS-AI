import { Router } from "express";
import objectiveController from "../controllers/objective.controller";

const router = Router();

router.post("/", objectiveController.createObjective);
router.get("/", objectiveController.getObjectives);
router.get("/:id", objectiveController.getObjectiveById);

export default router;
