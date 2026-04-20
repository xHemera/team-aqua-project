import "dotenv/config";

const config = {
  schema: "schema.prisma",
  migrations: {
    path: "migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL
  },
};

export default config;
