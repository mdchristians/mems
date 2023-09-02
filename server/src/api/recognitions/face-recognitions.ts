import { getOrCreateRecognitionOption, recognizeUnknowns } from "@/services";
import * as trpc from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const faceRecognitionsRouter = router({
  "get-recognitions": publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.facial_recognitions.findMany({
        where: { face_id: input.id },
        select: {
          id: true,
          name: true,
          confidence: true,
          source: true,
          is_verified: true,
          media_id: true,
        },
      });
    }),
  "get-recognition-media": publicProcedure
    .input(
      z.object({
        mediaId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.media.findUnique({
        where: { id: input.mediaId },
        select: {
          id: true,
          name: true,
        },
      });
    }),
  "remove-recognitions": publicProcedure
    .input(
      z.object({
        recognitionIds: z.string().array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const unknownFaceObject = await ctx.prisma.faces.findUniqueOrThrow({
        where: { name: "unknown" },
      });

      const batchedUpdates = input.recognitionIds.map((id) => {
        return ctx.prisma.facial_recognitions.update({
          where: {
            id,
          },
          data: {
            face_id: unknownFaceObject.id,
            name: "unknown",
            confidence: null,
            is_unknown_face: true,
            is_verified: true,
          },
        });
      });

      return ctx.prisma.$transaction(batchedUpdates);
    }),
  "remove-unknown-recognitions": publicProcedure
    .input(
      z.object({
        recognitionIds: z.string().array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const unknownFaceObject = await ctx.prisma.faces.findUniqueOrThrow({
        where: { name: "unknown" },
      });

      const batchedUpdates = input.recognitionIds.map((id) => {
        return ctx.prisma.facial_recognitions.update({
          where: {
            id,
          },
          data: {
            face_id: unknownFaceObject.id,
            name: "unknown",
            is_unknown_face: true,
            is_verified: true,
            is_removed: true,
          },
        });
      });

      return ctx.prisma.$transaction(batchedUpdates);
    }),
  "update-recognitions": publicProcedure
    .input(
      z.object({
        faceId: z.string().uuid().optional(),
        name: z.string(),
        recognitionIds: z.string().array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If a faceId exists, we know we're the recognitions belong to an existing face
      if (input.faceId) {
        const batchedUpdates = input.recognitionIds.map((id) => {
          return ctx.prisma.facial_recognitions.update({
            where: {
              id,
            },
            data: {
              face_id: input.faceId,
              name: input.name,
              confidence: input.name === "unknown" ? null : 100,
              is_unknown_face: input.name === "unknown",
              is_verified: true,
              is_removed: false,
            },
          });
        });

        return ctx.prisma.$transaction(batchedUpdates);
      } else {
        // CREATE A NEW FACE FOR RECOGNITIONS
        // Verify the name doesn't already exist
        const name = input.name.toLowerCase().trim();
        const face = await ctx.prisma.faces.findUnique({
          where: { name },
        });

        if (face) {
          throw new Error("Name already exists");
        }

        // Get details from first selected option
        const firstRec = await ctx.prisma.facial_recognitions.findFirst({
          where: { id: input.recognitionIds[0] },
        });

        const { id: faceId } = await getOrCreateRecognitionOption({
          name,
          facePath: firstRec?.source,
        });

        // add new info to each recognition
        const batchedUpdates = input.recognitionIds.map((id) => {
          return ctx.prisma.facial_recognitions.update({
            where: {
              id,
            },
            data: {
              face_id: faceId,
              name,
              is_unknown_face: false,
              confidence: 100,
              is_verified: true,
              is_removed: false,
            },
          });
        });

        await ctx.prisma.$transaction(batchedUpdates);

        return recognizeUnknowns();
      }
    }),
});
