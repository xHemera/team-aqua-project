"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

const alder = "https://archives.bulbagarden.net/media/upload/e/e8/Spr_B2W2_Alder.png";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [avatar, setAvatar] = useState(alder);

  const avatars = [
    { name: "Alder", url: alder },
    { name: "Red", url: "https://archives.bulbagarden.net/media/upload/d/d2/Spr_HGSS_Red.png" },
    { name: "Cynthia", url: "https://archives.bulbagarden.net/media/upload/3/3e/Spr_B2W2_Cynthia.png" },
    { name: "Leon", url: "https://archives.bulbagarden.net/media/upload/8/87/VSLeon.png" },
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await authClient.getSession();
      if (error || !data) {
        router.push("/");
        return;
      }
      setUser(data.user);
      setLoading(false);
    };
    getUser();
    
    // Charger l'avatar sauvegardé
    const savedAvatar = localStorage.getItem("avatar");
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, [router]);

  const handleAvatarChange = (url: string) => {
    setAvatar(url);
    localStorage.setItem("avatar", url);
    setShowAvatarMenu(false);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <p className="text-white text-xl">Chargement...</p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen text-white overflow-hidden flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: 'url("/images/ectoplasme.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: 'brightness(1.5) contrast(2)'
        }}
      />
      
      {/* Profile Card */}
      <div className="relative z-10 w-full max-w-4xl bg-gray-900 bg-opacity-95 rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-700">
        {/* Home button - top right */}
        <button
          onClick={() => router.push("/home")}
          className="absolute top-4 right-4 z-10 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors font-semibold shadow-lg"
        >
          <i className="fa-solid fa-home"></i>
        </button>
        
        {/* Banner */}
        <div 
          className="h-48 relative"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'url("/images/ectoplasme.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
        
        {/* Profile Content */}
        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="flex justify-center items-center -mt-16 mb-6">
            <div className="relative inline-block">
              <Image
                src={avatar}
                alt="Avatar"
                width={180}
                height={180}
                className="drop-shadow-2xl"
                style={{ imageRendering: 'pixelated' }}
                priority
              />
              
              {/* Avatar Edit Button */}
              <button
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                className="absolute bottom-0 right-0 flex items-center justify-center w-10 h-10 bg-purple-500 hover:bg-purple-600 rounded-full shadow-lg transition-colors font-bold text-white text-xs border-2 border-purple-400"
              >
                <i className="fa-solid fa-edit text-xs"></i>
              </button>
              
              {/* Avatar Selection Menu */}
              {showAvatarMenu && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 border-2 border-gray-700 rounded-lg shadow-2xl p-2 z-50 w-36">
                  <div className="space-y-1">
                    {avatars.map((av) => (
                      <button
                        key={av.name}
                        onClick={() => handleAvatarChange(av.url)}
                        className={`w-full flex items-center gap-2 p-1.5 rounded text-xs transition-colors ${avatar === av.url ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                      >
                        <Image
                          src={av.url}
                          alt={av.name}
                          width={18}
                          height={18}
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <span className="text-xs">{av.name}</span>
                      </button>
                    ))}                  </div>
                </div>
              )}           </div>
          </div>
          
          <div className="flex justify-end -mt-32 mb-6">
            {/* Badges */}
            <div className="flex gap-2 mt-4">
              <span className="bg-yellow-600 px-3 py-1 rounded-md text-xs font-bold">OWNER</span>
              <span className="bg-purple-600 px-3 py-1 rounded-md text-xs font-bold">GIGACHAD</span>
            </div>
          </div>
          
          {/* User Info */}
          <div className="mb-12 -mt-15">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{params.pseudo}</h1>
              <i className="fa-solid fa-circle-check text-blue-500 text-xl"></i>
              <i className="fa-brands fa-telegram text-blue-400 text-xl"></i>
            </div>
            <p className="text-gray-400 text-sm">#1 MIMIKYU ENJOYER</p>
          </div>
          
          {/* Championship Points */}
          <div className="mb-8 bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Championnat Points :</p>
            <p className="text-green-400 text-3xl font-bold">92</p>
          </div>
          
          {/* Tournament History */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-400 text-sm uppercase tracking-wider">Historique des Tournois</h2>
              <div className="text-gray-400 text-sm">
                <span>Total : 4</span>
                <span className="ml-4">Podiums : 4</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Tournament 1 */}
              <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500 hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-yellow-600 px-3 py-1 rounded text-xs font-bold">GAGNANT</span>
                      <span className="font-semibold">Session de ligue</span>
                    </div>
                    <p className="text-gray-400 text-sm">Parence • 26 janv. 2026</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Tournament 2 */}
              <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-gray-500 hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-gray-600 px-3 py-1 rounded text-xs font-bold">FINALISTE</span>
                      <span className="font-semibold">Session de ligue</span>
                    </div>
                    <p className="text-gray-400 text-sm">Geek Island • 18 janv. 2026</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Tournament 3 */}
              <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500 hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-yellow-600 px-3 py-1 rounded text-xs font-bold">GAGNANT</span>
                      <span className="font-semibold">Session de ligue</span>
                    </div>
                    <p className="text-gray-400 text-sm">Parence • 09 déc. 2025</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Tournament 4 */}
              <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500 hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-yellow-600 px-3 py-1 rounded text-xs font-bold">GAGNANT</span>
                      <span className="font-semibold">Session de ligue</span>
                    </div>
                    <p className="text-gray-400 text-sm">Parence • 22 nov. 2025</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Logout button - bottom right */}
        <button
          onClick={handleLogout}
          className="absolute gap-10 bottom-0 right-8 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-lg"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    </main>
  );
}
