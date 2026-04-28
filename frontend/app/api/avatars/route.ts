import prisma from "@/lib/prisma";
import { PROFILE_ICONS } from "@/lib/profile-icons";

export async function GET() {
  try {
    let avatars = await prisma.avatar.findMany({
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });

    if (avatars.length === 0) {
      await prisma.avatar.createMany({
        data: PROFILE_ICONS.map((icon) => ({
          id: icon.id,
          name: icon.name,
          type: icon.type,
          url: icon.url,
          accent: icon.accent,
          accentHover: icon.accentHover,
        })),
        skipDuplicates: true,
      });

      avatars = await prisma.avatar.findMany({
        orderBy: [{ name: "asc" }, { id: "asc" }],
      });
    }

    return Response.json({avatars}, {status: 200});
  } catch (error) {
    console.error("Error fetching avatars:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
