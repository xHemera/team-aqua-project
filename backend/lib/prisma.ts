import * as PrismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Support both Prisma v6 (named export) and v7+ (default or different export shape)
const PrismaClientClass: any = (PrismaPkg as any).PrismaClient ?? (PrismaPkg as any).default ?? PrismaPkg;

const globalForPrisma = global as unknown as {
  prisma: InstanceType<any> | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClientClass({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;