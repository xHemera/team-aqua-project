"use client";

export default function SocialPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(45deg, #0a0a0a, #1a1a1a, #333333, #666666, #999999, #cccccc, #e0e0e0)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 15s ease infinite'
        }}
      />
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      {/* Header */}
      <header className="flex items-center px-8 py-2 bg-gradient-to-r from-black to-gray-400 shadow-lg">
        <nav
          className="flex gap-6 text-white font-black text-xl uppercase tracking-wider italic"
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          <a href="/home" className="hover:text-yellow-200 transition-colors">
            HOME
          </a>
          <a href="/decks" className="hover:text-yellow-200 transition-colors">
            DECKS
          </a>
          <a href="/profile" className="hover:text-yellow-200 transition-colors">
            PROFILE
          </a>
          <a href="/social" className="hover:text-yellow-200 transition-colors relative">
            SOCIAL
            <div className="absolute top-8.5 bottom-1 left-0 right-0 h-1 bg-gray-400 rounded-full shadow-lg shadow-yellow-400/60"></div>
          </a>
        </nav>
      </header>

      {/* Separator Line */}
      <div className="h-0.5 bg-gradient-to-r from-gray-400 via-white to-gray-400 shadow-md"></div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg bg-white/90 rounded-xl shadow-xl p-8 text-center">
          <p className="text-2xl font-black text-gray-900">Work in progress</p>
        </div>
      </main>
    </div>
  );
}
