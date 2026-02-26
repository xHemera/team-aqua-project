// Load environment variables
require('dotenv').config();

module.exports = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@db:5432/aqua_temp",
  },
};
