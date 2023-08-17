import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["warn", "error"],
});

export type PrismaApi = typeof prisma;
