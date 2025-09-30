import app from "./app";
import { ENV } from "./config/env";
import logger from "./config/logger";
import connectDatabase from "./config/index";

connectDatabase();
app.listen(ENV.PORT, () => {
  logger.info(
    `🚀 Server running on http://localhost:${ENV.PORT} in ${ENV.NODE_ENV} mode`
  );
});
