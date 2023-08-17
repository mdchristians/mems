import { logger } from "@/core";
import round from "lodash/round";

export function getDurationInSeconds(duration: string | number) {
  logger.trace(`Converting video duration of length ${duration} and type of ${typeof duration}`);

  if (typeof duration === "string") {
    if (duration.includes(":")) {
      const durationArray = duration.split(":").map((value) => Number(value));

      if (durationArray.length === 2) {
        return round(Number(duration.replace(":", ".")), 2);
      }
      // This means we uploaded a video that is using the "minutes" position, which shouldn't
      // be common as even 5 minute videos are showing up as seconds (ex: 336:30)
      return round(Number(durationArray[0] * 60) + Number(durationArray[1]) + durationArray[2], 2);
    }

    // Usually just a decimal
    return round(Number(duration), 2);
  }

  return round(duration, 2);
}
