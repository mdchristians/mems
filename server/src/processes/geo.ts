import { geocoder } from "@/config";
import { logger } from "@/core";
import { ENV } from "@/config";
import { getOrCreateLocationOption } from "@/services";
import { prisma } from "@mems/db";
import { Job, DoneCallback } from "bull";

export type GeoData = {
  city?: string;
  state?: string;
  zipcode?: string;
  place?: string;
};

export async function reverseGeo(job: Job, done: DoneCallback) {
  const { imgId, lat, lon } = job.data;

  let geo: GeoData = {};

  if (!ENV.USE_GEO) {
    logger.info("[Reverse-Geo]: GEO OFF, SKIPPING...");
    done(null);
    return Promise.resolve();
  }

  if (ENV.NODE_ENV !== "production") {
    logger.info("[Reverse-Geo]: Not in production, skipping geo");
    done(null);
    return Promise.resolve();
  }

  if (!lat || !lon) {
    logger.info("[Reverse-Geo]: Missing lat and/or log");
    done(null);
    return Promise.resolve();
  }

  logger.info("performing reverse geocode");
  try {
    const res = await geocoder.reverse({ lat, lon });

    if (res[0]) {
      if (res[0].city) geo.city = res[0].city;
      if (res[0].state) geo.state = res[0].state;
      if (res[0].zipcode) geo.zipcode = res[0].zipcode;

      if (res[0].city && res[0].state) {
        const loc = `${res[0].city}, ${res[0].state}`;
        const { location } = await getOrCreateLocationOption(loc);

        geo.place = location;
      }
    } else {
      logger.trace("Geo search success but no response?");
      logger.trace(res);
    }

    await prisma.media.update({
      where: {
        id: imgId,
      },
      data: geo,
    });

    done(null);
  } catch (err) {
    logger.error("Error reverse geo searching");
    logger.error(err);
    done(null);
  }
}
