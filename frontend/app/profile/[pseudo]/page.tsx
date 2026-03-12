import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ProfileClientView from "./ProfileClientView";

const DEFAULT_AVATAR_URL = "https://archives.bulbagarden.net/media/upload/e/e8/Spr_B2W2_Alder.png";

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
      image: true,
      avatar: {
        select: {
          url: true,
        },
      },
    },
  });

  if (!profileUser) {
    notFound();
  }


  const avatar = profileUser.avatar?.url ?? profileUser.image ?? DEFAULT_AVATAR_URL;

  return (
    <ProfileClientView
      profileName={profileUser.name}
      initialAvatar={avatar}
      isOwnProfile={profileUser.id === session.user.id}
    />
  );
}
