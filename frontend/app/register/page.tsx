"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import logo from "../images/logo.png";

// Page d'inscription dédiée
export default function RegisterPage() {
  const router = useRouter();
  // États de formulaire
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Soumission de l'inscription avec validation locale du mot de passe
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    const { error } = await authClient.signUp.email({
      name: "",
      email,
      password,
      name: pseudo,
    });

    if (error) {
      setMessage(error.message ?? "Erreur d'inscription");
    } else {
      setMessage("Inscription réussie");
      setTimeout(() => {
        router.push(`/${pseudo}`);
      }, 700);
    }

    setLoading(false);
  };

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

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[92rem] items-center justify-center px-4 py-4 sm:px-8 sm:py-6">
        <div className="w-full max-w-md rounded-3xl border border-[#3c3650] bg-[#15131d]/85 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          {/* Carte formulaire */}
          <div className="mb-5 w-full py-2">
            <Image src={logo} alt="Logo" width={500} height={250} className="mx-auto" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <i className="fa-solid fa-user"></i>
              </div>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Pseudo"
                className="w-full rounded-xl border border-[#3c3650] bg-[#242033] py-3 pl-12 pr-4 text-gray-200 placeholder-gray-400 transition focus:border-[#8e82ff] focus:outline-none"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
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
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <i className="fa-solid fa-lock"></i>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full rounded-xl border border-[#3c3650] bg-[#242033] py-3 pl-12 pr-4 text-gray-200 placeholder-gray-400 transition focus:border-[#8e82ff] focus:outline-none"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <i className="fa-solid fa-lock"></i>
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                className="w-full rounded-xl border border-[#3c3650] bg-[#242033] py-3 pl-12 pr-4 text-gray-200 placeholder-gray-400 transition focus:border-[#8e82ff] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-xl border border-[#3c3650] bg-[#242033] py-3 font-semibold text-gray-100 transition-colors hover:bg-[#302a45]"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl border border-[#b4a8ff]/70 bg-[#8e82ff] py-3 font-semibold text-white transition-colors hover:bg-[#7d71ec] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Chargement..." : "S'inscrire"}
              </button>
            </div>

            {message && (
              <p className={`text-center text-sm ${message.includes("réussie") ? "text-green-400" : "text-red-400"}`}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
