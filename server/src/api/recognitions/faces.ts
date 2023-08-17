import { getOrCreateRecognitionOption } from "@/services";
import * as trpc from "@trpc/server";
import { z } from "zod";
import { Context } from "../trpc";
import { getConfidence } from "./utils";
import { logger } from "../../core/logger";

export const facesRouter = trpc
  .router<Context>()
  .query("get-face", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
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
    },
  })
  .query("get-faces", {
    async resolve({ ctx }) {
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
    },
  })
  /**
   * Removes a face option and all recognitions
   */
  .mutation("remove-face", {
    input: z.object({
      faceId: z.string(),
    }),
    async resolve({ ctx, input }) {
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
    },
  })
  .mutation("update-face-cover-photo", {
    input: z.object({
      faceId: z.string(),
      recognitionId: z.string(),
    }),
    async resolve({ ctx, input }) {
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
    },
  });
