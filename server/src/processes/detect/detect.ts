import { Job, DoneCallback } from "bull";
import { detectFromImage } from "./detect-from-image";
import { detectFromVideo } from "./detect-from-video";

/**
 * A single detection process so we're not overloading the poor computer
 */
export async function detect(job: Job, done: DoneCallback) {
  const { detectionType } = job.data;

  if (detectionType === "video") {
    detectFromVideo(job, done);
  } else {
    detectFromImage(job, done);
  }
}
