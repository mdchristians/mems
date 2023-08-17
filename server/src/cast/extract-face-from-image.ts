import fs from "fs-extra";
import sharp from "sharp";

export interface ExtractFaceFromImageParams {
  /** Image to pull the face from */
  sourcePath: string;
  /** Where to save the output face */
  facePath: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/**
 * Extracts a face from an image using coordinates and outputs the extracted face
 */
export function extractFaceFromImage({
  sourcePath,
  facePath,
  xMin,
  xMax,
  yMin,
  yMax,
}: ExtractFaceFromImageParams) {
  const inputBuffer = fs.readFileSync(sourcePath);

  return sharp(inputBuffer, { limitInputPixels: false })
    .rotate()
    .extract({
      left: xMin,
      top: yMin,
      width: xMax - xMin,
      height: yMax - yMin,
    })
    .jpeg({
      quality: 100,
      chromaSubsampling: "4:4:4",
    })
    .toFile(facePath);
}
