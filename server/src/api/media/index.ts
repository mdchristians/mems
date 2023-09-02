import * as trpc from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const mediaRouter = router({
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
        media_type: true,
        duration: true,
      },
    });
  }),
  locations: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.media.findMany({
      where: {
        latitude: {
          not: null,
        },
      },
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
  "by-id": publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.media.findFirst({
        where: { id: input.id },
      });
    }),
  download: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const filePath = await ctx.prisma.media.findFirst({
        where: { id: input.id },
        select: {
          path: true,
        },
      });

      if (filePath) {
        ctx.res.download(filePath?.path);
      }
    }),
});
