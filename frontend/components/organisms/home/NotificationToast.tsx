"use client";

import Button from "@/components/atoms/Button";
import styles from "./HomePage.module.css";

type NotificationToastProps = {
  onClose: () => void;
  msg: string;
  sender: string;
  variant?: "default" | "error";
};

// Organism: toast de notification contextualise pour l'ecran home.
export default function NotificationToast({ onClose, msg, sender, variant = "default" }: NotificationToastProps) {
  const isError = variant === "error";

  const frameClasses = `w-[min(380px,92vw)] overflow-hidden rounded-2xl border-2 shadow-2xl ${
    isError ? "border-red-400/80" : "border-[color:var(--accent-border)]"
  }`;

  const headerClasses = `flex items-center justify-between px-3 ${
    isError ? "bg-gradient-to-r from-red-700 to-orange-600" : "bg-[var(--accent-color)]"
  }`;

  const separatorClasses = `h-[2px] w-full ${isError ? "bg-red-950" : "bg-black"}`;
  const bodyClasses = `px-4 py-4 ${isError ? "bg-[#1f0a0a]" : "bg-black"}`;
  const senderLabel = isError ? `! ${sender}` : `@${sender}`;

  return (
    <div className={`absolute right-4 top-4 z-30 ${styles.slideIn}`}>
      <div className={frameClasses}>
        <div className={headerClasses}>
          <div className="text-base font-bold text-white">{senderLabel}</div>
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-auto border-0 bg-transparent p-0 text-2xl font-bold leading-none text-white hover:bg-transparent hover:text-gray-200"
            aria-label="Fermer la notification"
          >
            ×
          </Button>
        </div>
        <div className={separatorClasses}></div>
        <div className={bodyClasses}>
          <div className="text-sm leading-tight text-white">
          { msg }
          </div>
        </div>
      </div>
    </div>
  );
}
