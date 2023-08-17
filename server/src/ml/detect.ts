import fs from "fs-extra";
import { human } from "@/config";

export async function imageDetection(imgPath: string) {
  // read file content into a binary buffer
  const buffer = fs.readFileSync(imgPath);

  // decode jpg/png data to raw pixels
  const tensor = human.tf.node.decodeImage(buffer);

  // perform processing
  const result = await human.detect(tensor);

  // dispose input data, required when working with tensors
  human.tf.dispose(tensor);

  return result;
}
