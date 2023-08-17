import fs from "fs-extra";
import { human } from "@/config";
const image = "/Users/rin/mems/server/test/images/test/test-2.jpg";

(async () => {
  // read file content into a binary buffer
  const buffer = fs.readFileSync(image);
  // decode jpg/png data to raw pixels
  const tensor = human.tf.node.decodeImage(buffer);
  // perform processing
  const result = await human.detect(tensor);
  // dispose input data, required when working with tensors
  human.tf.dispose(tensor);

  console.log(result);
  console.log(result.face[0].box);
  // console.log(JSON.stringify(result, null, 2));
})();
