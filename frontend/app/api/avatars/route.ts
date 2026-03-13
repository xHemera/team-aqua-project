import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const avatars = await prisma.avatar.findMany({
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });

    return Response.json(avatars);
  } catch (error) {
    console.error("Error fetching avatars:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
