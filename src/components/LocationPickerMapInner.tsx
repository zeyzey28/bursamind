"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BURSA_CENTER } from '@/lib/location/bursaBoundary';

// Fix default marker icons in Next.js/Leaflet
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationPickerMapProps {
  selected: { lat: number; lng: number } | null;
  onSelect: (lat: number, lng: number) => void;
}

/** Inner component that captures map click events */
function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Exported client-side map picker – must be loaded via dynamic import with ssr:false */
export default function LocationPickerMap({ selected, onSelect }: LocationPickerMapProps) {
  // Disable Leaflet's default icon detection once on mount
  useEffect(() => {
    L.Marker.prototype.options.icon = markerIcon;
  }, []);

  const center: [number, number] = selected
    ? [selected.lat, selected.lng]
    : [BURSA_CENTER.latitude, BURSA_CENTER.longitude];

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={false}
      className="w-full h-full"
      style={{ minHeight: '100%', minWidth: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onSelect={onSelect} />
      {selected && (
        <Marker
          position={[selected.lat, selected.lng]}
          icon={markerIcon}
        />
      )}
    </MapContainer>
  );
}
