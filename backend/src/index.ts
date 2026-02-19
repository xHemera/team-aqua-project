import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT ?? 4000);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "up" });
  } catch {
    res.status(500).json({ status: "error", db: "down" });
  }
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
