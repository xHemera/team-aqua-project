import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        inbox: {
          include: {
              messages: true,
              inboxUser: true,
          },
          },
          friends: true,
          messages: true,
          inboxUser: true,
          avatar: true,
          matchHistory: true
      },
      orderBy: {
        name: "asc",
      },
    });

    const result = users.map((user) => ({
      id: user.id,
      pseudo: user.name,
      avatar: user.avatar?.url ?? user.image ?? null,
      badges: user.badges ?? [],
    }));

    return Response.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json(
      {
        error: `Internal server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
