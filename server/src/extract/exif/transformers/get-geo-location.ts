import { truncateNumber } from "@/utils";
import { Tags } from "exiftool-vendored";

interface TransformedGeo {
  altitude: number | null;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Extracts geo data from exif tags
 *
 * @export
 * @param {Tags} tags
 * @return {*}
 */
export function getGeoLocation(tags: Tags) {
  const { GPSAltitude, GPSLatitude, GPSLongitude, GPSPosition } = tags;

  let geo: TransformedGeo = {
    altitude: null,
    latitude: null,
    longitude: null,
  };

  // Example from exif: 214.403
  if (GPSAltitude) {
    geo.altitude = truncateNumber(GPSAltitude, 6);
  }

  // Example from exif: 41.8156
  if (GPSLatitude) {
    geo.latitude = truncateNumber(GPSLatitude, 6);
  }

  // Example from exif: -88.1828
  if (GPSLongitude) {
    geo.longitude = truncateNumber(GPSLongitude, 6);
  }

  // Example from exif: '41.8156 -88.1828'
  if (!GPSLatitude && !GPSLongitude && GPSPosition) {
    const gpsArray = GPSPosition.split(" ");

    if (gpsArray.length === 2) {
      geo.latitude = truncateNumber(Number(gpsArray[0]), 6);
      geo.longitude = truncateNumber(Number(gpsArray[1]), 6);
    }
  }

  return geo;
}
