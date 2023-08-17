import * as trpc from "@trpc/server";
import { z } from "zod";
import { Context } from "../trpc";

export const photosRouter = trpc
  .router<Context>()
  .query("all", {
    async resolve({ ctx }) {
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
    },
  })
  .query("locations", {
    async resolve({ ctx }) {
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
    },
  });
