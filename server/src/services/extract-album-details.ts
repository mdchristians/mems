import dayjs from "dayjs";
import { prisma } from "@mems/db";
import { logger } from "@/core";

export async function extractAlbumDetails(mediaIds: string[]) {
  const media = await prisma.media.findMany({
    where: {
      id: {
        in: mediaIds,
      },
    },
    orderBy: { date: "asc" },
  });

  const earliestDay = dayjs(media[0].date);
  const latestDay = dayjs(media[media.length - 1].date);
  const isSameDay = dayjs(earliestDay).isSame(latestDay, "day");

  return {
    date: isSameDay ? media[0].date : null,
    start_date: media[0].date,
    end_date: media[media.length - 1].date,
    shot_with: null,
  };
}

function holidayCheck() {
  const holidays = [
    { name: "New Year's Day", rule: "January 1st" },
    { name: "Martin Luther King, Jr. Day", rule: "Third Monday of January" },
    { name: "Groundhog Day", rule: "February 2nd" },
    { name: "Valentine's Day", rule: "February 14th" },
    { name: "Saint Patrick's Day", rule: "March 17th" },
    { name: "Earth Day", rule: "April 22nd" },
    { name: "Cinco de Mayo", rule: "May 5th" },
    { name: "Mother's Day", rule: "Second Sunday of May" },
    { name: "Memorial Day", rule: "Last Monday of May" },
    { name: "Flag Day", rule: "June 14th" },
    { name: "Father's Day", rule: "Third Sunday of June" },
    { name: "Independence Day", rule: "July 4th" },
    { name: "Labor Day", rule: "First Monday of September" },
    { name: "Columbus Day", rule: "Second Monday of October" },
    { name: "Halloween", rule: "October 31st" },
    { name: "Veterans Day", rule: "November 11th" },
    { name: "Thanksgiving Day", rule: "Fourth Thursday of November" },
    { name: "Black Friday", rule: "Fourth Thursday of November %Y +1 day" },
    { name: "Christmas Eve", rule: "December 24th" },
    { name: "Christmas", rule: "December 25th" },
    { name: "New Year's Eve", rule: "December 31st" },
  ];
}
