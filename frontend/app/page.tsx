"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { socket } from "../socket"
import AuthPageLayout from "@/components/AuthPageLayout";

// Page d'entrée: connexion + création de compte (mode toggle)
export default function LoginPage() {
  // États de formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pseudo, setPseudo] = useState<string | null>(null);
  const router = useRouter();


  //Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.session) {
          router.push("/home");
        }
      } catch {
        // Pas de session, on reste sur la page de login
      }
    };
    checkSession();
  }, [router]);

  //permet d'envoyer l'utilisateur a redis dans le serveur
  useEffect(() => {
    if (!pseudo) return;
    socket.connect()
    socket.emit("login", pseudo);
    socket.on("online_users", (users) => {
      console.log("Users from Redis:", users);
    });
  });

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
      }
      else {
        setMessage("Connexion réussie !");
        setPseudo(data?.user?.name || "utilisateur");
        setTimeout(() => router.push(`/profile/${data?.user?.name}`), 500);
      }
    }
    setLoading(false);
  };

  return (
    <AuthPageLayout>
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
                className="w-full rounded-xl border border-[#3c3650] bg-[#242033] py-3 pl-12 pr-4 text-gray-200 placeholder-gray-400 transition focus:border-[var(--accent-color)] focus:outline-none"
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
              className="w-full rounded-xl border border-[#3c3650] bg-[#242033] py-3 pl-12 pr-4 text-gray-200 placeholder-gray-400 transition focus:border-[var(--accent-color)] focus:outline-none"
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
              className="w-full rounded-xl border border-[#3c3650] bg-[#242033] py-3 pl-12 pr-4 text-gray-200 placeholder-gray-400 transition focus:border-[var(--accent-color)] focus:outline-none"
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
              className="rounded-xl border border-[color:var(--accent-border)] bg-[var(--accent-color)] py-3 font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "..." : isRegisterMode ? "Créer un compte" : "Connexion"}
            </button>
          </div>
          {message && (
            <p
              className={`text-center text-sm ${
                message.includes("succès") || message.includes("réussie") ? "text-green-400" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </AuthPageLayout>
  );
}
