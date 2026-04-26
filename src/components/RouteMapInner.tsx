"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LineString } from 'geojson';
import 'leaflet/dist/leaflet.css';

// ── Icons ────────────────────────────────────────────────────────────────────

const reportIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Green-tinted icon for service point
const serviceIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ── Fit bounds sub-component ──────────────────────────────────────────────────

interface FitBoundsProps {
  points: [number, number][];
}

function FitBounds({ points }: FitBoundsProps) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      const bounds = L.latLngBounds(points.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    }
  }, [map, points]);
  return null;
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface RouteMapProps {
  reportLocation: { latitude: number; longitude: number };
  servicePointLocation: { latitude: number; longitude: number };
  routeGeometry?: LineString | null;
  reportTitle?: string;
  servicePointName?: string;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RouteMapInner({
  reportLocation,
  servicePointLocation,
  routeGeometry,
  reportTitle,
  servicePointName,
}: RouteMapProps) {
  useEffect(() => {
    L.Marker.prototype.options.icon = reportIcon;
  }, []);

  const reportPos: [number, number] = [reportLocation.latitude, reportLocation.longitude];
  const servicePos: [number, number] = [servicePointLocation.latitude, servicePointLocation.longitude];

  // Extract polyline positions from GeoJSON LineString
  const routePositions: [number, number][] = routeGeometry
    ? routeGeometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])
    : [];

  return (
    <MapContainer
      center={reportPos}
      zoom={13}
      scrollWheelZoom={false}
      className="w-full h-full"
      style={{ minHeight: '100%', minWidth: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds points={[reportPos, servicePos]} />

      {/* Report location marker */}
      <Marker position={reportPos} icon={reportIcon} title={reportTitle ?? 'Bildirim Konumu'} />

      {/* Service point marker */}
      <Marker position={servicePos} icon={serviceIcon} title={servicePointName ?? 'Müdahale Noktası'} />

      {/* Route polyline */}
      {routePositions.length > 0 && (
        <Polyline
          positions={routePositions}
          pathOptions={{ color: '#10b981', weight: 4, opacity: 0.8, dashArray: '8 4' }}
        />
      )}
    </MapContainer>
  );
}
