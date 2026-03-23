"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppPageShell from "@/components/AppPageShell";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";

type User = {
  id: string;
  pseudo: string;
  avatar?: string;
};

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/users", { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        const usersList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.users)
              ? data.users
              : [];

        setUsers(usersList);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des joueurs:", err);
        setUsers([]);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return users;
    }

    return users.filter((user) => user.pseudo.toLowerCase().includes(normalized));
  }, [query, users]);

  return (
    <AppPageShell containerClassName="w-full max-w-3xl flex-col px-4 py-6 sm:px-8">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.push("/home")}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#3c3650] bg-[#242033] text-white transition-colors hover:bg-[#302a45]"
          title="Retour à l'accueil"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Chercher un joueur</h1>
      </div>

      <div className="mb-6 rounded-2xl border border-[#3c3650] bg-[#15131d]/90 p-3 shadow-xl">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tape un pseudo..."
          className="h-12 w-full rounded-xl border border-[#3c3650] bg-[#0f0d16] px-4 text-white outline-none transition-colors placeholder:text-gray-400 focus:border-[var(--accent-border)]"
        />
      </div>

      <div className="space-y-3">
        {isLoading && (
          <div className="rounded-2xl border border-[#3c3650] bg-[#15131d]/90 p-4 text-white">
            Chargement des joueurs...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-700 bg-red-950/40 p-4 text-red-200">
            {error}
          </div>
        )}

        {!isLoading && !error && filteredUsers.length === 0 && (
          <div className="rounded-2xl border border-[#3c3650] bg-[#15131d]/90 p-4 text-gray-300">
            Aucun joueur trouvé.
          </div>
        )}

        {!isLoading &&
          !error &&
          filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => router.push(`/profile/${encodeURIComponent(user.pseudo)}`)}
              className="flex w-full items-center gap-4 rounded-2xl border border-[#3c3650] bg-[#15131d]/90 p-3 text-left transition-colors hover:bg-[#211d2e]"
            >
              <Image
                src={user.avatar || DEFAULT_PROFILE_ICON.url}
                alt={user.pseudo}
                width={56}
                height={56}
                className="h-14 w-14 rounded-xl border border-[#3c3650] object-cover"
                unoptimized
              />
              <span className="text-lg font-semibold text-white">{user.pseudo}</span>
            </button>
          ))}
      </div>
    </AppPageShell>
  );
}
