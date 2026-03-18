require('dotenv').config();

module.exports = {
  schema: "schema.prisma",
  migrations: {
    path: "migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@db:5432/aqua_temp",
  },
};