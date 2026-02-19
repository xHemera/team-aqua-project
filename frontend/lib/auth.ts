import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

const connectionString =
  process.env.BETTER_AUTH_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "postgres://postgres:postgres@localhost:5432/aqua_temp";

const db = new Kysely({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString }),
  }),
});

export const auth = betterAuth({
  database: {
    db,
    type: "postgres",
  },
  emailAndPassword: {
    enabled: true,
  },
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "dev-secret-change-me-please-at-least-32-characters",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  plugins: [nextCookies()],
});
