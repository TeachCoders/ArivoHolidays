import "dotenv/config";
import app, { sessionPool } from "./app.js";
import { prisma } from "./utils/prismaConnection.js";
import "./utils/cronJobs.js";
import { logger, registerGlobalErrorHandlers } from "./utils/logger.js";

registerGlobalErrorHandlers();

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.SESSION_SECRET) {
  console.error("FATAL: SESSION_SECRET is required in production. Exiting.");
  process.exit(1);
}

const server = app.listen(process.env.PORT, () => {
  logger.info(`Server running on port ${process.env.PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`Port ${process.env.PORT} is already in use`);
  } else {
    logger.error("Server start error", { message: err.message });
  }
  process.exit(1);
});

const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      sessionPool.end();
      logger.info("Database connections closed");
    } catch (err) {
      logger.error("Error during shutdown", { message: err.message });
    }
    process.exit(0);
  });
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
