"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import ProfileViewerModal from "@/components/organisms/social/ProfileViewer";

type UserAccount = {
  pseudo?: string;
  name?: string;
  profilePhoto?: string | null;
  image?: string | null;
  avatar?: {
    url: string;
  } | null;
};

type ProfileInfoProps = {
  account: UserAccount;
  className?: string;
};

export default function ProfileInfo({ account, className = "" }: ProfileInfoProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const pseudo = account.pseudo ?? account.name ?? "Joueur inconnu";
  const profilePhoto = account.profilePhoto ?? account.image ?? account.avatar?.url ?? null;

  const avatarFallback = useMemo(() => {
    return pseudo.slice(0, 2).toUpperCase();
  }, [pseudo]);

  const handleOpenProfile = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenProfile}
        className={`flex items-center gap-3 rounded border border-[#3c3650] bg-[#0f0e13] px-3 py-2 hover:border-[#5b5480] ${className}`}
      >
        <span className="truncate text-sm font-medium">{pseudo}</span>

        <span className="relative h-8 w-8 overflow-hidden rounded-full border border-[#5b5480] bg-[#242033]">
          {profilePhoto ? (
            <Image
              src={profilePhoto}
              alt={`Photo de profil de ${pseudo}`}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
              {avatarFallback}
            </span>
          )}
        </span>
      </button>

      <ProfileViewerModal
        open={isProfileModalOpen}
        onClose={handleCloseProfile}
        pseudo={pseudo}
        avatarUrl={profilePhoto}
      />
    </>
  );
}