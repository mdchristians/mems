import { prisma } from "@mems/db";

export async function createFileMap() {
  return prisma.media.findMany({
    select: {
      source_path: true,
    },
  });
}
