import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const photoRouter = router({
  "by-id": publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.media.findFirst({
        where: { id: input.id },
        select: {
          id: true,
          height: true,
          width: true,
          date: true,
          month: true,
          year: true,
          dir: true,
          city: true,
          state: true,
          aperture: true,
          camera_make: true,
          camera_model: true,
          dominant_color: true,
          orientation: true,
          flash: true,
          focal_length: true,
          iso: true,
          palette: true,
          path: true,
          media_tags: {
            select: {
              is_auto_generated: true,
              id: true,
              tag: true,
            },
          },
          facial_recognitions: {
            select: {
              confidence: true,
              id: true,
              x: true,
              y: true,
              width: true,
              height: true,
              x_min: true,
              x_max: true,
              y_min: true,
              y_max: true,
              is_unknown_face: true,
              name: true,
            },
          },
        },
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
