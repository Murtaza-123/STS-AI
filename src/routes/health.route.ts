import { Router } from "express";
import { healthController } from "../controllers/index";

const router = Router();

router.get("/health", healthController.healthCheck);
router.get("/test", healthController.testFunction);
router.post("/create", healthController.createUser);

export default router;
