import isNil from "lodash/isnil";
import { prisma } from "@mems/db";

export async function getEmbeddings() {
  const faces = await prisma.facial_recognitions.findMany({
    where: {
      AND: [
        {
          is_unknown_face: {
            equals: false,
          },
        },
        {
          is_verified: {
            equals: true,
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      embedding: true,
    },
  });

  return faces.filter((face) => !isNil(face.embedding));
}

export async function getTaggedEmbeddings() {
  const faces = await prisma.facial_recognitions.findMany({
    where: {
      is_unknown_face: false,
      is_verified: true,
      is_removed: false,
    },
    select: {
      id: true,
      name: true,
      face_id: true,
      embedding: true,
    },
  });

  return faces.filter((face) => !isNil(face.embedding));
}
