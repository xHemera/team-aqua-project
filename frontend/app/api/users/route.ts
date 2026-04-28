import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        badges: true,
        avatar: {
          select: {
            url: true,
          }
        },
      },
      orderBy: {
        name: "asc",
      }
    });

    const result = users.map((user) => ({
      id: user.id,
      pseudo: user.name,
      avatar: user.avatar?.url ?? user.image ?? null,
      badges: user.badges ?? [],
    }));

    return Response.json({result}, {status: 200});
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

export async function POST()
{
  try {
    const admin1 = await prisma.user.findFirst({
      where: {
        name: "Xoco"
      },
      select: {
        id: true
      }
    })
    const admin2 = await prisma.user.findFirst({
      where: {
        name: "Hemera"
      },
      select: {
        id: true
      }
    });

    if (!admin1 || !admin2) return Response.json({error: "Users not found"}, {status: 404});

    await prisma.user.updateMany({
      where: { name: { in: ["Xoco", "Hemera"] } },
      data: {
        badges: {
          set: [...new Set(["ADMIN"])]
        }
      }
    });

    await prisma.friends.createMany({
      data: [
        {
          userId: admin1.id,
          friendId: admin2.id,
          request_sent: false,
        },
        {
          userId: admin2.id,
          friendId: admin1.id,
          request_sent: false,
        }
      ]
    });
    await prisma.match_history.createMany({
      data: [
        {
          opponent: "Hemera",
          opponentTeam: ["Knight", "Assassin", "Healer"],
          playerTeam: ["Knight", "Assassin", "Healer"],
          result: "win",
          user_id: admin1.id
        },
        {
          opponent: "Xoco",
          playerTeam: ["Knight", "Assassin", "Healer"],
          opponentTeam: ["Knight", "Assassin", "Healer"],
          result: "lose",
          user_id: admin2.id
        },
        {
          opponent: "Hemera",
          playerTeam: ["Knight", "Assassin", "Healer"],
          opponentTeam: ["Knight", "Assassin", "Healer"],
          result: "lose",
          user_id: admin1.id
        },
        {
          opponent: "Xoco",
          playerTeam: ["Knight", "Assassin", "Healer"],
          opponentTeam: ["Knight", "Assassin", "Healer"],
          result: "win",
          user_id: admin2.id
        }
      ]
    });
  }
  catch (error)
  {
    return Response.json({error: "failed creating admins"}, {status: 500})
  }
}
