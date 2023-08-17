import express, { NextFunction, Request, Response } from "express";
import compression from "compression";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";

import { logger, expressLogger } from "@/core";
import { ENV } from "@/config";
import { api } from "@/api";
import { createContext } from "./api/trpc";

export async function createServer(): Promise<express.Express> {
  logger.info("Starting the server");

  const app = express();

  app.set("port", Number(ENV.PORT || 8080));
  app.set("env", ENV.NODE_ENV);

  app.use(expressLogger);
  app.use(compression());
  app.use(express.json({ limit: "200mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // Start the watcher after a delay
  setTimeout(() => {
    logger.info("Starting the watcher");
    require("./watcher");
  }, 3000);

  /**
   * Application Routes
   */
  app.use("/static", express.static(ENV.MEDIA_DESTINATION));
  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: api,
      createContext,
    })
  );

  // Print API errors
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`[server.ts] ${err.message}`);
    logger.error(err);
    return res.status(400).json({
      error: err.message,
    });
  });

  return app;
}
