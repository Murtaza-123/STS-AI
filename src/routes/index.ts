import { Router } from "express";
import healthRoute from "./health.route";
import objectiveRoute from "./objective.route";
const router = Router();

router.use("/", healthRoute);
router.use("/objective", objectiveRoute);
export default router;
