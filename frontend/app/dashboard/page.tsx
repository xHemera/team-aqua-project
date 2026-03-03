"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  role: string;
}

// Dashboard réservé aux admins (liste des utilisateurs)
export default function DashboardPage() {
  const router = useRouter();
  // États de session et de données tableau
  const [session, setSession] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifie session + rôle admin avant d'autoriser l'accès
    const checkAuth = async () => {
      try {
        const sessionData = await authClient.getSession();

        if (!sessionData?.data?.session) {
          router.push("/");
          return;
        }

        const userRole = (sessionData.data.user as any).role;
        if (userRole !== "admin") {
          router.push("/home");
          return;
        }

        setSession(sessionData.data.session);

        const response = await fetch("http://localhost:3000/api/users");
        if (response.ok) {
          // Charge la liste des utilisateurs affichée dans le tableau
          const usersData = await response.json();
          setUsers(usersData);
        }
      } catch (error) {
        console.error("Erreur:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden text-white">
      {/* Fond global */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "var(--site-bg-image)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px)",
          transform: "scale(1.08)",
        }}
      />
      <div className="absolute inset-0 z-[1] bg-black/25" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[92rem] flex-col px-4 py-4 sm:px-8 sm:py-6">
        <header className="mb-5 flex items-center justify-end gap-3">
          <button
            onClick={() => router.push("/home")}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-500/80 bg-gray-700/80 text-white shadow-lg transition-colors hover:bg-gray-600"
            aria-label="Retour à l'accueil"
          >
            <i className="fa-solid fa-house"></i>
          </button>
          <button
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/80 bg-red-500/90 text-white shadow-lg transition-colors hover:bg-red-500"
            aria-label="Déconnexion"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </header>

        <section className="flex-1 overflow-hidden rounded-3xl border border-[#3c3650] bg-[#15131d]/85 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          {/* Bloc principal d'administration */}
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="mb-6 text-sm text-gray-300">
            Connecté en tant que {session?.user?.name || session?.user?.email}
          </p>

          <div className="overflow-hidden rounded-2xl border border-[#3c3650]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#3c3650]">
                <thead className="bg-[#242033]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Email vérifié</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Date création</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Rôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3c3650] bg-[#1a1725]">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-100">{user.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-100">{user.email}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-100">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            user.emailVerified ? "bg-green-600/30 text-green-300" : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {user.emailVerified ? "Oui" : "Non"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-100">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-100">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            user.role === "admin" ? "bg-[#8e82ff]/30 text-[#c8c1ff]" : "bg-blue-500/25 text-blue-200"
                          }`}
                        >
                          {user.role === "admin" ? "Admin" : "Utilisateur"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {users.length === 0 && <p className="mt-4 text-sm text-gray-400">Aucun utilisateur trouvé</p>}
        </section>
      </div>
    </main>
  );
}
