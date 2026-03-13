import Image from "next/image";
import { ReactNode } from "react";
import AppPageShell from "@/components/AppPageShell";

type AuthPageLayoutProps = {
  children: ReactNode;
};

export default function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <AppPageShell
      mainClassName="flex items-center justify-center"
      containerClassName="items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-md rounded-3xl border border-[#3c3650] bg-[#15131d]/85 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <div className="mb-5 w-full py-2">
          <Image src="/logo.png" alt="Logo" width={500} height={250} className="mx-auto" />
        </div>
        {children}
      </div>
    </AppPageShell>
  );
}
