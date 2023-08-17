import isNil from "lodash/isnil";
import { Tags } from "exiftool-vendored";

/**
 * [getShutterSpeed description]
 * @param  {[type]} tags [description]
 * @return {[type]}      [description]
 */
export function getShutterSpeed(tags: Tags): string | null {
  if (!isNil(tags.ShutterSpeed)) return tags.ShutterSpeed;
  else if (!isNil(tags.ExposureTime)) return tags.ExposureTime;
  else if (!isNil(tags.ShutterSpeedValue)) return tags.ShutterSpeedValue;
  else return null;
}
