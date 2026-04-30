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
  if (!session?.user) {
    redirect("/");
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
      matchHistory: true,
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

  return (
    <ProfileClientView
      profileName={profileUser.name}
      profileUserId={profileUser.id}
      profileBadges={profileUser.badges ?? []}
      initialAvatar={avatar}
      initialBackground={profileUser.profileBackground ?? undefined}
      isOwnProfile={profileUser.id === session.user.id}
      matchHistory={profileUser.matchHistory}
    />
  );
}
