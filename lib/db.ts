import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var adapter: PrismaMariaDb | undefined;
}

// Create adapter with connection string
const adapter =
  globalThis.adapter ?? new PrismaMariaDb(process.env.DATABASE_URL!);

// Create Prisma client with adapter
export const prisma = globalThis.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
  globalThis.adapter = adapter;
}

export default prisma;
