import isNil from "lodash/isnil";
import { Tags } from "exiftool-vendored";

/**
 * Extracts the aperture number from exif data if available
 *
 * @remarks
 * Different cameras support different tags, so we need to check a few before
 * returning null.
 *
 * @export
 * @param {Tags} tags
 * @return {*}  {(number | null)}
 */
export function getAperture(tags: Tags): number | null {
  if (!isNil(tags.Aperture)) return tags.Aperture;
  else if (!isNil(tags.FNumber)) return tags.FNumber;
  else if (!isNil(tags.ApertureValue)) return tags.ApertureValue;
  else return null;
}
