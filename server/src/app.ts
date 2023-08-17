import "source-map-support/register";
import "@/config/dayjs";

import fs from "fs-extra";
import path from "path";
import process from "node:process";
import { createUnknownFace, ENV } from "@/config";
import { startQueue, logger } from "@/core";
import { createServer } from "./server";

process.on("beforeExit", (code) => {
  logger.info(`[app.ts] Process beforeExit event with code: ${code}`);
});

process.on("exit", (code) => {
  logger.info(`[app.ts] Process exit event with code: ${code}`);
});

process.on("uncaughtException", async (err) => {
  logger.error(err);
  logger.error("Uncaught exception", err.stack);
});

process.on("unhandledRejection", async (reason, p) => {
  logger.warn("Unhandled Rejection at: Promise", p);
  logger.warn("reason:", reason);
  // @ts-ignore
  console.dir("Stack: ", reason?.stack);
});

const bootstrap = async () => {
  // Start Express Server
  const app = await createServer();

  const server = app.listen(app.get("port"), () => {
    logger.info(`${ENV.NODE_ENV} Server running on port ${app.get("port")}`);
  });

  // Setup faces dir if it doesn't exist
  fs.ensureDir(path.join(ENV.MEDIA_DESTINATION, "faces"));

  await createUnknownFace();

  startQueue();

  return server;
};

bootstrap();
