import Vibrant from "node-vibrant";
import { Palette } from "@vibrant/color";
import { logger } from "@/core";
import { Sharp } from "sharp";
import { isNonStandardImageFormat, rgbObjToHex, toSwatch } from "@/utils";

export async function getColors(imgPath: string, imgExt: string, sharpedImage: Sharp) {
  try {
    const { dominant, entropy, sharpness, isOpaque } = await sharpedImage.stats();
    const palette = isNonStandardImageFormat(imgExt) ? {} : await getColorPalette(imgPath);

    return {
      palette,
      entropy,
      sharpness,
      is_opaque: isOpaque,
      dominant_color: rgbObjToHex(dominant),
    };
  } catch (err) {
    logger.error(err);
    throw new Error("Error getting colors");
  }
}

export async function getColorPalette(imagePath: string) {
  try {
    const palette: Palette = await Vibrant.from(imagePath).getPalette();

    if (!palette) {
      return {};
    }

    return {
      vibrant: toSwatch(palette.Vibrant),
      darkVibrant: toSwatch(palette.DarkVibrant),
      lightVibrant: toSwatch(palette.LightVibrant),
      muted: toSwatch(palette.Muted),
      darkMuted: toSwatch(palette.DarkMuted),
      lightMuted: toSwatch(palette.LightMuted),
    };
  } catch (err) {
    logger.error(err);
    return {};
  }
}
