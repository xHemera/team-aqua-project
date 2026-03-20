"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AuthPageLayout from "@/components/AuthPageLayout";
import Button from "@/components/atoms/Button";
import IconField from "@/components/molecules/IconField";

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
      name: pseudo,
      email,
      password,
    });

    if (error) {
      setMessage(error.message ?? "Erreur d'inscription");
    } else {
      setMessage("Inscription réussie");
      setTimeout(() => {
        router.push(`/profile/${pseudo}`);
      }, 700);
    }

    setLoading(false);
  };

  return (
    <AuthPageLayout>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Usage molecule/atom: IconField standardise la structure input + icone. */}
        <IconField
          iconClassName="fa-solid fa-user"
          type="text"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          placeholder="Pseudo"
          required
        />

        <IconField
          iconClassName="fa-regular fa-user"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />

        <IconField
          iconClassName="fa-solid fa-lock"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          required
        />

        <IconField
          iconClassName="fa-solid fa-lock"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirmer le mot de passe"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          {/* Usage atomique: Button garantit des variants coherents dans tout le front. */}
          <Button
            type="button"
            onClick={() => router.push("/")}
            variant="ghost"
          >
            Retour
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? "Chargement..." : "S'inscrire"}
          </Button>
        </div>

        {message && (
          <p className={`text-center text-sm ${message.includes("réussie") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </form>
    </AuthPageLayout>
  );
}
