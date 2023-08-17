import path from "path";
import fs from "fs-extra";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import type { done } from "fastq";
import { logger, queues, PREVIEW_SIZES } from "@/core";
import { phash } from "@/utils";
import { ENV } from "@/config";
import { generateMlImage, generatePreviewImages } from "@/cast";
import { prisma } from "@mems/db";

import { extractMetadata, getColors } from "@/extract";
import { doesImageExist, doesPhashExist } from "@/services";

/**
 * Main function for handling fs images found
 *
 * @param imgSourcePath
 * @param queueCallback
 *
 * TODO: because we allow users to keep image locations, we need to check that the image coming
 *       in's original location doesn't already exist in the db BEFORE processing
 */
export async function processImage(imgSourcePath: string, queueCallback: done) {
  try {
    // Read the image
    const inputBuffer = fs.readFileSync(imgSourcePath);
    const image = sharp(inputBuffer, { limitInputPixels: false });

    // Extractors
    const metadata = await extractMetadata(imgSourcePath, image);
    const colors = await getColors(imgSourcePath, metadata.extension, image);

    // Calc phash
    const imgPhash = await phash(image);
    const isPotentialDupe = await doesPhashExist(imgPhash);

    const imgPath = metadata.has_ml_image ? path.join(metadata.dest_dir, "ml.jpeg") : metadata.path;
    const previews = Object.fromEntries(
      PREVIEW_SIZES.map((size) => [size, `${metadata.dest_dir}/${metadata.id}_w${size}.webp`])
    );

    prisma.media
      .create({
        // @ts-ignore
        data: {
          ...metadata,
          ...colors,
          media_type: "photo",
          // @ts-ignore
          phash: imgPhash,
          previews: previews,
        },
      })
      .then(async () => {
        // Generate Images
        await fs.ensureDir(metadata.dest_dir);
        await generatePreviewImages(metadata.dest_dir, metadata.id, image);

        if (isPotentialDupe) {
          await prisma.duplicates.create({
            // @ts-ignore
            data: {
              id: uuidv4(),
              media_id: metadata.id,
              matching_media_id: isPotentialDupe,
            },
          });
        }

        if (metadata.has_ml_image) {
          await generateMlImage(image, imgPath);
        }

        if (ENV.SHOULD_MOVE_FILES) {
          // if (ENV?.MEDIA_ORIGINALS) {
          //   const subSrcPath = imgSourcePath.replace(ENV.MEDIA_SOURCE, "");
          //   const origPath = path.join(ENV.MEDIA_ORIGINALS, subSrcPath);

          //   await fs.copy(imgSourcePath, metadata.dest_path);
          //   return fs.move(imgSourcePath, origPath);
          // }

          // Just Move the file
          return fs.move(imgSourcePath, metadata.dest_path);
        }

        // just copy the file
        return fs.copy(imgSourcePath, metadata.dest_path);
      })
      .then(async () => {
        try {
          // Recognition Queue
          await queues.detect.add({
            imgId: metadata.id,
            imagePath: imgPath,
            height: metadata.height,
            width: metadata.width,
          });

          // Reverse Geo Queue
          await queues.geo.add({
            imgId: metadata.id,
            lat: metadata?.latitude,
            lon: metadata?.longitude,
          });
        } catch (err) {
          logger.error(err);
          queueCallback(null);
        } finally {
          queueCallback(null);
        }
      })
      .catch((err) => {
        logger.error(err);
        queueCallback(null);
      });
  } catch (err) {
    logger.error(err);
    queueCallback(null);
  }
}
