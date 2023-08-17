import sharp, { Sharp } from "sharp";
import { PREVIEW_SIZES } from "@/core";

export async function generatePreviewImages(dir: string, id: string, sharpedImage: Sharp) {
  return PREVIEW_SIZES.map((size) => {
    const imgPath = `${dir}/${id}_w${size}.webp`;

    return sharpedImage
      .clone()
      .withMetadata()
      .rotate()
      .resize(size, size, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .webp()
      .toFile(imgPath);
  });
}
