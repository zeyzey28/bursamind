import { Report } from '@/types/report';
import RiskBadge from './RiskBadge';
import StatusBadge from './StatusBadge';
import Link from 'next/link';

export default function ReportCard({ report }: { report: Report }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{report.id}</span>
          <h3 className="font-bold text-lg text-white leading-tight">{report.title}</h3>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <RiskBadge score={report.riskScore} priority={report.priority} />
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
          {report.category}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
          {report.department}
        </span>
        {report.municipalityResponse ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-900/30 text-emerald-400 text-xs font-medium border border-emerald-800/50">
            ✓ Geri dönüş var
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-900/30 text-amber-400 text-xs font-medium border border-amber-800/50">
            ⏳ Geri dönüş bekliyor
          </span>
        )}
      </div>

      <div className="mb-4 text-sm text-zinc-300 flex-grow">
        <p className="line-clamp-2">{report.description}</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-4">
        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">
          Ön Değerlendirme
        </h4>
        <p className="text-sm text-zinc-300 mb-3 leading-relaxed">{report.aiSummary}</p>
        <div className="flex items-start gap-1.5 text-xs">
          <span className="text-zinc-500 font-semibold shrink-0">Yönlendirme:</span>
          <span className="text-zinc-400">{report.recommendedAction}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-700/50">
        <div className="flex flex-col text-xs text-zinc-500 gap-0.5">
          <span>{new Date(report.createdAt).toLocaleDateString('tr-TR')}</span>
          {report.latitude && report.longitude && (
            <span className="font-mono">{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
          )}
        </div>
        <Link 
          href={`/reports/${report.id}`} 
          className="text-sm font-medium text-emerald-400 hover:underline px-3 py-1.5 rounded-lg hover:bg-emerald-900/30 transition-colors"
        >
          Detayları Gör
        </Link>
      </div>
    </div>
  );
}
