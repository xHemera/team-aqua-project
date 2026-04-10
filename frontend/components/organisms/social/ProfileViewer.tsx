"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import IconButton from "@/components/atoms/IconButton";

type Avatar = {
  url: string;
};

type User = {
  id: string;
  name: string;
  image: string | null;
  badges: string[];
  avatar: Avatar | null;
};

type ProfileViewerModalProps = {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  pseudo?: string;
  avatarUrl?: string | null;
  badges?: string[];
  isFriend?: boolean;
  isBlocked?: boolean;
};

// Organism: modal d'apercu d'un profil avec actions sociales.
export default function ProfileViewerModal({
  open,
  onClose,
  user: inputUser = null,
  pseudo = "Joueur inconnu",
  avatarUrl = null,
  badges = [],
  isFriend = false,
  isBlocked = false,
}: ProfileViewerModalProps) {

  const displayedUser = inputUser;

  const displayedPseudo = displayedUser?.name ?? pseudo;
  const displayedAvatarUrl = displayedUser?.avatar?.url ?? displayedUser?.image ?? avatarUrl;
  const displayedBadges = displayedUser?.badges ?? badges;

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <Card
        className="w-full max-w-md rounded-2xl border border-[#3c3650] bg-[#15131d] p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profileviewer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-[color:var(--accent-border)] bg-[#242033]">
                {displayedAvatarUrl ? (
                  <Image
                    src={displayedAvatarUrl}
                    alt={`Avatar de ${displayedPseudo}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-black text-white">
                    {displayedPseudo.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h2 id="profileviewer-title" className="truncate text-xl font-black uppercase tracking-wide text-white">
                  {displayedPseudo}
                </h2>

                {displayedBadges.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {displayedBadges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full border border-[color:var(--accent-border)] bg-[var(--accent-color)]/20 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button type="button" onClick={onClose} variant="ghost" size="sm" className="h-9 w-9 rounded-xl p-0">
              X
            </Button>
          </div>

          {/* Actions: message, ajouter en ami, bloquer */}
          <div className="flex items-center justify-center gap-4">
            <IconButton
              type="button"
              variant="secondary"
              size="lg"
              title="Envoyer un message"
              aria-label="Envoyer un message"
            >
              <i className="fa-regular fa-paper-plane text-lg" />
            </IconButton>

            <IconButton
              type="button"
              size="lg"
              title={isFriend ? "Deja ami" : "Ajouter en ami"}
              aria-label={isFriend ? "Deja ami" : "Ajouter en ami"}
              className={isFriend ? "border-emerald-500/70 bg-emerald-900/20 text-emerald-200" : undefined}
            >
              <i className="fa-solid fa-user-plus text-lg" />
            </IconButton>

            <IconButton
              type="button"
              size="lg"
              title="Bloquer"
              aria-label="Bloquer"
              className="border-red-500/70 bg-red-900/20 text-red-200 hover:bg-red-900/35"
            >
              <i className="fa-solid fa-ban text-lg" />
            </IconButton>
          </div>
        </div>
      </Card>
    </div>
  );
}
