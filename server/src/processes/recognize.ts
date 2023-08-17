import { ENV, human } from "@/config";
import { logger } from "@/core";
import { predictFace } from "@/ml/predict";
import { getTaggedEmbeddings } from "@/services";
import { prisma } from "@mems/db";
import { DoneCallback, Job } from "bull";
import round from "lodash/round";

export async function recognition(job: Job, done: DoneCallback) {
  const { id, embedding } = job.data;

  const labelThreshold = job.data?.threshold ? job.data.threshold : ENV.FACE_THRESHOLD;

  // get verified faces
  const faces = await getTaggedEmbeddings();

  if (faces.length > 0 && embedding && embedding.length !== 0) {
    // return is object: { index: number, similarity: number, distance: number }
    // @ts-ignore
    const results = await predictFace(embedding, faces);

    console.log("prediction results: ", results);

    if (results && results.similarity > labelThreshold) {
      await prisma.facial_recognitions.update({
        where: {
          id,
        },
        data: {
          face_id: faces[results.index].face_id,
          name: faces[results.index].name,
          confidence: round(results.similarity * 100, 2),
          is_unknown_face: false,
        },
      });

      done();
    } else {
      logger.info("No result found");
      done();
    }
  } else {
    logger.info(`No verified descriptors found`);
    done();
  }
}
