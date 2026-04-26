"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getReports } from '@/lib/reportService';
import { Report } from '@/types/report';
import { getCurrentProfile } from '@/lib/auth';
import ReportCard from '@/components/ReportCard';
import ReportMap from '@/components/ReportMap';

// Status filter matching request spec
type StatusFilter = 'all' | 'in_review' | 'resolved' | 'rejected';

// Priority filter
type PriorityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';

// Combined active filter state
type FilterSection = 'status' | 'priority';

export default function MunicipalityDashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [activeSection, setActiveSection] = useState<FilterSection>('status');

  useEffect(() => {
    async function init() {
      const profile = await getCurrentProfile();
      if (!profile) { router.push('/'); return; }
      if (profile.role !== 'municipality') { router.push('/citizen'); return; }
      const data = await getReports();
      setReports(data);
      setIsLoading(false);
    }
    init();
  }, [router]);

  // ── Counts ───────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all: reports.length,
    in_review: reports.filter(r => r.status === 'in_review').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
    pending: reports.filter(r => r.status === 'pending').length,
    critical: reports.filter(r => r.priority === 'critical').length,
    high: reports.filter(r => r.priority === 'high').length,
    medium: reports.filter(r => r.priority === 'medium').length,
    low: reports.filter(r => r.priority === 'low').length,
  }), [reports]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const statusOk = statusFilter === 'all' ? true : r.status === statusFilter;
      const priorityOk = priorityFilter === 'all' ? true : r.priority === priorityFilter;
      return statusOk && priorityOk;
    });
  }, [reports, statusFilter, priorityFilter]);

  // ── Status filter cards config ───────────────────────────────────────────
  const statusCards: { id: StatusFilter; label: string; accent: string; border: string; text: string }[] = [
    {
      id: 'all',
      label: 'Tümü',
      accent: 'text-zinc-300',
      border: 'border-zinc-700',
      text: 'text-white',
    },
    {
      id: 'in_review',
      label: 'İncelenenler',
      accent: 'text-amber-400',
      border: 'border-amber-900/40',
      text: 'text-white',
    },
    {
      id: 'resolved',
      label: 'Çözülenler',
      accent: 'text-emerald-400',
      border: 'border-emerald-900/40',
      text: 'text-white',
    },
    {
      id: 'rejected',
      label: 'Reddedilenler',
      accent: 'text-red-400',
      border: 'border-red-900/40',
      text: 'text-white',
    },
  ];

  // ── Priority filter pills config ─────────────────────────────────────────
  const priorityPills: { id: PriorityFilter; label: string }[] = [
    { id: 'all', label: 'Tüm Öncelikler' },
    { id: 'critical', label: 'Kritik' },
    { id: 'high', label: 'Yüksek' },
    { id: 'medium', label: 'Orta' },
    { id: 'low', label: 'Düşük' },
  ];

  const statusCount = (id: StatusFilter) => {
    if (id === 'all') return counts.all;
    return counts[id];
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-zinc-950 text-zinc-300 flex flex-col items-center justify-center min-h-[100vh] pt-20">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-medium">Belediye altyapısı yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-300 flex flex-col items-center pt-20">
      <div className="w-full max-w-7xl px-6 py-12 flex flex-col gap-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Belediye Paneli</h1>
          <p className="text-zinc-500 mt-1">Sorun Yönetim Paneli</p>
        </div>

        {/* ── Clickable Status Filter Cards ────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statusCards.map(card => {
            const isActive = statusFilter === card.id;
            return (
              <button
                key={card.id}
                onClick={() => {
                  setStatusFilter(card.id);
                  setActiveSection('status');
                }}
                className={`
                  relative flex flex-col items-start p-5 rounded-2xl border transition-all text-left
                  ${isActive
                    ? `bg-zinc-800 ${card.border} ring-1 ring-inset ${card.border.replace('border-', 'ring-')} shadow-lg`
                    : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/70 hover:border-zinc-700'
                  }
                `}
              >
                <span className={`text-xs font-bold uppercase tracking-widest mb-3 ${isActive ? card.accent : 'text-zinc-500'}`}>
                  {card.label}
                </span>
                <span className={`text-3xl font-black ${isActive ? card.text : 'text-zinc-300'}`}>
                  {statusCount(card.id)}
                </span>
                {isActive && (
                  <span className={`absolute bottom-2 right-3 text-[10px] font-bold uppercase tracking-widest ${card.accent} opacity-60`}>
                    Aktif Filtre
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Priority Filter Pills ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {priorityPills.map(pill => {
            const isActive = priorityFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => {
                  setPriorityFilter(pill.id);
                  setActiveSection('priority');
                }}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  isActive
                    ? 'bg-zinc-700 border-zinc-600 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                }`}
              >
                {pill.label}
                {pill.id !== 'all' && (
                  <span className={`ml-2 text-xs font-bold tabular-nums ${isActive ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {counts[pill.id]}
                  </span>
                )}
              </button>
            );
          })}

          {/* Reset both filters */}
          {(statusFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); }}
              className="shrink-0 ml-auto px-3 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 border border-zinc-800 transition-all"
            >
              Filtreleri Sıfırla
            </button>
          )}
        </div>

        {/* ── Map ───────────────────────────────────────────────────────── */}
        <div className="w-full h-80 md:h-96 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between z-10">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-lg">🗺️</span> Şehir Geneli Canlı Harita
            </h2>
            <span className="text-xs text-zinc-500 font-medium tabular-nums">
              {filteredReports.length} kayıt gösteriliyor
            </span>
          </div>
          <div className="flex-1 relative z-0">
            <ReportMap reports={filteredReports} />
          </div>
        </div>

        {/* ── Report Grid ───────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">
              Bildirimler
              <span className="ml-2 text-zinc-500 font-normal text-sm">({filteredReports.length})</span>
            </h2>
          </div>

          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.length > 0 ? (
              filteredReports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
                <p className="text-zinc-400 font-medium">Bu kategoride henüz kayıt bulunmuyor.</p>
                <button
                  onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); }}
                  className="mt-4 text-xs text-emerald-500 hover:text-emerald-400 font-semibold transition-colors"
                >
                  Tüm bildirimleri göster
                </button>
              </div>
            )}
          </main>
        </div>

      </div>
    </div>
  );
}
