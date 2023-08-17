import type { Tags } from "exiftool-vendored";
import type { Metadata } from "sharp";

/**
 * Extracts the height, width and orientation of an image
 *
 * @remarks
 * In this case, we're prefering the exif data from exiftool-vendored, but fall back to sharp's metadata
 *
 * @export
 * @param {Metadata} sharpMetadata
 * @param {Tags} tags
 * @return {*}
 */
export function getImageDimensions(sharpMetadata: Metadata, tags: Tags) {
  const height = tags?.ImageHeight
    ? tags.ImageHeight
    : sharpMetadata?.height
    ? sharpMetadata.height
    : null;
  const width = tags?.ImageWidth ? tags.ImageWidth : sharpMetadata?.width ? sharpMetadata.width : null;
  const orientation = tags?.Orientation
    ? tags.Orientation
    : sharpMetadata?.orientation
    ? sharpMetadata.orientation
    : null;

  if (height && width && orientation) {
    if (orientation || 0 >= 5) {
      return {
        orientation,
        height: width,
        width: height,
        adjusted_orientation: true,
      };
    }
  }

  return {
    height: height ?? 0,
    width: width ?? 0,
    orientation,
  };
}

/**
 * Extracts the height and width of a video
 *
 * @export
 * @param {Tags} tags
 * @return {*}
 */
export function getVideoDimensions(tags: Tags) {
  const {
    ImageWidth,
    ImageHeight,
    ImageSize,
    SourceImageWidth,
    SourceImageHeight,
    EncodedPixelsDimensions,
    ProductionApertureDimensions,
    CleanApertureDimensions,
  } = tags;

  let dims = {
    height: 0,
    width: 0,
  };

  // Width
  if (ImageWidth) dims.width = ImageWidth;
  else if (SourceImageWidth) dims.width = SourceImageWidth;

  // Height
  if (ImageHeight) dims.height = ImageHeight;
  else if (SourceImageHeight) dims.height = SourceImageHeight;

  if (dims.height === 0 && dims.width === 0) {
    if (ImageSize) dims = getDimsFromString(ImageSize);
    else if (EncodedPixelsDimensions) dims = getDimsFromString(EncodedPixelsDimensions);
    else if (ProductionApertureDimensions) dims = getDimsFromString(ProductionApertureDimensions);
    else if (CleanApertureDimensions) dims = getDimsFromString(CleanApertureDimensions);
  }

  return dims;
}

function getDimsFromString(dims: string) {
  const [width, height] = dims.split("x");

  return {
    height: Number(height),
    width: Number(width),
  };
}
