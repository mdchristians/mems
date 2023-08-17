import { logger } from "@/core";
import { prisma } from "@mems/db";

export async function doesImageExist(sourcePath: string) {
  try {
    const matchingImages = await prisma.media.findMany({
      where: {
        source_path: sourcePath,
      },
      select: { id: true },
    });

    return matchingImages.length > 0;
  } catch (err) {
    logger.error(err);
    throw new Error(`[doesImageExist] Could not check for duplicate image for ${sourcePath}`);
  }
}

export async function doesPhashExist(phash: string) {
  try {
    const matchingImages = await prisma.media.findMany({
      where: {
        phash,
      },
      select: { id: true },
    });

    return matchingImages.length > 0 ? matchingImages[0].id : false;
  } catch (err) {
    logger.error(err);
    throw new Error("[doesPhashExist] Could not check for duplicate image");
  }
}
