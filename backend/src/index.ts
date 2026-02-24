import "dotenv/config";
import express, { Request, Response } from "express";
import prisma from "../lib/prisma.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

// Middleware
app.use(express.json());

// CORS pour le développement
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Health check
app.get("/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "up", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: "error", db: "down" });
  }
});

// Liste des utilisateurs
app.get("/api/users", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.$queryRaw`
      SELECT id, name, email, "emailVerified", "createdAt", role
      FROM "user"
      ORDER BY "createdAt" DESC
    `;
    res.json(users);
  } catch (error) {
    console.error("Erreur récupération users:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Impossible de récupérer les utilisateurs" });
  }
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
}).on("error", (error: Error) => {
  console.error("Erreur serveur:", error.message);
  process.exit(1);
});
