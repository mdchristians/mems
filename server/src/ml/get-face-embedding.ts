import { human } from "@/config";
import { decodeImage } from "./utils";

export async function getFaceEmbedding(facePath: string) {
  const res = await decodeImage(facePath, human);

  return res.face[0].embedding;
}
