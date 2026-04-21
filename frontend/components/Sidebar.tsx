"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";
import Button from "@/components/atoms/Button";
import { useAvatarPreference } from "@/hooks/useAvatarPreference";
import { socket } from "../socket";

const NAV_ITEMS = [
  { href: "/home", icon: "fa-solid fa-house", label: "Home" },
  { href: "/characters", icon: "fa-solid fa-users", label: "Heroes" },
  { href: "/social", icon: "fa-solid fa-people-group", label: "Social" },
  { href: "/admin", icon: "fa-solid fa-crown", label: "Council" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const avatar = useAvatarPreference(DEFAULT_PROFILE_ICON.url);
  const [pseudo, setPseudo] = useState<string | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [socialUnread, setSocialUnread] = useState<number>(0);
  const unreadRequestSeqRef = useRef(0);

  const refreshSocialUnread = async () => {
    const requestSeq = ++unreadRequestSeqRef.current;

    try {
      const response = await fetch("/api/social/unread", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { totalUnread?: number };
      if (requestSeq !== unreadRequestSeqRef.current) return;
      setSocialUnread(Math.max(0, payload.totalUnread ?? 0));
    } catch {
      // Keep the current value if fetch fails.
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const hydrateIdentity = async () => {
      const [session, profileResponse] = await Promise.all([authClient.getSession(), fetch("/api/profile/")]);
      const profile = (await profileResponse.json()) as { pseudo?: string; name?: string; badges?: string[] };
      const identity = profile.pseudo || profile.name || session.data?.user?.name || null;

      if (!isCancelled) {
        setPseudo(identity);
        setBadges(profile.badges ?? []);
      }
    };

    void hydrateIdentity();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const loadUnread = async () => {
      await refreshSocialUnread();
    };

    void loadUnread();
  }, [pathname]);

  useEffect(() => {
    if (!pseudo) return;

    if (!socket.connected) {
      socket.connect();
    }
    const login = () => {
      socket.emit("login", pseudo);
    };

    login();

    const onReceived = () => {
      void refreshSocialUnread();
    };

    socket.on("connect", login);
    socket.on("received", onReceived);

    return () => {
      socket.off("connect", login);
      socket.off("received", onReceived);
    };
  }, [pseudo]);

  useEffect(() => {
    const onUnreadUpdated = () => {
      void refreshSocialUnread();
    };

    window.addEventListener("social-unread-updated", onUnreadUpdated);
    return () => {
      window.removeEventListener("social-unread-updated", onUnreadUpdated);
    };
  }, []);

  const handleProfileClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data } = await authClient.getSession();
    if (data && data.user.name) {
      router.push(`/profile/${data.user.name}`);
    } else {
      router.push("/not-connected");
    }
  };

  const isProfileActive = pathname.startsWith("/profile");

  return (
    <aside
      className="flex h-full w-20 shrink-0 flex-col items-center gap-3 rounded-xl border-2 border-[#c9a227]/30 bg-gradient-to-b from-[#1e1a24] via-[#15121a] to-[#0c0a0f] p-3 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
      style={{ boxShadow: "inset 0 1px 0 rgba(201,162,39,0.1), 0 4px 12px rgba(0,0,0,0.5)" }}
    >
      {/* Decorative top element */}
      <div className="mb-1 flex h-8 w-8 items-center justify-center">
        <i className="fa-solid fa-dragon text-lg text-[#c9a227]" />
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#c9a227]/30 to-transparent" />

      {NAV_ITEMS.map(({ href, icon, label }) => {
        // Hide Admin tab if user doesn't have ADMIN badge
        if (href === "/admin" && !badges.includes("ADMIN")) {
          return null;
        }

        const isActive = pathname === href;
        const isSocial = href === "/social";
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all duration-300 ${
              isActive
                ? "border-[#c9a227] bg-[#c9a227]/20 text-[#f5e6c8] shadow-[0_0_15px_rgba(201,162,39,0.3)]"
                : "border-[#2a2638] bg-[#0c0a0f]/50 text-[#8a7a5a] hover:border-[#c9a227]/50 hover:text-[#c9b896]"
            }`}
          >
            <i className={`${icon} text-lg`} />
            {isSocial && socialUnread > 0 && pathname !== "/social" &&(
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-[#cd5c5c] bg-[#8b0000] px-1 text-[10px] font-bold text-white shadow-lg">
                {socialUnread > 99 ? "99+" : socialUnread}
              </span>
            )}
          </Link>
        );
      })}

      <div className="flex-1" />

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#c9a227]/30 to-transparent" />

      {/* Profile Button */}
      <Button
        type="button"
        onClick={handleProfileClick}
        title={pseudo ?? "Profile"}
        variant="ghost"
        className={`!h-12 !w-12 !p-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
          isProfileActive
            ? "border-[#c9a227] shadow-[0_0_10px_rgba(201,162,39,0.2)]"
            : "border-[#2a2638] hover:border-[#c9a227]/50"
        }`}
      >
        <Image
          src={avatar}
          alt="Avatar"
          width={48}
          height={48}
          className="h-full w-full bg-[#0c0a0f] object-contain"
          unoptimized
        />
      </Button>
    </aside>
  );
}
