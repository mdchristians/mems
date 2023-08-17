import * as trpc from "@trpc/server";
import { z } from "zod";
import { Context } from "../trpc";

export const mediaRouter = trpc
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
          media_type: true,
          duration: true,
        },
      });
    },
  })
  .query("locations", {
    async resolve({ ctx }) {
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
    },
  })
  .query("by-id", {
    input: z.object({
      id: z.string().uuid(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.media.findFirst({
        where: { id: input.id },
      });
    },
  })
  .query("download", {
    input: z.object({
      id: z.string().uuid(),
    }),
    async resolve({ ctx, input }) {
      const filePath = await ctx.prisma.media.findFirst({
        where: { id: input.id },
        select: {
          path: true,
        },
      });

      if (filePath) {
        ctx.res.download(filePath?.path);
      }
    },
  });
