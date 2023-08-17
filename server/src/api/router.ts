import { createRouter } from "./trpc";
import { adminRouter } from "./admin";
import { albumRouter } from "./album";
import { albumsRouter } from "./albums";
import { mediaRouter } from "./media";
import { photoRouter } from "./photo";
import { photosRouter } from "./photos";
import { recognitionRouter } from "./recognitions";

export const api = createRouter()
  .merge("admin.", adminRouter)
  .merge("album.", albumRouter)
  .merge("albums.", albumsRouter)
  .merge("media.", mediaRouter)
  .merge("photo.", photoRouter)
  .merge("photos.", photosRouter)
  .merge("recognitions.", recognitionRouter);

export type AppRouter = typeof api;
