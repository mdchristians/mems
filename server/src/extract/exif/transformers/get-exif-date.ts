import fs from "fs-extra";
import isNil from "lodash/isnil";
import { Tags } from "exiftool-vendored";
import dayjs from "dayjs";
import { logger } from "@/core";

/**
 * getDateTaken
 *
 * Parses through some of the exif tags and tries to figure out when the media file
 * was originally taken/created.
 *
 * @param  {object} tags - the exif tags from the photo/video
 * @param  {boolean} mediaPath - Path to the file itself
 */
export async function getDateTaken(tags: Tags, mediaPath: string) {
  const date = await readExifDate(tags, mediaPath);

  return {
    date,
    day: dayjs(date).format("DD"),
    month: dayjs(date).format("MMMM"),
    year: dayjs(date).format("YYYY"),
  };
}

// 0000:00:00 00:00:00

async function readExifDate(tags: Tags, mediaPath: string) {
  // CreationDate
  if (!isNil(tags.CreationDate) && dayjs(tags.CreationDate).isValid()) {
    logger.trace(`using CreationDate as date, value: ${tags.CreationDate}`);
    return dayjs(tags.CreationDate).toISOString();
  }

  // DateTimeCreated
  if (!isNil(tags.DateTimeCreated) && dayjs(tags.DateTimeCreated).isValid()) {
    logger.trace(`using DateTimeCreated as date, value: ${tags.DateTimeCreated}`);
    return dayjs(tags.DateTimeCreated).toISOString();
  }

  // CreateDate
  else if (!isNil(tags.CreateDate) && dayjs(tags.CreateDate).isValid()) {
    logger.trace(`using CreateDate as date, value: ${tags.CreateDate}`);
    return dayjs(tags.CreateDate).toISOString();
  }

  // DateTimeOriginal
  else if (!isNil(tags.DateTimeOriginal) && dayjs(tags.DateTimeOriginal).isValid()) {
    logger.trace(`using DateTimeOriginal as date, value: ${tags.DateTimeOriginal}`);
    return dayjs(tags.DateTimeOriginal).toISOString();
  }

  // DateCreated
  else if (!isNil(tags.DateCreated) && dayjs(tags.DateCreated).isValid()) {
    logger.trace(`using DateCreated as date, value: ${tags.DateCreated}`);
    return dayjs(tags.DateCreated).toISOString();
  }

  // MetadataDate
  else if (!isNil(tags.MetadataDate) && dayjs(tags.MetadataDate).isValid()) {
    logger.trace(`using MetadataDate as date, value: ${tags.MetadataDate}`);
    return dayjs(tags.MetadataDate).toISOString();
  }

  // MediaCreateDate (found in videos)
  else if (!isNil(tags.MediaCreateDate) && dayjs(tags.MediaCreateDate).isValid()) {
    logger.trace(`using MediaCreateDate as date, value: ${tags.MediaCreateDate}`);
    return dayjs(tags.MediaCreateDate).toISOString();
  }

  // TrackModifyDate (found in videos)
  else if (!isNil(tags.TrackModifyDate) && dayjs(tags.TrackModifyDate).isValid()) {
    logger.trace(`using TrackModifyDate as date, value: ${tags.TrackModifyDate}`);
    return dayjs(tags.TrackModifyDate).toISOString();
  }

  // ModifyDate
  else if (!isNil(tags.ModifyDate) && dayjs(tags.ModifyDate).isValid()) {
    logger.trace(`using ModifyDate as date, value: ${tags.ModifyDate}`);
    return dayjs(tags.ModifyDate).toISOString();
  }

  // ProfileDateTime
  // @ts-ignore
  else if (!isNil(tags.ProfileDateTime) && dayjs(tags.ProfileDateTime).isValid()) {
    // @ts-ignore
    logger.trace(`using ProfileDateTime as date, value: ${tags.ProfileDateTime}`);
    // @ts-ignore
    return dayjs(tags.ProfileDateTime).toISOString();
  }

  // fail safe
  else {
    const { birthtime } = await fs.stat(mediaPath);

    if (birthtime) {
      return dayjs(birthtime).toISOString();
    } else {
      logger.trace("Unable to parse a recognizable date for image");
      return new Date("1999-12-29 01:01:01-05:00").toISOString();
    }
  }
}
