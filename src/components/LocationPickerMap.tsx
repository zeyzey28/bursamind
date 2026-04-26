"use client";

import dynamic from 'next/dynamic';

interface LocationPickerMapProps {
  selected: { lat: number; lng: number } | null;
  onSelect: (lat: number, lng: number) => void;
}

const LocationPickerMapInner = dynamic<LocationPickerMapProps>(
  () => import('./LocationPickerMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-zinc-900 animate-pulse rounded-xl flex items-center justify-center text-zinc-500 text-sm">
        Harita yükleniyor...
      </div>
    ),
  }
);

export default function LocationPickerMap(props: LocationPickerMapProps) {
  return <LocationPickerMapInner {...props} />;
}
