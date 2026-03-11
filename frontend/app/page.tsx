"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

// Page d'entrée: connexion + création de compte (mode toggle)
export default function LoginPage() {
  // États de formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.session) {
          router.push("/home");
        }
      } catch (error) {
        // Pas de session, on reste sur la page de login
      }
    };
    checkSession();
  }, [router]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (isRegisterMode) {
      // Inscription d'un nouvel utilisateur
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (error) {
        setMessage(error.message ?? "Erreur lors de l'inscription");
      } else {
        setMessage("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
        setIsRegisterMode(false);
        setPassword("");
        setName("");
      }
    } else {
      // Connexion d'un utilisateur existant
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setMessage(error.message ?? "Erreur de connexion");
      } else {
        setMessage("Connexion réussie !");
        const pseudo = data?.user?.name || "utilisateur";
        setTimeout(() => router.push(`/profile/${pseudo}`), 500);
      }
    }

    setLoading(false);
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-white">
      {/* Fond global du site */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "var(--site-bg-image)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(12px)",
          transform: "scale(1.08)",
        }}
      />
      <div className="absolute inset-0 z-[1] bg-black/35" />
      {/* Carte auth */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#3c3650] bg-[#15131d]/85 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <div className="mb-4 w-full py-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={500}
            height={250}
            className="mx-auto"
          />
        </div>
        <div className="w-full">
            <form onSubmit={onSubmit} className="space-y-4">
              {isRegisterMode && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <i className="fa-regular fa-id-card"></i>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nom"
                    className="w-full rounded-xl border border-[#3c3650] bg-[#242033] py-3 pl-12 pr-4 text-gray-200 placeholder-gray-400 transition focus:border-[#8e82ff] focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <i className="fa-regular fa-user"></i>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-xl border border-[#3c3650] bg-[#242033] py-3 pl-12 pr-4 text-gray-200 placeholder-gray-400 transition focus:border-[#8e82ff] focus:outline-none"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <i className="fa-solid fa-lock"></i>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full rounded-xl border border-[#3c3650] bg-[#242033] py-3 pl-12 pr-4 text-gray-200 placeholder-gray-400 transition focus:border-[#8e82ff] focus:outline-none"
                  required
                  minLength={8}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setMessage("");
                  }}
                  className="rounded-xl border border-[#3c3650] bg-[#302a45] py-3 font-semibold text-gray-100 transition-colors hover:bg-[#3a3355]"
                >
                  {isRegisterMode ? "Se connecter" : "S'inscrire"}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl border border-[#b4a8ff]/70 bg-[#8e82ff] py-3 font-semibold text-white transition-colors hover:bg-[#7d71ec] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "..." : (isRegisterMode ? "Créer un compte" : "Connexion")}
                </button>
              </div>
              {message && (
                <p className={`text-center text-sm ${message.includes("succès") || message.includes("réussie") ? "text-green-400" : "text-red-400"}`}>
                  {message}
                </p>
              )}
            </form>
        </div>
      </div>
    </main>
  );
}
