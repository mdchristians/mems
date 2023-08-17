import ffmpeg from "fluent-ffmpeg";
import { logger } from "@/core";
import round from "lodash/round";
import { getDurationInSeconds } from "@/extract";

export type GnerateScreenshotsFromVideoParams = {
  source: string;
  dest: string;
  width: string | number;
  // will be something like "11:16" or 11.261261
  duration: string | number;
};

export async function generateScreenshotsFromVideo({
  source,
  dest,
  width,
  duration = 60,
}: GnerateScreenshotsFromVideoParams) {
  const seconds = getDurationInSeconds(duration);
  
  // If the duration is less than 6 it returns undefined
  const screenshotsToCast = round(seconds / 6) || 1;
  const count = screenshotsToCast < 21 ? screenshotsToCast : 20;
  ffmpeg(source, { logger })
    .on("end", () => {
      logger.info(`Screenshot created for ${source}`);
      return;
    })
    .on("error", (err: Error) => {
      logger.error(`Screenshot creation failed for ${source}`);
      logger.error(err);

      return [];
    })
    .screenshots({
      count,
      filename: "screenshot-%i.jpg",
      folder: dest,
      size: `${width}x?`,
    });
}
