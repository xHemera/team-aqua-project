"use client";

import { useEffect, useState } from "react";

type InfoModalProps = {
  open: boolean;
  isYourTurn: boolean;
  onClose: () => void;
};

export default function InfoModal({ open, isYourTurn, onClose }: InfoModalProps) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(open);
  const [dismissedEarly, setDismissedEarly] = useState(false);

  useEffect(() => {
    if (open) {
      setDismissedEarly(false);
      setShouldRender(true);
      const animationFrame = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });
      const timeoutId = window.setTimeout(() => {
        onClose();
      }, 1600);

      return () => {
        window.cancelAnimationFrame(animationFrame);
        window.clearTimeout(timeoutId);
      };
    }

    setIsVisible(false);
    const timeoutId = window.setTimeout(() => {
      setShouldRender(false);
    }, 260);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open, onClose]);

  const handleBackdropClick = () => {
    if (dismissedEarly) {
      return;
    }

    setDismissedEarly(true);
    onClose();
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        role="status"
        aria-live="polite"
        aria-label="Turn information"
        className={`w-full bg-[linear-gradient(180deg,rgba(26,22,34,0.96)_0%,rgba(18,15,23,0.96)_100%)] px-6 py-5 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-none transition-[opacity,transform] duration-300 ease-out transform-gpu ${
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-0 scale-[0.995] opacity-0"
        }`}
      >
        <h2 className="text-3xl font-black uppercase tracking-[0.16em] text-[#f5e6c8]">
          {isYourTurn ? "Your Turn" : "Opponents Turn"}
        </h2>
      </div>
    </div>
  );
}