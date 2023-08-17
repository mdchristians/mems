import * as trpc from "@trpc/server";
import { z } from "zod";
import { Context } from "../trpc";

export const objectsRouter = trpc
  .router<Context>()
  .mutation("remove", {
    input: z.object({
      id: z.string().uuid(),
    }),
    async resolve({ ctx, input }) {
      try {
        // Verify recognition exists
        await ctx.prisma.object_recognitions.findUniqueOrThrow({
          where: {
            id: input.id,
          },
        });

        return ctx.prisma.object_recognitions.delete({
          where: {
            id: input.id,
          },
        });
      } catch (err) {
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Recognition not found",
          cause: err,
        });
      }
    },
  })
  .mutation("remove-option", {
    input: z.object({
      id: z.string().uuid(),
    }),
    async resolve({ ctx, input }) {
      try {
        // Verify recognition exists
        await ctx.prisma.object_recognitions.findUniqueOrThrow({
          where: {
            id: input.id,
          },
        });

        // delete all recognitions under the option
        const deletedObjects = ctx.prisma.object_recognitions.deleteMany({
          where: { object_id: input.id },
        });

        const deletedObjectOption = ctx.prisma.objects.delete({
          where: { id: input.id },
        });

        return ctx.prisma.$transaction([deletedObjects, deletedObjectOption]);
      } catch (err) {
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Recognition option not found",
          cause: err,
        });
      }
    },
  })
  .query("get-options", {
    async resolve({ ctx }) {
      return ctx.prisma.objects.findMany({
        select: {
          id: true,
          name: true,
        },
      });
    },
  })
  .query("get-object-photos", {
    input: z.object({
      id: z.string().uuid(),
    }),
    async resolve({ ctx, input }) {
      const recognitions = await ctx.prisma.object_recognitions.findMany({
        where: {
          object_id: input.id,
        },
        select: {
          media: true,
        },
      });

      const photoIds = recognitions.map((rec) => rec.media.id);

      return ctx.prisma.media.findMany({
        where: {
          id: {
            in: photoIds,
          },
        },
        select: {
          id: true,
          created_at: true,
          date: true,
          orientation: true,
          height: true,
          width: true,
          dir: true,
        },
      });
    },
  });
