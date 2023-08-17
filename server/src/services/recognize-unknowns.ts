import { prisma } from "@mems/db";
import { queues } from "@/core";

/**
 * Runs all unknown face detections against our known embeddings
 */
export async function recognizeUnknowns() {
  const unknownFaces = await prisma.facial_recognitions.findMany({
    where: {
      is_unknown_face: true,
      is_removed: false,
    },
  });

  const queueAdditions = unknownFaces.map((face) => {
    return queues.recognition.add({
      id: face.id,
      embedding: face.embedding,
      threshold: 0.975,
    });
  });

  return Promise.all(queueAdditions);
}
