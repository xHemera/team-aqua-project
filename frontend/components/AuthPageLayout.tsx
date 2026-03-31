import Image from "next/image";
import { ReactNode } from "react";
import AppPageShell from "@/components/AppPageShell";
import Card from "@/components/atoms/Card";

type AuthPageLayoutProps = {
  children: ReactNode;
};

export default function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <AppPageShell
      mainClassName="flex items-center justify-center"
      containerClassName="items-center justify-center px-4 py-10"
    >
      {/* Usage atomique: Card sert de conteneur visuel standard pour les pages d'auth. */}
      <Card className="w-full max-w-md rounded-3xl p-6 sm:p-8">
        <div className="mb-5 w-full py-2">
          <Image src="/logo.png" alt="Logo" width={500} height={250} className="mx-auto" />
        </div>
        {children}
      </Card>
    </AppPageShell>
  );
}
