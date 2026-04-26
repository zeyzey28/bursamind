"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ReportMapProps } from './ReportMap';

// Fix for default marker icons in Next.js/Leaflet
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component to handle map centering when coords change
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapInner({ latitude, longitude, title, reports }: ReportMapProps) {
  const isValidCoord = (num: unknown): num is number => 
    typeof num === 'number' && Number.isFinite(num);

  const hasSingleLocation = isValidCoord(latitude) && isValidCoord(longitude);
  
  // Filter reports to only include ones with valid coordinates
  const validReports = (reports || []).filter(r => 
    isValidCoord(r.latitude) && isValidCoord(r.longitude)
  );
  
  const hasMultipleReports = validReports.length > 0;
  
  if (!hasSingleLocation && !hasMultipleReports) {
    return (
      <div className="w-full h-full min-h-[300px] bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col items-center justify-center p-6 text-center shadow-xl">
        <span className="text-3xl mb-2">🗺️</span>
        <span className="text-zinc-500 text-sm font-medium">Bu bildirim için konum bilgisi mevcut değil.</span>
      </div>
    );
  }

  // Find a valid center for multiple reports if default coords aren't set
  let validCenter: [number, number] | null = null;
  if (!hasSingleLocation && hasMultipleReports) {
    const firstReport = validReports[0];
    // We already filtered validReports, so these are safe to cast
    validCenter = [firstReport.latitude as number, firstReport.longitude as number];
  }

  const center: [number, number] = hasSingleLocation 
    ? [latitude as number, longitude as number] 
    : (validCenter || [40.1824, 29.0655]); // Default Bursa center

  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden shadow-xl border border-zinc-800 relative z-0">
      <MapContainer 
        center={center} 
        zoom={hasSingleLocation ? 15 : 11} 
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ minHeight: '100%', minWidth: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} />
        
        {hasSingleLocation && (
          <Marker position={[latitude as number, longitude as number]}>
            <Popup>
              <div className="font-semibold text-sm">{title || 'Bildirim Konumu'}</div>
            </Popup>
          </Marker>
        )}

        {hasMultipleReports && validReports.map((report) => (
          <Marker key={report.id} position={[report.latitude as number, report.longitude as number]}>
            <Popup>
              <div className="flex flex-col gap-1 min-w-[140px]">
                <span className="font-bold text-sm leading-tight">{report.title}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-zinc-500 uppercase font-mono">
                    {report.status === 'pending' ? 'beklemede' : 
                     report.status === 'in_review' ? 'inceleniyor' :
                     report.status === 'resolved' ? 'çözüldü' :
                     report.status === 'rejected' ? 'reddedildi' : report.status}
                  </span>
                </div>
                <a href={`/reports/${report.id}`} className="block text-center mt-2 px-3 py-1.5 bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900 rounded-md text-xs font-semibold transition-colors">
                  Detayları Gör
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
