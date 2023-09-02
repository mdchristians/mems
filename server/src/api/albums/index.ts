import { router, publicProcedure } from "../trpc";
import { z } from "zod";

export const albumsRouter = router({
  /**
   * Get all albums with counts of internal media
   */
  all: publicProcedure.query(async ({ ctx }) => {
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
  }),

  /**
   * Get all non-suggested albums ID and TITLE
   */
  existing: publicProcedure.query(async ({ ctx }) => {
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
  }),
  /**
   * Remove album(s)
   */
  delete: publicProcedure
    .input(
      z.object({
        albumIds: z.array(z.string().min(1)).nonempty(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
    }),
});
