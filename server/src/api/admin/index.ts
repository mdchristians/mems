import { ENV } from "@/config";
import groupBy from "lodash/groupBy";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
// import { deepDeduper, recognition } from '@/processes';
import { router, publicProcedure } from "../trpc";
import { recognizeUnknowns } from "@/services";

type PopularDate = {
  date: string;
};

type PopularDates = PopularDate[];

export const adminRouter = router({
  "generate-album-suggestions": publicProcedure.mutation(async ({ ctx }) => {
    const popularDates: PopularDates =
      ENV.NODE_ENV === "production"
        ? await ctx.prisma.$queryRaw`SELECT date FROM media GROUP BY date HAVING COUNT(*) > 9`
        : await ctx.prisma.$queryRaw`SELECT date FROM media GROUP BY date HAVING COUNT(*) > 2`;

    const popularDatePhotos = popularDates.map((popularDate) => {
      return ctx.prisma.media.findMany({
        where: {
          date: popularDate.date,
        },
      });
    });

    // returns an array of array(s)
    const data = await Promise.all(popularDatePhotos);

    let albumSuggestions = [];

    for (let i = 0; i < data.length; i++) {
      const group = data[i];
      const groups = groupBy(group, "camera_model");
      const camModels = Object.keys(groups).filter((g) => {
        return g !== "null" && g !== null;
      });

      console.log(camModels);

      if (camModels.length > 0 && camModels.length < 3) {
        // Join multiple camera models together but sort lightly for future comparison
        const shotWith = camModels.sort().join(" & ");

        const albumExists = await ctx.prisma.albums.findMany({
          where: {
            AND: [
              {
                date: {
                  equals: group[0]?.date,
                },
              },
              {
                shot_with: {
                  equals: shotWith,
                },
              },
            ],
          },
        });

        if (!albumExists || albumExists.length === 0) {
          const albumId = uuidv4();

          const coverPhoto = `/${group[0].year}/${group[0].month}/${group[0].id}/${group[0].id}_w720.webp`;

          const albumPhotos = group.map((img) => ({
            id: uuidv4(),
            media_id: img.id,
            album_id: albumId,
          }));

          const albumPromise = ctx.prisma.$transaction([
            ctx.prisma.albums.create({
              data: {
                id: albumId,
                title: `${shotWith} on ${group[0]?.date}`,
                is_suggested: true,
                start_date: group[0]?.date,
                end_date: group[0]?.date,
                date: group[0]?.date,
                cover_photo: coverPhoto,
                shot_with: shotWith,
              },
            }),
            ctx.prisma.album_media.createMany({
              data: albumPhotos,
            }),
          ]);

          albumSuggestions.push(albumPromise);
        }
      }
    }

    const promises = albumSuggestions.length > 0 ? albumSuggestions : [Promise.resolve];

    return Promise.all(promises);
  }),
  "rerun-unknown-faces": publicProcedure.mutation(({ ctx }) => {
    return recognizeUnknowns();
  }),
});
