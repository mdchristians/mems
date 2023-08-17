import path from "path";
import fs from "fs-extra";
import ffmpeg, { FfprobeData } from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid";
import { done } from "fastq";
import { prisma } from "@mems/db";
import { logger, queues } from "@/core";
import { extractMetadata } from "@/extract";
import { generatePreviewVideo, generateScreenshotsFromVideo } from "@/cast";

export async function processVideo(videoSourcePath: string, queueCallback: done) {
  logger.debug(`Processing video ${videoSourcePath}`);
  
  try {
    const metadata = await extractMetadata(videoSourcePath);
    const md = await ffprobeAsync(videoSourcePath);

    logger.trace("EXIF Data");
    logger.trace(metadata.duration);
    logger.trace(md.format.duration);

    const duration = md.format.duration || metadata?.duration || 0;
    const screenshotPath = path.join(metadata.dest_dir, "screenshots/");

    const screenshotOpts = {
      source: videoSourcePath,
      dest: screenshotPath,
      width: md.streams[0].width || 960,
      duration,
    };

    const previewOpts = {
      id: metadata.id,
      source: videoSourcePath,
      dest: metadata.dest_dir,
      duration,
    };

    fs.ensureDirSync(screenshotPath);

    await prisma.media.create({
      // @ts-ignore
      data: {
        ...metadata,
        media_type: "video",
      },
    });

    await generateScreenshotsFromVideo(screenshotOpts);
    await generatePreviewVideo(previewOpts);
    await fs.move(videoSourcePath, path.join(metadata.dest_dir, metadata.file_name));
    await queues.detect.add({
      detectionType: "video",
      mediaId: metadata.id,
      mediaPath: metadata.dest_dir,
    });

    queueCallback(null);
  } catch (err) {
    logger.error(err);
    queueCallback(null);
  }
}

export function ffprobeAsync(file: string): Promise<FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata);
    });
  });
}
