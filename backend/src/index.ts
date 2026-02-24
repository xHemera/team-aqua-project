import "dotenv/config";
import express, { Request, Response } from "express";
import prisma from "../lib/prisma.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(express.json());

app.get("/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "up" });
  } catch {
    res.status(500).json({ status: "error", db: "down" });
  }
});

app.get("/api/users", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
}).on("error", (error: Error) => {
  console.error("Server error:", error);
  process.exit(1);
});
