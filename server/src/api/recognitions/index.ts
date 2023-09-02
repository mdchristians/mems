import { router } from "../trpc";
import { facesRouter } from "./faces";
import { objectsRouter } from "./objects";
import { faceRecognitionsRouter } from "./face-recognitions";

export const recognitionRouter = router({
  faces: facesRouter,
  objects: objectsRouter,
  "facial-recognitions": faceRecognitionsRouter,
});
