"use client";

export default function GameArenaBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#0a0806]" />
      <div className="pointer-events-none fixed inset-0 -z-10 animate-aurora bg-[radial-gradient(ellipse_at_50%_30%,#1a1420_0%,#0a0806_60%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06]">
        <div className="absolute inset-0 animate-sweep"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #c9b896 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[20%] top-[12%] h-px w-px animate-star rounded-full bg-[#c9b896]/40" />
        <div className="absolute right-[25%] top-[8%] h-px w-px animate-star-delayed rounded-full bg-[#c9b896]/30" />
      </div>
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 -z-10 h-[45vh]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a06] via-[#1a1410] to-transparent" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(90deg, transparent, transparent 48px, #c9a84c 48px, #c9a84c 49px),
              repeating-linear-gradient(0deg, transparent, transparent 48px, #c9a84c 48px, #c9a84c 49px)
            `
          }}
        />
        <div className="absolute left-1/2 top-0 h-[20vh] w-[60vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_bottom,#c9a84c_0%,transparent_70%)] opacity-[0.04]" />
      </div>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px w-px animate-dust rounded-full bg-[#c9a84c]/15"
            style={{
              left: `${15 + i * 20}%`,
              top: `${35 + (i % 2) * 25}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${5 + i * 1.5}s`,
            }}
          />
        ))}
      </div>
      <div className="pointer-events-none fixed left-1/2 top-1/2 -z-10 h-px w-[35vw] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#c9a84c]/15 to-transparent" />
    </>
  );
}
