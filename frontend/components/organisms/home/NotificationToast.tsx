"use client";

import Button from "@/components/atoms/Button";
import styles from "./HomePage.module.css";

type NotificationToastProps = {
  onClose: () => void;
  msg: string;
  sender: string;
};

// Organism: toast de notification contextualise pour l'ecran home.
export default function NotificationToast({ onClose, msg, sender }: NotificationToastProps) {
  return (
    <div className={`absolute right-4 top-4 z-30 ${styles.slideIn}`}>
      <div className="w-[min(380px,92vw)] overflow-hidden rounded-2xl border-2 border-[color:var(--accent-border)] shadow-2xl">
        <div className="flex items-center justify-between bg-[var(--accent-color)] px-3">
          <div className="text-base font-bold text-white">@{sender}</div>
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
        <div className="h-[2px] w-full bg-black"></div>
        <div className="bg-black px-4 py-4">
          <div className="text-sm leading-tight text-white">
          {
            msg
          }
          </div>
        </div>
      </div>
    </div>
  );
}
