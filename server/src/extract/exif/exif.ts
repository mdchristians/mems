import { logger } from "@/core";
import { exiftool } from "exiftool-vendored";
import { Sharp } from "sharp";
import {
  getAperture,
  getImageDimensions,
  getVideoDimensions,
  getDateTaken,
  getFileInfo,
  generateNewHome,
  getShutterSpeed,
  getGeoLocation,
} from "./transformers";
import { getMbFromExif, decimalToSeconds } from "@/utils";
import isNil from "lodash/isnil";
import { shouldGenerateMlImage } from "@/cast";

/**
 *
 * @param mediaPath - Path to the source image or video
 * @param sharpedImg - If the media object is a photo, a clone of the Sharp Image is sent
 * @returns
 */
export async function extractMetadata(mediaPath: string, sharpedImg?: Sharp) {
  try {
    // Extractors
    const exifTags = await exiftool.read(mediaPath);

    // Parsers
    const fileInfo = await getFileInfo(mediaPath);
    const geoData = getGeoLocation(exifTags);
    const date = await getDateTaken(exifTags, mediaPath);
    const dimensions = sharpedImg
      ? getImageDimensions(await sharpedImg.metadata(), exifTags)
      : getVideoDimensions(exifTags);

    // FileSize ex:
    const size = !isNil(exifTags.FileSize) ? getMbFromExif(exifTags.FileSize) : 10;

    return {
      ...generateNewHome({ ...date, extension: fileInfo.extension }),
      // ISO string, day, month, year
      ...date,
      // { height, width }
      ...dimensions,
      // source data and raw size
      ...fileInfo,
      // { gps_altitude, gps_latitude, gps_longitude }
      ...geoData,
      // '24 MB'
      ...(!isNil(exifTags.FileSize) && { size: getMbFromExif(exifTags.FileSize) }),
      // 'MOV'
      ...(!isNil(exifTags.FileType) && { format: exifTags.FileType }),
      // 'video/quicktime'
      ...(!isNil(exifTags.MIMEType) && { mime_type: exifTags.MIMEType }),
      // 2.1
      ...(!isNil(exifTags.Megapixels) && { mega_pixels: exifTags.Megapixels }),
      // Apple
      ...(!isNil(exifTags.Make) && { camera_make: exifTags.Make }),
      // iPhone 19
      ...(!isNil(exifTags.Model) && { camera_model: exifTags.Model }),
      ...(!isNil(exifTags.ColorSpace) && { color_space: exifTags.ColorSpace }),
      ...(!isNil(exifTags.SceneType) && { scene_type: exifTags.SceneType }),
      ...(!isNil(exifTags.UserComment) && { exif_comment: exifTags.UserComment }),

      // --- Photo Specific ---
      shutter_speed: getShutterSpeed(exifTags),
      aperture: getAperture(exifTags),
      ...(!isNil(exifTags.ISO) && { iso: exifTags.ISO }),
      ...(!isNil(exifTags.Flash) && { flash: exifTags.Flash }),
      ...(!isNil(exifTags.FocalLength) && { focal_length: exifTags.FocalLength }),
      ...(!isNil(exifTags.WhiteBalance) && { white_balance: exifTags.WhiteBalance }),
      ...(!isNil(exifTags.LensMake) && { lens_make: exifTags.LensMake }),
      ...(!isNil(exifTags.LensModel) && { lens_model: exifTags.LensModel }),
      ...(!isNil(exifTags.LensInfo) && { lens_info: exifTags.LensInfo }),

      // --- Video Specific ---
      // 12.7666666666667
      ...(!isNil(exifTags.Duration) && { duration: decimalToSeconds(exifTags.Duration.toString()) }),

      // 'mp4a' (For the following two - its okay if AudioFormat overwrites)
      ...(!isNil(exifTags.PurchaseFileFormat) && { audio_format: exifTags.PurchaseFileFormat }),
      ...(!isNil(exifTags.AudioFormat) && { audio_format: exifTags.AudioFormat }),

      // // maybe like compressor name?
      ...(!isNil(exifTags.Compression) && { compression: exifTags.Compression }),
      // 'avc1'
      ...(!isNil(exifTags.CompressorID) && { compressor_id: exifTags.CompressorID }),
      // 'H.264',
      // @ts-ignore
      ...(!isNil(exifTags.CompressorName) && { compressor_name: exifTags.CompressorName }),
      // 72,
      ...(!isNil(exifTags.XResolution) && { x_resolution: exifTags.XResolution }),
      // 72,
      ...(!isNil(exifTags.YResolution) && { y_resolution: exifTags.YResolution }),
      // 24,
      ...(!isNil(exifTags.BitDepth) && { bit_depth: exifTags.BitDepth }),
      // 30,
      ...(!isNil(exifTags.VideoFrameRate) && { video_frame_rate: exifTags.VideoFrameRate }),
      // '15.1 Mbps',
      ...(!isNil(exifTags.AvgBitrate) && { avg_bitrate: exifTags.AvgBitrate }),
      // 90
      ...(!isNil(exifTags.Rotation) && { rotation: exifTags.Rotation }),
      // helper!
      has_ml_image: shouldGenerateMlImage(size, fileInfo.extension),
    };
  } catch (err) {
    logger.error(err);
    throw new Error("Cannot get image metadata");
  }
}
