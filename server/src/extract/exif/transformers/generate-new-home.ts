import path from "path";
import { v4 as uuidv4 } from "uuid";
import { ENV } from "@/config";

type DateInfo = {
  date?: string;
  day?: string;
  month: string;
  year: string;
  extension: string;
};

/**
 * Generates the details to where the file will live in the destination directory
 *
 * @export
 * @param {DateInfo} { month, year, extension }
 * @return {*}
 */
export function generateNewHome({ month, year, extension }: DateInfo) {
  const id = uuidv4();
  const name = `${id}.${extension}`;
  const destDir = path.join(year, month, id);
  const destPath = path.join(destDir, name);
  const fullDir = path.join(ENV.MEDIA_DESTINATION, destDir);
  const fullPath = path.join(fullDir, name);

  return {
    id,
    dir: destDir,
    path: destPath,
    dest_dir: fullDir,
    dest_path: fullPath,
  };
}
