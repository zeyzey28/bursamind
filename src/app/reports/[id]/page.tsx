"use client";

import { use, useEffect, useState } from 'react';
import { getReportById, updateReportStatus, updateMunicipalityResponse } from '@/lib/reportService';
import { Report, Status } from '@/types/report';
import { getCurrentProfile } from '@/lib/auth';
import { Profile } from '@/types/auth';
import RiskBadge from '@/components/RiskBadge';
import StatusBadge from '@/components/StatusBadge';
import ReportMap from '@/components/ReportMap';
import RouteMap from '@/components/RouteMap';
import Link from 'next/link';
import { getRelevantServicePoints } from '@/lib/location/servicePoints';
import {
  findNearestServicePointByRoute,
  formatDistance,
  formatDuration,
  ServicePointRouteResult,
} from '@/lib/routing/osrm';
import type { LineString } from 'geojson';

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [report, setReport] = useState<Report | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Response states
  const [responseText, setResponseText] = useState('');
  const [isSavingResponse, setIsSavingResponse] = useState(false);

  // Route states
  const [routeResult, setRouteResult] = useState<ServicePointRouteResult | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [routingError, setRoutingError] = useState(false);

  // Load report + profile
  useEffect(() => {
    async function load() {
      const p = await getCurrentProfile();
      setProfile(p);

      const data = await getReportById(id);
      if (data) {
        setReport(data);
        setResponseText(data.municipalityResponse || '');
      }
      setIsLoading(false);
    }
    load();
  }, [id]);

  // Calculate nearest service point route once report is loaded and has coords
  useEffect(() => {
    if (!report?.latitude || !report?.longitude) return;

    async function calcRoute() {
      if (!report) return;
      setIsRoutingLoading(true);
      setRoutingError(false);

      try {
        const servicePoints = getRelevantServicePoints(report.department, report.category);
        const reportLoc = { latitude: report.latitude!, longitude: report.longitude! };
        const result = await findNearestServicePointByRoute(reportLoc, servicePoints);

        if (result) {
          setRouteResult(result);
        } else {
          setRoutingError(true);
        }
      } catch {
        setRoutingError(true);
      } finally {
        setIsRoutingLoading(false);
      }
    }

    calcRoute();
  }, [report]);

  const handleResponseUpdate = async () => {
    if (!report) return;
    setIsSavingResponse(true);

    await updateMunicipalityResponse(id, responseText);

    setReport({
      ...report,
      municipalityResponse: responseText,
      responseUpdatedAt: new Date().toISOString(),
    });

    setIsSavingResponse(false);
    setSuccessMessage('Belediye geri dönüşü başarıyla kaydedildi.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleStatusUpdate = async (newStatus: Status) => {
    if (!report) return;

    const updated = { ...report, status: newStatus, updatedAt: new Date().toISOString() };
    setReport(updated);

    await updateReportStatus(id, newStatus);

    const statusMap: Record<string, string> = {
      pending: 'BEKLEMEDE',
      in_review: 'İNCELENİYOR',
      resolved: 'ÇÖZÜLDÜ',
      rejected: 'REDDEDİLDİ',
    };

    setSuccessMessage(
      `Bildirim durumu resmi olarak güncellendi: ${statusMap[newStatus] || newStatus.toUpperCase()}`
    );
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-zinc-950 text-zinc-300 flex flex-col items-center justify-center min-h-[100vh] pt-20">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-medium">Güvenli bildirim kanalı çözümleniyor...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 bg-zinc-950 flex items-center justify-center min-h-[100vh] px-6 pt-20">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-950/40 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Bildirim Bulunamadı</h2>
          <p className="text-zinc-500 mb-6">
            İstenilen sorun bildirimi mevcut değil veya kamu kayıtlarından çıkarılmış.
          </p>
          <Link
            href={profile?.role === 'municipality' ? '/municipality' : '/citizen'}
            className="inline-block w-full py-3.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
          >
            Panele Dön
          </Link>
        </div>
      </div>
    );
  }

  const statusOptions: Status[] = ['pending', 'in_review', 'resolved', 'rejected'];
  const hasLocation = typeof report.latitude === 'number' && typeof report.longitude === 'number';

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-300 py-12 px-6 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={profile?.role === 'municipality' ? '/municipality' : '/citizen'}
            className="text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-2 text-sm font-medium"
          >
            ← {profile?.role === 'municipality' ? 'Belediye Paneline Dön' : 'Geri Dön'}
          </Link>
        </div>

        {/* Global feedback  */}
        {successMessage && (
          <div className="mb-6 bg-emerald-500/30 border border-emerald-800/50 text-emerald-500 p-4 rounded-xl flex items-center gap-3 shadow-sm text-sm font-medium">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 flex items-center justify-center rounded-full text-white">
              ✓
            </span>
            {successMessage}
          </div>
        )}

        <div className="bg-zinc-900 rounded-3xl shadow-xl border border-zinc-800 overflow-hidden flex flex-col md:flex-row">

          {/* ── Main Inspection View ──────────────────────────────────── */}
          <div className="flex-1 p-8 md:p-10 border-b md:border-b-0 md:border-r border-zinc-800">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <StatusBadge status={report.status} />
              <RiskBadge score={report.riskScore} priority={report.priority} />
              <span className="text-zinc-500 text-sm font-mono tracking-wide">ID: {report.id}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-snug">
              {report.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="text-zinc-500">Sınıf:</span>
                <span className="font-medium text-zinc-300">{report.category}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="text-zinc-500">Birim:</span>
                <span className="font-medium text-zinc-300">{report.department}</span>
              </span>
            </div>

            {report.imageUrl && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={report.imageUrl}
                  alt="Attached Evidence"
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-3">
              Olay Açıklaması
            </h3>
            <p className="text-zinc-500 leading-relaxed mb-10 whitespace-pre-wrap">
              {report.description}
            </p>

            {/* Ön Değerlendirme */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-8">
              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">
                Ön Değerlendirme
              </h4>
              <p className="text-sm text-zinc-300 mb-4 leading-relaxed font-medium">
                {report.aiSummary}
              </p>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Yönlendirme
                </p>
                <p className="text-sm font-medium text-white">{report.recommendedAction}</p>
              </div>
            </div>

            {/* ── En Yakın Müdahale Noktası ──────────────────────────── */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-8">
              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">
                En Yakın Müdahale Noktası
              </h4>

              {!hasLocation && (
                <p className="text-zinc-500 text-sm italic">
                  Bu bildirim için konum bilgisi bulunmuyor.
                </p>
              )}

              {hasLocation && isRoutingLoading && (
                <div className="flex items-center gap-3 text-zinc-500 text-sm">
                  <span className="w-4 h-4 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin shrink-0" />
                  En yakın müdahale noktası hesaplanıyor...
                </div>
              )}

              {hasLocation && !isRoutingLoading && routingError && (
                <p className="text-zinc-500 text-sm italic">
                  Rota bilgisi şu anda hesaplanamadı. Lütfen daha sonra tekrar deneyin.
                </p>
              )}

              {hasLocation && !isRoutingLoading && routeResult && (
                <>
                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
                    {[
                      { label: 'İlgili Birim', value: routeResult.servicePoint.department },
                      { label: 'İlçe', value: routeResult.servicePoint.district },
                      {
                        label: 'Müdahale Noktası',
                        value: routeResult.servicePoint.name,
                        full: true,
                      },
                      { label: 'Adres', value: routeResult.servicePoint.address, full: true },
                      {
                        label: 'Tahmini Mesafe',
                        value: formatDistance(routeResult.distanceMeters),
                        highlight: true,
                      },
                      {
                        label: 'Tahmini Süre',
                        value: formatDuration(routeResult.durationSeconds),
                        highlight: true,
                      },
                    ].map(({ label, value, full, highlight }) => (
                      <div key={label} className={full ? 'col-span-2' : ''}>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">
                          {label}
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            highlight ? 'text-emerald-400' : 'text-zinc-200'
                          }`}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Route map */}
                  <div
                    className="rounded-2xl overflow-hidden border border-zinc-800 shadow-xl"
                    style={{ height: 240 }}
                  >
                    <RouteMap
                      reportLocation={{
                        latitude: report.latitude!,
                        longitude: report.longitude!,
                      }}
                      servicePointLocation={{
                        latitude: routeResult.servicePoint.latitude,
                        longitude: routeResult.servicePoint.longitude,
                      }}
                      routeGeometry={routeResult.geometry as LineString | undefined}
                      reportTitle={report.title}
                      servicePointName={routeResult.servicePoint.name}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Belediye Geri Dönüşü */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-500 mb-4 flex items-center gap-2">
                🏛️ Belediye Geri Dönüşü
              </h3>

              {profile?.role === 'municipality' ? (
                <div className="space-y-4">
                  <textarea
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    placeholder="Vatandaşa yapılacak geri dönüşü buraya yazın..."
                    className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm min-h-[120px] resize-none text-white placeholder:opacity-50"
                  />
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[10px] text-zinc-500 italic">
                      {report.responseUpdatedAt
                        ? `Son güncelleme: ${new Date(report.responseUpdatedAt).toLocaleString('tr-TR')}`
                        : 'Henüz geri dönüş yapılmadı.'}
                    </p>
                    <button
                      onClick={handleResponseUpdate}
                      disabled={isSavingResponse}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isSavingResponse ? 'Kaydediliyor...' : 'Geri Dönüşü Kaydet'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {report.municipalityResponse ? (
                    <>
                      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {report.municipalityResponse}
                      </p>
                      <div className="pt-4 border-t border-zinc-800">
                        <p className="text-[10px] text-zinc-500 italic uppercase tracking-widest font-black">
                          RESMİ YANIT TARİHİ:{' '}
                          {new Date(report.responseUpdatedAt!).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-zinc-500 text-sm italic py-4">
                      Bu bildirim için henüz belediye geri dönüşü bulunmuyor.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Context Sidebar ──────────────────────────────────────── */}
          <div className="w-full md:w-80 p-8 md:p-10 bg-zinc-900 flex flex-col h-full shrink-0 border-l border-zinc-800">

            {/* Status overrides */}
            {profile?.role === 'municipality' && (
              <div className="mb-10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
                  Yönetim İşlemleri
                </h3>
                <p className="text-xs text-zinc-500 mb-4">
                  Bu bildirimin işlem durumunu aşağıdan manuel olarak güncelleyin:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(opt => {
                    const labelMap: Record<string, string> = {
                      pending: 'beklemede',
                      in_review: 'inceleniyor',
                      resolved: 'çözüldü',
                      rejected: 'reddedildi',
                    };
                    return (
                      <button
                        key={opt}
                        onClick={() => handleStatusUpdate(opt)}
                        className={`px-3 py-2.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                          report.status === opt
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-emerald-500 hover:text-emerald-500'
                        }`}
                      >
                        {labelMap[opt] || opt.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Coordinate box + minimap */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Konum Koordinatları
                </h3>
                <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    {hasLocation ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <div className="flex flex-col text-[10px] sm:text-xs font-mono text-zinc-500">
                          <span>LAT: {report.latitude!.toFixed(5)}</span>
                          <span>LNG: {report.longitude!.toFixed(5)}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="w-full text-center text-xs text-zinc-500 py-1">
                        Koordinatlar mevcut değil
                      </span>
                    )}
                  </div>

                  <div className="h-48 md:h-56 w-full relative bg-zinc-950">
                    <ReportMap
                      latitude={report.latitude}
                      longitude={report.longitude}
                      title={report.title}
                    />
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Meta Veriler
                </h3>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                  <div>
                    <div className="text-xs text-zinc-500 mb-0.5">Oluşturulma Tarihi</div>
                    <div className="text-sm font-medium text-white">
                      {new Date(report.createdAt).toLocaleString('tr-TR')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 mb-0.5">Son Güncelleme</div>
                    <div className="text-sm font-medium text-white">
                      {new Date(report.updatedAt).toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
