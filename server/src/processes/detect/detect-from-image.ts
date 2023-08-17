import { v4 as uuidv4 } from "uuid";
import { imageDetection } from "@/ml";
import { logger, queues } from "@/core";
import { ENV } from "@/config";
import { prisma } from "@mems/db";
import { getOrCreateObjectOption } from "@/services";
import round from "lodash/round";
import fs from "fs-extra";
import path from "path";
import { Job, DoneCallback } from "bull";
import { extractFaceFromImage } from "@/cast/extract-face-from-image";

export async function detectFromImage(job: Job, done: DoneCallback) {
  const { imgId, imagePath, height, width } = job.data;
  let predictionQueue: any[] = [];

  if (!fs.existsSync(imagePath)) {
    logger.warn(`${imagePath} does not exist!`);
    return done();
  }

  if (!imgId || !imagePath) {
    logger.warn("No imgId or imagePath found!");
    return done();
  }

  try {
    /** generic box as [x, y, width, height] */
    const { face, object } = await imageDetection(imagePath);
    const unknownFace = await prisma.faces.findUniqueOrThrow({
      where: {
        name: "unknown",
      },
    });

    /**
     * HANDLE FACES
     * ====================
     */
    const faces = await Promise.all(
      face.map(async (person) => {
        const id = uuidv4();

        /** generic box as [x, y, width, height] */
        /** generic boxRaw as [x, y, width, height] as percent decimals (still need * 100) */
        // box: [ 691, 342, 220, 220 ],
        // boxRaw: [ 0.4321875, 0.3222013170272813, 0.1375, 0.20696142991533395 ],

        const bbHeight = (person.box[3] / height) * 100;
        const bbWidth = (person.box[2] / width) * 100;

        await extractFaceFromImage({
          sourcePath: imagePath,
          facePath: path.join(ENV.MEDIA_DESTINATION, "faces", `${id}.jpg`),
          xMin: person.box[0],
          xMax: person.box[0] + person.box[2],
          yMin: person.box[1],
          yMax: person.box[1] + person.box[3],
        });

        const prediction = queues.recognition.add({
          id,
          embedding: person.embedding,
        });

        predictionQueue.push(prediction);

        return {
          id,
          media_id: imgId,
          face_id: unknownFace.id,
          source: path.join(ENV.MEDIA_DESTINATION, "faces", `${id}.jpg`),
          embedding: person.embedding,
          x_min: person.box[0],
          x_max: person.box[0] + person.box[2],
          y_min: person.box[1],
          y_max: person.box[1] + person.box[3],
          x: round(person.boxRaw[0] * 100, 2),
          y: round(person.boxRaw[1] * 100, 2),
          height: round(person.boxRaw[3] * 100, 2),
          width: round(person.boxRaw[2] * 100, 2),
          is_unknown_face: true,
        };
      })
    );

    const facesPromise = prisma.facial_recognitions.createMany({
      data: faces,
    });

    /**
     * HANDLE OBJECTS
     * ====================
     */
    const objects = await Promise.all(
      object
        .filter((obj) => obj.score > ENV.OBJECT_THRESHOLD && obj.label !== "person")
        .map(async (obj) => {
          const id = uuidv4();
          const recognizedObject = await getOrCreateObjectOption(obj.label);

          const bbHeight = (obj.box[3] / height) * 100;
          const bbWidth = (obj.box[2] / width) * 100;

          return {
            id,
            media_id: imgId,
            object_id: recognizedObject.id,
            label: recognizedObject.name,
            confidence: round(obj.score * 100, 2),
            x_min: obj.box[0],
            x_max: obj.box[0] + obj.box[2],
            y_min: obj.box[1],
            y_max: obj.box[1] + obj.box[3],
            x: obj.box[0],
            y: obj.box[1],
            height: round(bbHeight, 2),
            width: round(bbWidth, 2),
          };
        })
    );

    const objectsPromise = prisma.object_recognitions.createMany({
      // @ts-ignore
      data: objects,
    });

    Promise.all([facesPromise, objectsPromise])
      .then(() => Promise.all(predictionQueue))
      .then(() => done())
      .catch((err) => {
        logger.error(`Error inserting new face or object recognitions for image: ${imagePath}`);
        logger.error(err);
        return done();
      });
  } catch (err) {
    logger.error("Detect error");
    logger.error(err);
    return done();
  }
}
