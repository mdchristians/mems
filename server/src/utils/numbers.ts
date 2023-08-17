import { logger } from "@/core";
import round from "lodash/round";

// https://stackoverflow.com/questions/15965166/what-are-the-lengths-of-location-coordinates-latitude-and-longitude
export function truncateNumber(num: number, requestedLength: number) {
  const numString = num.toString();

  if (numString.includes(".")) {
    const numStringArr = numString.split(".");

    // More than 1 decimal?
    if (numStringArr.length !== 2) {
      logger.error(
        `truncateNumber cannot parse more than one decimal, this does not make sense: ${num}`
      );
      return num;
    }

    // Happy
    if (numStringArr[1].length > requestedLength) {
      const truncatedDecimal = numStringArr[1].slice(0, requestedLength);

      return Number(`${numStringArr[0]}.${truncatedDecimal}`);
    } else {
      logger.info("[geo.ts] Number is already less than or equal to the requested length");
      return num;
    }
  }

  return num;
}

export function decimalToSeconds(time: string) {
  const timeArray = time.split(".");

  // Use the decmimal and convert
  const timeDecimal = Number(`0.${timeArray[timeArray.length - 1]}`);

  // Remove the decimal from the original array
  timeArray.pop();

  // Add it back in
  timeArray.push(round(timeDecimal * 60).toString());

  return timeArray.join(":");
}
