import express from "express";
import cors from "cors";
import morgan from "morgan";
import aiRoute from "./modules/ai/routes/ai.route";
import healthRoute from "./routes/health.route";
import { notFoundHandler } from "./middlewares/notFoundHandler";
import { errorHandler } from "./middlewares/errorHandler";
import lesrouter from "../src/modules/ai/routes/lessonRoutes";
import routes from "./routes/index";
// modules/ai/routes/lessonRoutes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(morgan("dev"));

app.use("/api/lesson", lesrouter);
// Routes
app.use("/", routes);
// app.use("/api/ai", aiRoute);

// Not found handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
