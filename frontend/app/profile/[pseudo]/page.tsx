import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { resolveProfileIcon } from "@/lib/profile-icons";
import prisma from "@/lib/prisma";
import ProfileClientView from "./ProfileClientView";

type ProfilePageProps = {
  params: Promise<{ pseudo: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/not-connected");
  }

  const { pseudo } = await params;
  const decodedPseudo = decodeURIComponent(pseudo ?? "").trim();

  if (!decodedPseudo) {
    notFound();
  }

  const profileUser = await prisma.user.findFirst({
    where: {
      name: decodedPseudo,
    },
    select: {
      id: true,
      name: true,
      badges: true,
      avatarId: true,
      image: true,
      profileBackground: true,
      matchHistory: { orderBy: [
        {createdAt: 'desc'}
      ]},
      avatar: true,
    }
  });

  if (!profileUser) {
    notFound();
  }

  const avatar = profileUser.image || resolveProfileIcon({
    id: profileUser.avatarId,
    url: profileUser.avatar?.url
  }).url;

  let wins = 0;
  let badges: string[] = [];
  if (profileUser.badges.includes("ADMIN") && profileUser.badges.includes("MODERATOR"))
  {
    badges.push("ADMIN");
    badges.push("MODERATOR");
  }
  else if (profileUser.badges.includes("ADMIN"))
    badges.push("ADMIN");
  else if (profileUser.badges.includes("MODERATOR"))
    badges.push("MODERATOR");
  let newBadges: any;
  for (const i of profileUser.matchHistory)
  {
    if (i.result === "win")
      wins++;
  }
  switch (true)
  {
    case wins >= 50 && !profileUser.badges.includes("MASTER"):
      badges.push("MASTER");
      newBadges = await prisma.user.update({
        where: { id: profileUser.id },
        data: {
          badges: { set: badges },
        },
        select: { badges: true },
      });
      break;
    case wins >= 20 && !profileUser.badges.includes("EXPERT"):
      badges.push("EXPERT");
      newBadges = await prisma.user.update({
        where: { id: profileUser.id },
        data: {
          badges: { set: badges },
        },
        select: { badges: true },
      });
      break;
    case wins >= 10 && !profileUser.badges.includes("AMATEUR"):
      badges.push("AMATEUR");
      newBadges = await prisma.user.update({
        where: { id: profileUser.id },
        data: {
          badges: { set: badges },
        },
        select: { badges: true },
      });
      break;
    case wins >= 5 && !profileUser.badges.includes("BEGINNER"):
      badges.push("BEGINNER");
      newBadges = await prisma.user.update({
        where: { id: profileUser.id },
        data: {
          badges: { set: badges },
        },
        select: { badges: true },
      });
      break;
  }

  return (
    <ProfileClientView
      profileName={profileUser.name}
      profileBadges={newBadges?.badges ?? profileUser.badges ?? []}
      initialAvatar={avatar}
      initialBackground={profileUser.profileBackground ?? undefined}
      isOwnProfile={profileUser.id === session.user.id}
      matchHistory={profileUser.matchHistory.sort()}
    />
  );
}
