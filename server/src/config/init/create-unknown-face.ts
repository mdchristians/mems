import { v4 as uuidv4 } from "uuid";
import { prisma } from "@mems/db";

export async function createUnknownFace() {
  const faces = await prisma.faces.count();

  if (faces > 0) {
    return Promise.resolve();
  }

  return prisma.faces.create({
    data: {
      id: uuidv4(),
      name: "unknown",
      cover_photo: "unknown",
    },
  });
}
