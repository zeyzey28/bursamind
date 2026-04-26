import { Status } from '@/types/report';

export default function StatusBadge({ status }: { status: Status }) {
  const getFormat = () => {
    switch(status) {
      case 'pending': 
        return { label: 'Beklemede', colors: 'border-zinc-700 text-zinc-400 bg-zinc-800' };
      case 'in_review': 
        return { label: 'İnceleniyor', colors: 'border-blue-900/30 text-blue-400 bg-blue-950/40' };
      case 'resolved': 
        return { label: 'Çözüldü', colors: 'border-emerald-900/30 text-emerald-400 bg-emerald-950/40' };
      case 'rejected': 
        return { label: 'Reddedildi', colors: 'border-red-900/30 text-red-400 bg-red-950/40' };
    }
  };

  const formatted = getFormat();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${formatted.colors}`}>
      {formatted.label}
    </span>
  );
}
