import Queue from "bull";
import { ENV } from "../config/env";
import { logger } from "@/core/logger";

import { detect, recognition, reverseGeo } from "@/processes";
import EventEmitter from "node:events";

const connection = {
  defaultJobOptions: {
    attempts: 3,
    timeout: 60000,
    backoff: {
      type: "exponential",
      delay: 3 * 60 * 1000,
    },
    removeOnComplete: true,
    removeOnFail: true,
  },
  redis: {
    host: ENV.REDIS_HOST,
    port: ENV.REDIS_PORT,
    connectTimeout: 30000,
  },
};

export const queues: { [key: string]: Queue.Queue } = {
  detect: new Queue("Image Detection", connection),
  recognition: new Queue("Image Recognition", connection),
  geo: new Queue("Reverse Geo", connection),
};

// Set defaultMaxListeners to default + amt of queues
EventEmitter.defaultMaxListeners = Object.keys(queues).length + EventEmitter.defaultMaxListeners;

// Set event loggers
Object.keys(queues).forEach((name) => {
  const queue = queues[name];

  queue.on("active", function (job) {
    logger.info(`Job started name: ${name} id: ${job.id}`);
  });

  queue.on("complete", function (job) {
    logger.info(`Job completed name: ${name} id: ${job.id}`);
  });

  queue.on("global:stalled", (id) => {
    logger.warn("Job stalled", { jobId: id });
  });

  queue.on("error", (err) => {
    logger.error(`Error occurred while processing queue ${name}: ${err}`);
  });

  queue.on("failed", async (job, err) => {
    logger.error(`Error occurred while processing job id: ${job.id} on queue name: ${name}`);
    logger.error(err);
  });
});

export const startQueue = (): void => {
  queues.detect.process(1, detect);
  queues.recognition.process(1, recognition);
  queues.geo.process(1, reverseGeo);

  logger.info(`Queue process started`);
};

export const stopQueue = async (): Promise<void> => {
  await Promise.all([queues.detect.close(), queues.recognition.close(), queues.geo.close()]);
};
