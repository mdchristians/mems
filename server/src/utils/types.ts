import type { Sharp } from "sharp";

export interface ImageData {
  /** Original image name (without period) */
  name: string;
  /** Original directory path of the image */
  sourceDir: string;
  /** Complete path to the original image */
  sourcePath: string;
  /** Generated ID of the image */
  id: string;
  /** Size of the original image */
  size: number;
  /** Original height of the image */
  height: number;
  /** Original width of the image */
  width: number;
  /** Original image extension (without period) */
  extension: string;
  /** Desination path of the image,*/
  dir: string;
  /** Complete path to the image */
  path: string;
  /** A "Sharped" copy of the image */
  sharpedImage: Sharp;
}
