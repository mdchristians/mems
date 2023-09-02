import { router } from "./trpc";
import { adminRouter } from "./admin";
import { albumRouter } from "./album";
import { albumsRouter } from "./albums";
import { mediaRouter } from "./media";
import { photoRouter } from "./photo";
import { photosRouter } from "./photos";
import { recognitionRouter } from "./recognitions";

export const api = router({
  admin: adminRouter,
  album: albumRouter,
  albums: albumsRouter,
  media: mediaRouter,
  photo: photoRouter,
  photos: photosRouter,
  recognitions: recognitionRouter,
});

export type AppRouter = typeof api;
