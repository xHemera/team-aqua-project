"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (isRegisterMode) {
      const { error } = await authClient.signUp.email({
        name: name || "Utilisateur",
        email,
        password,
      });

      if (error) {
        setMessage(error.message ?? "Erreur pendant la création du compte.");
      } else {
        setMessage("Compte créé. Tu peux maintenant te connecter.");
        setIsRegisterMode(false);
      }
      setLoading(false);
      return;
    }

    const { error } = await authClient.signIn.email({
      email,
      password,
      rememberMe: true,
    });

    if (error) {
      setMessage(error.message ?? "Erreur pendant la connexion.");
    } else {
      setMessage("Connexion réussie.");
    }

    setLoading(false);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <form onSubmit={onSubmit} className="w-full space-y-4 rounded-lg border p-6">
        <h1 className="text-2xl font-semibold">
          {isRegisterMode ? "Créer un compte" : "Connexion"}
        </h1>

        {isRegisterMode ? (
          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        ) : null}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          {loading ? "Chargement..." : isRegisterMode ? "Créer" : "Se connecter"}
        </button>

        <button
          type="button"
          onClick={() => setIsRegisterMode((value) => !value)}
          className="w-full rounded border px-4 py-2"
        >
          {isRegisterMode
            ? "J’ai déjà un compte"
            : "Créer un compte"}
        </button>

        {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
      </form>
    </main>
  );
}
