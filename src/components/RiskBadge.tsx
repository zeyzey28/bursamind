import { Priority } from '@/types/report';

export default function RiskBadge({ score, priority }: { score: number; priority: Priority }) {
  const colorMap: Record<Priority, string> = {
    critical: 'bg-red-900/40 text-red-400 border-red-800/50',
    high: 'bg-orange-900/40 text-orange-400 border-orange-800/50',
    medium: 'bg-amber-900/40 text-amber-400 border-amber-800/50',
    low: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50',
  };

  const labels: Record<Priority, string> = {
    critical: 'KRİTİK',
    high: 'YÜKSEK',
    medium: 'ORTA',
    low: 'DÜŞÜK',
  };

  const colors = colorMap[priority] ?? 'bg-zinc-800 text-zinc-300 border-zinc-700';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${colors}`}>
      {labels[priority] ?? priority.toUpperCase()} - {score}
    </span>
  );
}
