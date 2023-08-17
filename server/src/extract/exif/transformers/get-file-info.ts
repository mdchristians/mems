import path from "path";
import fs from "fs-extra";
import { ENV } from "@/config";

/**
 * Extracts some of the original metadata from a file
 *
 * @export
 * @param {string} mediaPath
 * @return {*}
 */
export async function getFileInfo(mediaPath: string) {
  const localPath = mediaPath.replace(ENV.MEDIA_SOURCE, "");
  const { name, dir, ext, base } = path.parse(localPath);
  const { size } = await fs.stat(mediaPath);

  return {
    name,
    file_name: base,
    size_raw: size,
    source_dir: dir.replace("./", "/").replace(".", "/"),
    source_path: localPath,
    extension: ext.replace(".", ""),
  };
}
