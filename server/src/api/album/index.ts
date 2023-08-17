import * as trpc from "@trpc/server";
import { z } from "zod";
import { Context } from "../trpc";
import { v4 as uuidv4 } from "uuid";
import { extractAlbumDetails } from "@/services/extract-album-details";
import { getOrCreateTagOption } from "@/services";

export const albumRouter = trpc
  .router<Context>()
  .query("tag-options", {
    async resolve({ ctx }) {
      return ctx.prisma.album_tags.findMany({
        distinct: ["tag"],
        select: {
          id: true,
          tag: true,
        },
      });
    },
  })
  .query("by-id", {
    input: z.string().uuid(),
    async resolve({ ctx, input }) {
      const album = await ctx.prisma.albums.findFirst({
        where: { id: input },
        select: {
          id: true,
          title: true,
          date: true,
          description: true,
          cover_photo: true,
          is_suggested: true,
          album_tags: {
            select: {
              id: true,
              tag: true,
            },
          },
          album_media: {
            select: {
              // id: true,
              media: {
                select: {
                  id: true,
                  created_at: true,
                  date: true,
                  orientation: true,
                  height: true,
                  width: true,
                  dir: true,
                },
              },
            },
          },
        },
      });

      const tags = album?.album_tags || [];
      const media = album?.album_media.map((p) => p.media) || [];
      const mediaIds = media?.map((p) => p.id);

      const recognitionsFetch = await ctx.prisma.facial_recognitions.findMany({
        where: {
          AND: {
            media_id: {
              in: mediaIds,
            },
            is_unknown_face: {
              equals: false,
            },
          },
        },
        distinct: ["name"],
        select: {
          id: true,
          name: true,
          faces: {
            select: {
              id: true,
              cover_photo: true,
            },
          },
        },
      });

      const recognitions =
        recognitionsFetch.map((rec) => {
          const { faces, ...rest } = rec;
          return {
            ...rest,
            recId: faces?.id,
            photo: faces?.cover_photo,
          };
        }) || [];

      return {
        id: album?.id,
        title: album?.title,
        date: album?.date,
        description: album?.description,
        cover_photo: album?.cover_photo,
        is_suggested: album?.is_suggested,
        recognitions: recognitions ?? [],
        tags: tags ?? [],
        media: media ?? [],
      };
    },
  })
  .mutation("create", {
    input: z.object({
      title: z.string().min(2),
      mediaIds: z.string().array().nonempty(),
    }),
    async resolve({ ctx, input }) {
      const albumId = uuidv4();
      let coverPhotoPath = null;

      const coverPhoto = await ctx.prisma.media.findUnique({
        where: {
          id: input.mediaIds[0],
        },
        select: {
          id: true,
          date: true,
          month: true,
          year: true,
        },
      });

      if (coverPhoto) {
        coverPhotoPath = `/${coverPhoto.year}/${coverPhoto.month}/${coverPhoto.id}/${coverPhoto.id}_w720.webp`;
      }

      // Create an array of relationships from medias to album
      const albumPhotos = input.mediaIds.map((mediaId) => ({
        id: uuidv4(),
        album_id: albumId,
        media_id: mediaId,
      }));

      // Extract same basic details using the album meddia
      const details = await extractAlbumDetails(input.mediaIds);

      await ctx.prisma.albums.create({
        data: {
          id: albumId,
          title: input.title,
          ...details,
          ...(coverPhoto && { cover_photo: coverPhotoPath }),
        },
      });

      return ctx.prisma.album_media.createMany({
        data: albumPhotos,
      });
    },
  })
  .mutation("add-photos", {
    input: z.object({
      albumId: z.string().min(1),
      mediaIds: z.array(z.string().uuid()).nonempty(),
    }),
    async resolve({ ctx, input }) {
      const currentPhotosInAlbum = await ctx.prisma.album_media.findMany({
        where: {
          album_id: input.albumId,
        },
        select: {
          media_id: true,
        },
      });

      const currentPhotosInAlbumIds = new Set(currentPhotosInAlbum.map(({ media_id }) => media_id));
      const uniqueNewPhotos = input.mediaIds.filter((id) => !currentPhotosInAlbumIds.has(id));

      // Create an array of relationships from photos to album
      const albumPhotos = uniqueNewPhotos.map((mediaId) => ({
        id: uuidv4(),
        album_id: input.albumId,
        media_id: mediaId,
      }));

      return ctx.prisma.album_media.createMany({
        data: albumPhotos,
      });
    },
  })
  .mutation("update-details", {
    input: z.object({
      albumId: z.string().min(1),
      title: z.string().optional(),
      cover_photo: z.string().optional(),
      description: z.string().optional(),
      tags: z
        .object({
          removed: z
            .array(
              z.object({
                id: z.string(),
                tag: z.string(),
              })
            )
            .optional(),
          added: z
            .array(
              z.object({
                id: z.string(),
                tag: z.string(),
                isNew: z.string().optional(),
              })
            )
            .optional(),
        })
        .optional(),
    }),
    async resolve({ ctx, input }) {
      const { albumId, tags, ...details } = input;
      const updateProms = [];

      updateProms.push(
        ctx.prisma.albums.update({
          where: {
            id: albumId,
          },
          data: {
            ...details,
          },
        })
      );

      if (tags?.removed && tags.removed.length > 0) {
        const removalIds = tags.removed.map((tag) => tag.id);

        updateProms.push(
          ctx.prisma.album_tags.deleteMany({
            where: {
              id: {
                in: removalIds,
              },
            },
          })
        );
      }

      if (tags?.added && tags.added.length > 0) {
        const newTags = tags.added.filter((tag) => tag.isNew);
        const existingTags = tags.added.filter((tag) => !tag?.isNew);
        const removalIds = tags.added.map((tag) => tag.id);

        const tagProms = await Promise.all(
          newTags.map(async (tag) => {
            const res = await getOrCreateTagOption(tag.tag, "media");
            return res;
          })
        );

        const updatedTags = [...existingTags, ...tagProms].map((tag) => ({
          id: uuidv4(),
          album_id: albumId,
          tag_id: tag.id,
          tag: tag.tag,
        }));

        updateProms.push(
          ctx.prisma.album_tags.createMany({
            data: updatedTags,
          })
        );
      }

      ctx.prisma.$transaction(updateProms);
    },
  })
  .mutation("delete-photos-from-album", {
    input: z.object({
      albumId: z.string(),
      mediaIds: z.string().array(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.album_media.deleteMany({
        where: {
          album_id: input.albumId,
          id: {
            in: input.mediaIds,
          },
        },
      });
    },
  })
  .mutation("delete", {
    input: z.object({
      albumId: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      const removeAlbumPhotos = ctx.prisma.album_media.deleteMany({
        where: {
          album_id: input.albumId,
        },
      });

      const removeAlbumTags = ctx.prisma.album_tags.deleteMany({
        where: {
          album_id: input.albumId,
        },
      });

      const removeAlbums = ctx.prisma.albums.delete({
        where: {
          id: input.albumId,
        },
      });

      await ctx.prisma.$transaction([removeAlbumPhotos, removeAlbumTags, removeAlbums]);
    },
  })
  .mutation("remove-suggestion", {
    input: z.object({
      albumId: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.albums.update({
        where: {
          id: input.albumId,
        },
        data: {
          is_suggestion_rejected: true,
        },
      });
    },
  })
  .mutation("convert-suggestion", {
    input: z.object({
      albumId: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.albums.update({
        where: {
          id: input.albumId,
        },
        data: {
          is_suggested: false,
        },
      });
    },
  });
