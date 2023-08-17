import type { Swatch } from "@vibrant/color";

/**
 * rgbToHex
 *
 *  Converts the values of RGB components to a color code.
 *
 * @example Example:
 * ```
 * rgbToHex(255, 165, 1); // 'ffa501'
 * rgbToHex(255, 165, 1, "#"); // '#ffa501'
 * ```
 *
 * @param r number
 * @param g number
 * @param b number
 * @param hash string
 * @returns string
 */
export const rgbToHex = (r: number, g: number, b: number, hash: "#" | "" = "") =>
  hash + ((r << 16) + (g << 8) + b).toString(16).padStart(6, "0");

export const rgbObjToHex = (rgb: { r: number; g: number; b: number }) => {
  const args = Object.values(rgb) as [number, number, number];
  return rgbToHex(...args);
};

export function toSwatch(vibrantSwatch: Swatch | null) {
  if (!vibrantSwatch) return undefined;
  return {
    color: vibrantSwatch.getHex(),
    population: vibrantSwatch.getPopulation(),
  };
}
