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
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    const { error } = await authClient.signUp.email({
      name: pseudo,
      email,
      password,
    });

    if (error) {
      setMessage(error.message ?? "Registration error");
    } else {
      setMessage("Registration successful");
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
          placeholder="Username"
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
          placeholder="Password"
          required
        />

        <IconField
          iconClassName="fa-solid fa-lock"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          {/* Usage atomique: Button garantit des variants coherents dans tout le front. */}
          <Button
            type="button"
            onClick={() => router.push("/")}
            variant="ghost"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign up"}
          </Button>
        </div>

        {message && (
          <p className={`text-center text-sm ${message.includes("successful") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </form>
    </AuthPageLayout>
  );
}
