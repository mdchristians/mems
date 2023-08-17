/* eslint-disable no-useless-escape */
import chokidar from "chokidar";
import isVideo from "is-video";
import fastq from "fastq";
import type { queue, done } from "fastq";

import { isImage } from "@/utils";
import { logger } from "@/core";
import { ENV } from "@/config";
import { processImage } from "./image";
import { processVideo } from "./video";

type Task = {
  filePath: string;
};

// ts-ignore
const q: queue<Task> = fastq(processFile, 3);

/**
 * Watch the source directory
 */
const watcher = chokidar.watch(ENV.MEDIA_SOURCE, {
  usePolling: true,
  interval: 1000,
  binaryInterval: 3000,
  awaitWriteFinish: {
    stabilityThreshold: 5000,
    pollInterval: 1000,
  },
  // TODO: We can probably utilize this a bit better
  ignored: /(^|[\/\\])\../, // ignore dotfilesx
  persistent: true,
  depth: 10,
});

watcher.on("add", (filePath) => {
  q.push({ filePath });
});

watcher.on("error", (error) => logger.error(`Watcher error: ${error}`));
watcher.on("ready", () => {
  logger.trace(`Watcher watching ${ENV.MEDIA_SOURCE}`);
});

async function processFile(args: Task, queueCallback: done) {
  const { filePath } = args;
  logger.trace(`New File Detected: ${filePath.replace(ENV.MEDIA_SOURCE, "")}`);

  // Detect if the new file is a media file or not...
  const isImg = isImage(filePath);
  const isVid = isVideo(filePath);

  if (isImg || isVid) {
    try {
      isImg ? await processImage(filePath, queueCallback) : await processVideo(filePath, queueCallback);
    } catch (error) {
      logger.error(error);
    }
  } else {
    logger.warn(`Detected file is either unsupported or not a valid media file type: ${filePath}`);
    queueCallback(null);
  }
}
