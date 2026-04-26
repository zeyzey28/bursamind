"use client";

import dynamic from 'next/dynamic';
import { Report } from '@/types/report';

export interface ReportMapProps {
  latitude?: number;
  longitude?: number;
  title?: string;
  reports?: Report[]; // for multiple markers on dashboard
}

// Dynamically import the actual map component with SSR disabled
const MapInner = dynamic<ReportMapProps>(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl flex items-center justify-center text-zinc-400 text-sm">
      Loading map...
    </div>
  )
});

export default function ReportMap(props: ReportMapProps) {
  return <MapInner {...props} />;
}
