import sharp, { Sharp } from "sharp";
import { isNonStandardImageFormat } from "@/utils";

export async function generateMlImage(sharpedImage: Sharp, mlPath: string) {
  return sharpedImage
    .clone()
    .withMetadata()
    .rotate()
    .resize(1600, 1600, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .jpeg()
    .toFile(mlPath);
}

export function shouldGenerateMlImage(size: number, extension: string): boolean {
  // If the image is a standard format (ie something we can process)
  if (isNonStandardImageFormat(extension)) {
    return true;
  }

  // Image is too big to handle, let's downsize to help tensorflow
  if (size > 3.5) {
    return true;
  }

  return false;
}
