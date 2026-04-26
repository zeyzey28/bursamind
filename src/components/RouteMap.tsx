"use client";

import dynamic from 'next/dynamic';
import type { RouteMapProps } from './RouteMapInner';

const RouteMapInner = dynamic<RouteMapProps>(
  () => import('./RouteMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-zinc-900 animate-pulse rounded-xl flex items-center justify-center text-zinc-500 text-sm">
        Harita yükleniyor...
      </div>
    ),
  }
);

export default function RouteMap(props: RouteMapProps) {
  return <RouteMapInner {...props} />;
}
