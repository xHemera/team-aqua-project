"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
      email,
      password,
    });

    if (error) {
      setMessage(error.message ?? "Erreur d'inscription");
    } else {
      setMessage("Inscription réussie");
    }

    setLoading(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(45deg, #000000, #1a1a1a, #333333, #4d4d4d, #333333, #1a1a1a, #000000)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 15s ease infinite'
        }}
      />
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      <div className="w-full max-w-md p-8 relative z-10">
        <div 
          className="rounded-lg shadow-xl p-8 border-4 border-gray-600 relative overflow-hidden"
        >
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: 'linear-gradient(45deg, #0f172a, #1e293b, #334155, #475569, #334155, #1e293b, #0f172a)',
              backgroundSize: '400% 400%',
              animation: 'gradient-shift 15s ease infinite'
            }}
          />
          <div className="relative z-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Pokémon TCG</h1>
            <p className="text-gray-300 mt-2">Inscription</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Pseudo
              </label>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Chargement..." : "S'inscrire"}
            </button>

            {message && (
              <p className={`text-center text-sm ${message.includes("réussie") ? "text-green-400" : "text-red-400"}`}>
                {message}
              </p>
            )}
          </form>

          <div className="text-center mt-4">
            <p className="text-gray-300">
              Vous avez déjà un compte ?{" "}
              <a href="/" className="text-blue-400 font-semibold hover:text-blue-300 underline">
                Se connecter
              </a>
            </p>
          </div>
          </div>
        </div>
      </div>
    </main>
  );
}
