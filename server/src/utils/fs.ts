import path from "node:path";
import round from "lodash/round";
import { logger } from "@/core";
import { imageExtensions } from "./constants";

export function isImage(filePath: string) {
  const extensions = new Set(imageExtensions);

  return extensions.has(path.extname(filePath).slice(1).toLowerCase());
}

export function isNonStandardImageFormat(ext: string) {
  return ["heic", "heif"].includes(ext.toLowerCase());
}

export function getMbFromExif(size: string): number {
  if (size.includes(" bytes")) {
    const bytes = Number(size.replace(" bytes", ""));
    const mb = bytes * 0.00000095367432;
    return round(mb, 2);
  } else if (size.includes(" KiB") || size.includes(" kB")) {
    const kib = Number(size.replace(" KiB", "").replace(" kB", ""));
    const mb = kib * 0.001024;
    return round(mb, 2);
  } else if (size.includes(" MiB") || size.includes(" MB")) {
    const mb = Number(size.replace(" MiB", "").replace(" MB", ""));
    return round(mb, 2);
  } else {
    logger.warn(size);
    throw new Error("size in not in bytes or KiB");
  }
}

// used to convert node stats size to mb
export function bytesToMb(size: number) {
  return round(size / (1024 * 1024), 2);
}
