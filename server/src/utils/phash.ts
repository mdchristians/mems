import { Sharp } from "sharp";

const DEFAULT_OPTIONS = {
  IMG_SIZE: 32,
  LOW_FREQ_SIZE: 8,
};

/**
 * generate the perceptual hash of an image using discrete cosine
 * transform to reduce frequencies.
 *
 * pHash starts with a small image.
 * However, the image is larger than 8x8; 32x32 is a good size.
 * This is really done to simplify the DCT computation and not
 * because it is needed to reduce the high frequencies. The image
 * is reduced to a grayscale just to further simplify the number
 * of computations.
 *
 * https://hackerfactor.com/blog/index.php%3F/archives/432-Looks-Like-It.html
 *
 * @param sharpedImageInstance
 * @param opts
 * @returns
 */
export async function phash(sharpedImageInstance: Sharp, opts = {}) {
  const { IMG_SIZE, LOW_FREQ_SIZE } = { ...DEFAULT_OPTIONS, ...opts };

  // Reduce image size and apply grayscale to remove color
  const data = await sharpedImageInstance
    .clone()
    .greyscale()
    .resize(IMG_SIZE, IMG_SIZE, { fit: "fill" })
    .rotate()
    .raw()
    .toBuffer();

  // copy signal
  const matrix: number[][] = new Array(IMG_SIZE);

  for (let row = 0; row < IMG_SIZE; row++) {
    matrix[row] = new Array(IMG_SIZE);
    for (let col = 0; col < IMG_SIZE; col++) {
      matrix[row][col] = data[IMG_SIZE * col + row];
    }
  }

  // Discrete cosine transform to reduce frequencies.
  const dct = applyDCT(matrix, IMG_SIZE);

  // get AVG on high frequencies
  let totalSum = 0;

  // Extract the top 8x8 pixels.
  for (let x = 0; x < LOW_FREQ_SIZE; x++) {
    for (let y = 0; y < LOW_FREQ_SIZE; y++) {
      totalSum += dct[x + 1][y + 1];
    }
  }

  const avg = totalSum / (LOW_FREQ_SIZE * LOW_FREQ_SIZE);

  // compute hash
  let fingerprint = "";

  for (let x = 0; x < LOW_FREQ_SIZE; x++) {
    for (let y = 0; y < LOW_FREQ_SIZE; y++) {
      fingerprint += dct[x + 1][y + 1] > avg ? "1" : "0";
    }
  }

  return fingerprint;
}

/**
 *
 * @param f
 * @param size
 * @returns
 */
function applyDCT(matrix: number[][], size: number) {
  const COS = initCOS(size);
  const SQRT = initSQRT(size);

  let F = new Array(size);
  for (let u = 0; u < size; u++) {
    F[u] = new Array(size);
    for (let v = 0; v < size; v++) {
      let sum = 0;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          sum += COS[i][u] * COS[j][v] * matrix[i][j];
        }
      }
      sum *= (SQRT[u] * SQRT[v]) / 4;
      F[u][v] = sum;
    }
  }
  return F;
}

// Basic Lookup Table O(n^4)
function initCOS(size: number) {
  const cosines = new Array(size);

  for (let k = 0; k < size; k++) {
    cosines[k] = new Array(size);
    for (let n = 0; n < size; n++) {
      cosines[k][n] = Math.cos(((2 * k + 1) / (2.0 * size)) * n * Math.PI);
    }
  }
  return cosines;
}

// Simple Coefficient Matrix
function initSQRT(size: number) {
  const c = new Array(size);
  for (let i = 1; i < size; i++) {
    c[i] = 1;
  }
  c[0] = 1 / Math.sqrt(2.0);
  return c;
}
