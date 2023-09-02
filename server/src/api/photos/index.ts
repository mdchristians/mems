import * as trpc from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const photosRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.media.findMany({
      select: {
        created_at: true,
        id: true,
        date: true,
        orientation: true,
        height: true,
        width: true,
        dir: true,
        month: true,
        year: true,
      },
    });
  }),
  locations: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.media.findMany({
      select: {
        state: true,
        zipcode: true,
        id: true,
        date: true,
        latitude: true,
        longitude: true,
        place: true,
        dir: true,
      },
    });
  }),
});
