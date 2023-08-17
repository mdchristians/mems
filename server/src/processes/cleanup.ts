import path from "path";
import fs from "fs-extra";
import { ENV } from "@/config";

export async function cleanup() {
  const dir = ENV.MEDIA_DESTINATION;
  await removeEmptyDirectories(dir);
}

async function removeEmptyDirectories(directory: string) {
  // lstat does not follow symlinks (in contrast to stat)
  const fileStats = await fs.lstat(directory);
  if (!fileStats.isDirectory()) {
    return;
  }
  let fileNames = await fs.readdir(directory);
  if (fileNames.length > 0) {
    const recursiveRemovalPromises = fileNames.map((fileName) =>
      removeEmptyDirectories(path.join(directory, fileName))
    );
    await Promise.all(recursiveRemovalPromises);

    // re-evaluate fileNames; after deleting subdirectory
    // we may have parent directory empty now
    fileNames = await fs.readdir(directory);
  }

  if (fileNames.length === 0) {
    console.log("Removing: ", directory);
    await fs.rmdir(directory);
  }
}
