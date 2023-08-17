import pino, { LoggerOptions } from "pino";
import type { RequestHandler } from "express";
import pinoHTTP from "pino-http";
import childProcess from "child_process";
import stream from "stream";
import { ENV } from "@/config";
import path from "path";

const logPath = path.join(ENV.LOGS, "log");
const cwd = process.cwd();
const { env } = process;

let options: LoggerOptions = {
  level: ENV.LOG_LEVEL || "info",
};

if (ENV.NODE_ENV !== "production") {
  options.prettyPrint = true;
  options.prettifier = require("pino-colada");
}

// Create a stream where the logs will be written
const logThrough = new stream.PassThrough();

const child = childProcess.spawn(
  process.execPath,
  [
    require.resolve("pino-tee"),
    "warn",
    `${logPath}/warn.log`,
    "error",
    `${logPath}/error.log`,
    "fatal",
    `${logPath}/fatal.log`,
  ],
  { cwd, env, stdio: ["pipe", "inherit", "inherit"] }
);

logThrough.pipe(child.stdin);

export const logger = pino(options);

export const expressLogger = pinoHTTP({
  // @ts-ignore
  logger,
}) as RequestHandler;
