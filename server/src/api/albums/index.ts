import * as trpc from "@trpc/server";
import { z } from "zod";
import { Context } from "../trpc";

export const albumsRouter = trpc
  .router<Context>()
  .query("all", {
    async resolve({ ctx }) {
      return ctx.prisma.albums.findMany({
        where: {
          is_suggestion_rejected: false,
        },
        include: {
          _count: {
            select: { album_media: true },
          },
        },
      });
    },
  })
  .query("existing", {
    async resolve({ ctx }) {
      return ctx.prisma.albums.findMany({
        where: {
          is_suggestion_rejected: false,
          is_suggested: false,
        },
        select: {
          id: true,
          title: true,
        },
      });
    },
  })
  .mutation("delete", {
    input: z.object({
      albumIds: z.array(z.string().min(1)).nonempty(),
    }),
    async resolve({ ctx, input }) {
      const removeAlbumPhotos = ctx.prisma.album_media.deleteMany({
        where: {
          album_id: {
            in: input.albumIds,
          },
        },
      });

      const removeAlbumTags = ctx.prisma.album_tags.deleteMany({
        where: {
          album_id: {
            in: input.albumIds,
          },
        },
      });

      const removeAlbums = ctx.prisma.albums.deleteMany({
        where: {
          id: {
            in: input.albumIds,
          },
        },
      });

      return ctx.prisma.$transaction([removeAlbumPhotos, removeAlbumTags, removeAlbums]);
    },
  });
