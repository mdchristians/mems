import { createRouter } from "../trpc";
import { facesRouter } from "./faces";
import { objectsRouter } from "./objects";
import { faceRecognitionsRouter } from "./face-recognitions";

export const recognitionRouter = createRouter()
  .merge("faces.", facesRouter)
  .merge("objects.", objectsRouter)
  .merge("facial-recognitions.", faceRecognitionsRouter);
