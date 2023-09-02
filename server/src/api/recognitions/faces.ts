import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const facesRouter = router({
  "get-face": publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const face = await ctx.prisma.faces.findUniqueOrThrow({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
        },
      });

      const recognitions = await ctx.prisma.facial_recognitions.findMany({
        where: { face_id: input.id, is_removed: false },
        select: {
          id: true,
          name: true,
          confidence: true,
          source: true,
          is_verified: true,
          media_id: true,
        },
      });

      return {
        ...face,
        recognitions,
      };
    }),
  "get-faces": publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.faces.findMany({
      select: {
        id: true,
        name: true,
        cover_photo: true,
        _count: {
          select: { facial_recognitions: true },
        },
      },
    });
  }),
  /**
   * Removes a face option and all recognitions
   */
  "remove-face": publicProcedure
    .input(
      z.object({
        faceId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const unknownFaceObject = await ctx.prisma.faces.findUniqueOrThrow({
        where: { name: "unknown" },
      });

      if (unknownFaceObject.id === input.faceId) {
        return Promise.reject(Error("Cannot remove the Unknown face!"));
      }

      const recognitionsPromise = ctx.prisma.facial_recognitions.updateMany({
        where: {
          face_id: input.faceId,
        },
        data: {
          face_id: unknownFaceObject.id,
          name: unknownFaceObject.name,
          is_unknown_face: true,
          is_verified: true,
        },
      });

      const facePromise = ctx.prisma.faces.delete({
        where: {
          id: input.faceId,
        },
      });

      return Promise.all([recognitionsPromise, facePromise]);
    }),
  "update-face-cover-photo": publicProcedure
    .input(
      z.object({
        faceId: z.string(),
        recognitionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const recognitionPhoto = await ctx.prisma.facial_recognitions.findUniqueOrThrow({
        where: {
          id: input.recognitionId,
        },
      });

      return ctx.prisma.faces.update({
        where: {
          id: input.faceId,
        },
        data: {
          cover_photo: recognitionPhoto.source,
        },
      });
    }),
});
