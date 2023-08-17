import { v4 as uuidv4 } from "uuid";
import { imageDetection } from "@/ml";
import { logger, queues } from "@/core";
import { ENV } from "@/config";
import { prisma } from "@mems/db";
import { getOrCreateObjectOption, getTaggedEmbeddings } from "@/services";
import round from "lodash/round";
import fs from "fs-extra";
import path from "path";
import { Job, DoneCallback } from "bull";
import { extractFaceFromImage } from "@/cast/extract-face-from-image";
import asyncPool from "tiny-async-pool";
import { predictFace } from "@/ml/predict";
import uniqBy from "lodash/uniqBy";

/**
 * Detects and analyzes faces in screenshots from a video.
 *
 * Steps:
 *  1) Get all screenshots from screenshot path
 *  2)
 *
 * @param job
 * @param done
 * @returns
 */
export async function detectFromVideo(job: Job, done: DoneCallback) {
  const { mediaId, mediaPath } = job.data;
  let recognizedFaces: any[] = [];

  try {
    // Read screenshot directory to get all screenshots we need to analyze
    const screenshotPath = path.join(mediaPath, "screenshots");
    const files = await fs.readdir(screenshotPath);
    const knownFaceEmbeddings = await getTaggedEmbeddings();

    // Detect faces and objects in each screenshot
    asyncPool(3, files, async (filePath: string) => {
      /** generic box as [x, y, width, height] */
      const { face } = await imageDetection(filePath);

      /**
       * HANDLE FACES
       * ====================
       */
      const faces: any = await Promise.all(
        face.map(async (person) => {
          const id = uuidv4();
          const facePath = path.join(screenshotPath, "tmp", `${id}.jpg`);

          await extractFaceFromImage({
            sourcePath: filePath,
            facePath,
            xMin: person.box[0],
            xMax: person.box[0] + person.box[2],
            yMin: person.box[1],
            yMax: person.box[1] + person.box[3],
          });

          // return is object: { index: number, similarity: number, distance: number }
          // @ts-ignore
          const results = await predictFace(person?.embedding || "", knownFaceEmbeddings);

          if (results && results.similarity > ENV.FACE_THRESHOLD) {
            return {
              id,
              media_id: mediaId,
              face_id: faces[results.index].face_id,
              name: faces[results.index].name,
              confidence: round(results.similarity * 100, 2),
            };
          }

          return;
        })
      );

      recognizedFaces.push(...faces);
      return;
    });

    // remove dupes
    const uniqueFaces = uniqBy(recognizedFaces, "face_id");

    await prisma.video_recognitions.createMany({
      data: uniqueFaces,
    });

    done();
  } catch (err) {
    logger.error("Detect error");
    logger.error(err);
    return done();
  }
}
