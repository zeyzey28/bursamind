"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentProfile } from '@/lib/auth';
import { Profile } from '@/types/auth';
import { getReportsForUser } from '@/lib/reportService';
import { Report } from '@/types/report';
import StatusBadge from '@/components/StatusBadge';

export default function CitizenDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const p = await getCurrentProfile();
      if (!p) {
        router.push('/');
        return;
      }
      if (p.role !== 'citizen') {
        router.push('/municipality');
        return;
      }
      setProfile(p);
      
      const userReports = await getReportsForUser(p.id);
      setReports(userReports);
      setIsLoading(false);
    }
    init();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-300 pt-20">
      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              Hoş geldin, <span className="text-emerald-600">{profile?.full_name.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-zinc-500 mt-1 font-medium">Bursa için yaptığın tüm bildirimleri buradan takip edebilirsin.</p>
          </div>
          <Link 
            href="/report"
            className="px-8 py-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 group"
          >
            <span>+</span> Yeni Sorun Bildir
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Şikayetlerim</h2>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{reports.length} Kayıt</span>
            </div>
            
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden mb-12">
              {reports.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {reports.map((report) => (
                    <Link 
                      key={report.id} 
                      href={`/reports/${report.id}`}
                      className="block p-6 hover:bg-zinc-800/50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <h3 className="font-bold text-white group-hover:text-emerald-500 transition-colors">
                            {report.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                            <span className="font-mono">#{report.id}</span>
                            <span>•</span>
                            <span>{new Date(report.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                        <StatusBadge status={report.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-zinc-500">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="font-medium text-zinc-500">Henüz bir bildirimde bulunmadınız.</p>
                </div>
              )}
              
              <div className="p-4 bg-zinc-900 border-t border-zinc-800 text-center">
                 <button className="text-sm font-bold text-zinc-500 hover:text-emerald-500 transition-colors">Hepsini Gör</button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-xl">
              <h3 className="text-lg font-bold mb-4 text-white">Belediyeden Gelen Geri Dönüşler</h3>
              <div className="space-y-4">
                {reports.filter(r => r.municipalityResponse).length > 0 ? (
                  reports.filter(r => r.municipalityResponse).map(r => (
                    <Link 
                      key={`resp-${r.id}`}
                      href={`/reports/${r.id}`}
                      className="block p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-emerald-500 font-bold">{r.title}</p>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-zinc-500 text-xs line-clamp-2 mb-2">{r.municipalityResponse}</p>
                      <p className="text-[10px] text-zinc-500 font-medium opacity-70">
                        {new Date(r.responseUpdatedAt!).toLocaleDateString('tr-TR')}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm italic text-zinc-500 text-center py-8">
                    Şu an için henüz bir geri dönüş yok.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold mb-2">BursaMind Proje Desteği</h3>
                <p className="text-zinc-500 text-xs mb-4">Şehrimiz için geliştirilen bu platformda fikirlerine her zaman açığız.</p>
                <button className="text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors">Bizimle İletişime Geç</button>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] text-6xl opacity-5 text-white font-black italic">BURSA</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
