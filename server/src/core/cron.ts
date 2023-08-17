import cron from "node-cron";
import { cleanup } from "@/processes/cleanup";
import { logger } from "./logger";

// Runs at 2 AM
export const cleanupCron = cron.schedule("0 2 * * *", async () => {
  logger.info("Running scheduled CRON task - Cleanup");
  await cleanup();
});
