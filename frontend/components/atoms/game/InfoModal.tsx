"use client";

import { useEffect, useState } from "react";

type InfoModalProps = {
  open: boolean;
  isYourTurn: boolean;
  onClose: () => void;
};

export default function InfoModal({ open, isYourTurn, onClose }: InfoModalProps) {
  const [phase, setPhase] = useState<"hidden" | "enter" | "visible" | "exit">("hidden");

  useEffect(() => {
    if (!open) {
      if (phase !== "hidden") {
        setPhase("exit");
        const t = setTimeout(() => setPhase("hidden"), 250);
        return () => clearTimeout(t);
      }
      return;
    }

    const enter = setTimeout(() => setPhase("enter"), 10);
    const visible = setTimeout(() => setPhase("visible"), 250);
    const exit = setTimeout(() => {
      setPhase("exit");
      setTimeout(() => {
        setPhase("hidden");
        onClose();
      }, 250);
    }, 1500);

    return () => {
      clearTimeout(enter);
      clearTimeout(visible);
      clearTimeout(exit);
    };
  }, [open, onClose]);

  if (phase === "hidden") return null;

  const isEntering = phase === "enter";
  const isExiting = phase === "exit";
  const showContent = phase === "enter" || phase === "visible" || phase === "exit";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-[250ms] ${
        isExiting ? "pointer-events-none" : ""
      }`}
    >
      {/* backdrop */}
      <div
        className={`absolute inset-0 transition-all duration-[250ms] ${
          showContent && !isExiting
            ? "bg-black/60 backdrop-blur-[3px]"
            : "bg-black/0 backdrop-blur-0"
        }`}
      />

      {/* card */}
      <div
        className={`relative flex flex-col items-center transition-all duration-[200ms] ease-out ${
          isEntering
            ? "scale-0 opacity-0"
            : isExiting
              ? "scale-[1.8] opacity-0"
              : "scale-100 opacity-100"
        }`}
      >
        {/* glow */}
        <div className="absolute -inset-16 rounded-full bg-[#f5e6c8] opacity-[0.04] blur-[60px]" />

        {/* decorative line top */}
        <div
          className={`h-[1px] transition-all duration-[250ms] delay-50 ${
            showContent && !isExiting ? "w-48 opacity-40" : "w-0 opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #f5e6c8 20%, #f5e6c8 80%, transparent 100%)",
          }}
        />

        <h2
          className={`px-8 py-4 text-center text-5xl font-black uppercase tracking-[0.2em] transition-all duration-[200ms] ${
            isExiting ? "scale-[2]" : ""
          }`}
          style={{
            color: isYourTurn ? "#f5e6c8" : "#e8586a",
            textShadow: isYourTurn
              ? "0 0 40px rgba(245,230,200,0.15), 0 0 80px rgba(245,230,200,0.08)"
              : "0 0 40px rgba(232,88,106,0.2), 0 0 80px rgba(232,88,106,0.1)",
          }}
        >
          {isYourTurn ? "YOUR TURN" : "OPPONENT"}
        </h2>

        <p
          className={`text-sm font-medium uppercase tracking-[0.3em] transition-all duration-[200ms] delay-50 ${
            showContent && !isExiting
              ? "translate-y-0 opacity-60"
              : "translate-y-2 opacity-0"
          }`}
          style={{ color: isYourTurn ? "#f5e6c8" : "#e8586a" }}
        >
          {isYourTurn ? "Choose your action" : "Waiting..."}
        </p>

        {/* decorative line bottom */}
        <div
          className={`h-[1px] transition-all duration-[250ms] delay-50 ${
            showContent && !isExiting ? "w-48 opacity-40" : "w-0 opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #f5e6c8 20%, #f5e6c8 80%, transparent 100%)",
          }}
        />
      </div>
    </div>
  );
}
