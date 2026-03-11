import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarId: true,
        avatar: { select: { id: true, name: true, url: true } },
      },
    });

    return Response.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { avatarId } = body as { avatarId: string };

    if (!avatarId) {
      return Response.json({ error: "avatarId is required" }, { status: 400 });
    }

    const avatarExists = await prisma.avatar.findUnique({ where: { id: avatarId } });
    if (!avatarExists) {
      return Response.json({ error: "Avatar not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarId },
      select: {
        id: true,
        name: true,
        avatarId: true,
        avatar: { select: { id: true, name: true, url: true } },
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
