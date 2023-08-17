import { human } from "@/config";
import { logger } from "@/core";

type Descriptor = {
  id: string;
  name: string;
  embedding: number[];
};

export async function predictFace(embedding: number[], embeddingArray: Descriptor[]) {
  // build array with just embeddings
  const embeddings = embeddingArray.map((face) => face.embedding);

  logger.info(`Comparing against ${embeddings.length} known embeddings!`);

  // return is object: { index: number, similarity: number, distance: number }
  return human.match(embedding, embeddings);
}
