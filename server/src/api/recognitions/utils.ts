import { imageDetection } from "@/ml";

export async function getConfidence(imagePath: string, name: string) {
  const data = await imageDetection(imagePath);
  const predictions = data.face;

  // .result[0]['subjects'].find((el) => el.subject === name);

  return predictions ?? null;
}