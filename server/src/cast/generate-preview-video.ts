import ffmpeg from "fluent-ffmpeg";
import { logger } from "@/core";
import round from "lodash/round";
import { getDurationInSeconds } from "@/extract";
import path from "path";
import { execa } from "execa";

export type GenerateScreenshotsFromVideoParams = {
  id: string;
  source: string;
  dest: string;
  // will be something like "11:16" or 11.261261
  duration: string | number;
};

const getLastLine = (t: string, idx: number) => {
  return `[v${idx}]`;
};
const formatArgs = (t: string, idx: number) => {
  return `[0:v]trim=${t}:${Number(t) + 2},setpts=PTS-STARTPTS[v${idx}];`;
};

export async function generatePreviewVideo({
  id,
  source,
  dest,
  duration,
}: GenerateScreenshotsFromVideoParams) {
  let previewPromise;
  const previewOutput = path.join(dest, "preview.mp4");
  const outputOutput = path.join(dest, `${id}.mp4`);
  const durationInSeconds = getDurationInSeconds(duration);
  const timestamps = getTimestamps(durationInSeconds);

  logger.info(`Generating preview for ${source}`);
  logger.info(`-> With ${timestamps.length} timestamps for ${durationInSeconds} seconds`);

  const H264 = ["-c:v", "libx264", "-preset", "fast", "-tune", "zerolatency", "-crf", "22"];
  const H264Two = ["-c:v", "libx264", "-preset", "fast"];

  // less than 15 seconds
  if (timestamps.length === 0) {
    previewPromise = execa("ffmpeg", ["-i", source, ...H264, "-f", "mp4", "-an", previewOutput]);
  } else {
    const clips = timestamps
      .map((t, idx) => `[0:v]trim=${t}:${Number(t) + 2},setpts=PTS-STARTPTS[v${idx}];`)
      .join(" ");

    const trims = timestamps.map(formatArgs).join(" ");
    const lastLineStart = timestamps.map(getLastLine).join("");
    const lastLine = `${lastLineStart}concat=n=${timestamps.length}:v=1:a=0[out]`;
    const filterComplexArgs = `${trims} ${lastLine}`;

    previewPromise = execa("ffmpeg", [
      "-i",
      source,
      "-filter_complex",
      filterComplexArgs,
      "-map",
      "[out]",
      ...H264,
      "-f",
      "mp4",
      "-an",
      previewOutput,
    ]);
  }

  let outputPromise = execa("ffmpeg", ["-i", source, ...H264Two, "-f", "mp4", outputOutput]);

  return Promise.all([previewPromise, outputPromise]);
}

const getTimestamps = (duration: number) => {
  logger.info("getting timestamps");
  switch (true) {
    case duration < 14:
      return [];
    case duration < 15:
      return [2, 6, 8];
    case duration < 20:
      return [2, 6, 11];
    case duration < 25:
      return [5, 10, 15];
    case duration < 30:
      return [4, 8, 12, 16, 20];
    default:
      const sec = round(duration / 6);
      const arr = Array.from({ length: 7 }, (el, idx) => {
        const num = idx * sec;

        return num.toString().length === 1 ? `${num}` : `${sec}`;
      });

      return arr;
  }
};
