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
      name: {
        equals: decodedPseudo,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      avatarId: true,
      image: true,
    },
  });

  if (!profileUser) {
    notFound();
  }

  const avatar = resolveProfileIcon({
    id: profileUser.avatarId,
    url: profileUser.image,
  }).url;

  return (
    <ProfileClientView
      profileName={profileUser.name}
      initialAvatar={avatar}
      isOwnProfile={profileUser.id === session.user.id}
    />
  );
}
