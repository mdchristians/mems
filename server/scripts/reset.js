/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const fs = require("fs-extra");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST);

// defaults
const BASE = path.join(process.cwd(), "media");
const M_SETUP = path.join(BASE, "full");

const M_SOURCE = process.env.MEDIA_SOURCE;
const M_DEST = process.env.MEDIA_DESTINATION;
const M_TMP = process.env.MEDIA_TMP;

async function reset() {
  // remove old directory contents
  try {
    await fs.emptyDir(M_SOURCE);
    await fs.emptyDir(M_DEST);
    await fs.emptyDir(M_TMP);

    // reset source with some images
    return fs.copy(M_SETUP, M_SOURCE);
  } catch (err) {
    throw new Error(err);
  }
}

redis
  .flushdb()
  .then(() => {
    console.log("✔ ✔ ✔ Redis flushed, reseting images...");
    return reset();
  })
  .then(() => {
    console.log("✔ ✔ ✔ COMPLETE!");
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
  });
