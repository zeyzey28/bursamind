import { Report } from '@/types/report';

export default function DashboardStats({ reports }: { reports: Report[] }) {
  const total = reports.length;
  const critical = reports.filter(r => r.priority === 'critical').length;
  const pending = reports.filter(r => r.status === 'pending').length;
  const resolved = reports.filter(r => r.status === 'resolved').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl flex flex-col">
        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Toplam Bildirim</span>
        <span className="text-3xl font-black text-white">{total}</span>
      </div>
      
      <div className="bg-zinc-900 p-5 rounded-2xl border border-red-900/30 shadow-xl flex flex-col relative overflow-hidden">
        <div className="absolute right-0 top-0 w-16 h-16 bg-red-900/10 rounded-bl-full pointer-events-none" />
        <span className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">Kritik Öncelik</span>
        <span className="text-3xl font-black text-white">{critical}</span>
      </div>
      
      <div className="bg-zinc-900 p-5 rounded-2xl border border-amber-900/30 shadow-xl flex flex-col">
        <span className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">Bekleyen Müdahale</span>
        <span className="text-3xl font-black text-white">{pending}</span>
      </div>
      
      <div className="bg-zinc-900 p-5 rounded-2xl border border-emerald-900/30 shadow-xl flex flex-col">
        <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">Çözülenler</span>
        <span className="text-3xl font-black text-white">{resolved}</span>
      </div>
    </div>
  );
}
