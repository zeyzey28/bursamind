"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentProfile, signOutUser } from '@/lib/auth';
import { Profile } from '@/types/auth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function load() {
      const p = await getCurrentProfile();
      setProfile(p);
    }
    load();
  }, [pathname]);

  const handleLogout = async () => {
    await signOutUser();
    setProfile(null);
    router.push('/');
  };

  const isAuthPage = pathname === '/';

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${
      isAuthPage 
        ? 'bg-transparent text-white pt-4' 
        : 'border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        {!isAuthPage ? (
          <Link href="/" className="font-black text-2xl tracking-tighter flex items-center gap-3.5 group">
            <img src="/bursamind.png" alt="BursaMind Logo" className="w-14 h-14 object-contain" />
            <div className="flex items-center">
              <span className="text-white">Bursa</span>
              <span className="text-emerald-500 group-hover:text-emerald-400 transition-colors">Mind</span>
            </div>
          </Link>
        ) : (
          <div /> // Spacer to keep justify-between alignment
        )}
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {!profile ? (
            !isAuthPage && (
              <Link 
                href="/" 
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Giriş Yap
              </Link>
            )
          ) : (
            <>
              {profile.role === 'citizen' && (
                <>
                  <Link 
                    href="/citizen" 
                    className={`${pathname === '/citizen' ? 'text-emerald-500' : 'text-zinc-400'} hover:text-white transition-colors`}
                  >
                    Vatandaş Paneli
                  </Link>
                  <Link 
                    href="/report" 
                    className={`${pathname === '/report' ? 'text-emerald-500' : 'text-zinc-400'} hover:text-white transition-colors`}
                  >
                    Sorun Bildir
                  </Link>
                </>
              )}
              {profile.role === 'municipality' && (
                <Link 
                  href="/municipality" 
                  className={`${pathname === '/municipality' ? 'text-emerald-500' : 'text-zinc-400'} hover:text-white transition-colors`}
                >
                  Belediye Paneli
                </Link>
              )}
              
              <div className="h-4 w-px bg-zinc-800 mx-1" />
              
              <div className="flex items-center gap-4">
                <span className="text-xs text-zinc-500 font-bold uppercase truncate max-w-[100px]">
                  {profile.full_name}
                </span>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  Çıkış Yap
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
