"use client";

import { useState } from "react";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import logo from "../images/logo.png";

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
      name: "",
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
    <main className="relative flex py-12 items-center justify-center min-h-screen overflow-hidden">
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
      <div className="flex flex-col items-center justify-center w-full relative z-10 px-4">
        <div className="mb-8 w-full max-w-md py-4">
          <Image
            src={logo}
            alt="Logo"
            width={500}
            height={250}
            className="mx-auto"
          />
        </div>
        <div className="w-full max-w-md">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <i className="fa-solid fa-user"></i>
              </div>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Pseudo"
                className="w-full bg-gray-900 bg-opacity-70 text-gray-200 placeholder-gray-400 py-3 pl-12 pr-4 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <i className="fa-regular fa-user"></i>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-gray-900 bg-opacity-70 text-gray-200 placeholder-gray-400 py-3 pl-12 pr-4 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
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
                placeholder="Password"
                className="w-full bg-gray-900 bg-opacity-70 text-gray-200 placeholder-gray-400 py-3 pl-12 pr-4 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <i className="fa-solid fa-lock"></i>
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                className="w-full bg-gray-900 bg-opacity-70 text-gray-200 placeholder-gray-400 py-3 pl-12 pr-4 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Chargement..." : "S'inscrire"}
            </button>

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
