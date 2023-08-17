import * as trpc from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import superjson from 'superjson';
import { prisma } from '@mems/db';

export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({
  req,
  res,
  prisma,
});

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => {
  return trpc
    .router<Context>()
    .transformer(superjson)
    .formatError(({ shape, error }) => {
      return shape;
    });
};
