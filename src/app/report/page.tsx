"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { analyzeReport } from '@/lib/ai/analyzeReport';
import { createReport } from '@/lib/reportService';
import { uploadImage } from '@/lib/uploadImage';
import { getCurrentProfile } from '@/lib/auth';
import { Profile } from '@/types/auth';
import { Report } from '@/types/report';
import RiskBadge from '@/components/RiskBadge';
import LocationPickerMap from '@/components/LocationPickerMap';
import { isInsideBursa } from '@/lib/location/bursaBoundary';

type LocationMode = 'none' | 'gps' | 'map';

export default function ReportIssuePage() {
  const router = useRouter();

  // ── ALL HOOKS AT TOP LEVEL ──────────────────────────────────────────────
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationMode, setLocationMode] = useState<LocationMode>('none');
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successReport, setSuccessReport] = useState<Report | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const p = await getCurrentProfile();
      if (!p) { router.push('/'); return; }
      if (p.role !== 'citizen') { router.push('/municipality'); return; }
      setProfile(p);
      setIsLoading(false);
    }
    load();
  }, [router]);

  // ── Image ──────────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir resim dosyası seçin.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Resim dosyası boyutu 5MB'dan küçük olmalıdır.");
      return;
    }
    setError('');
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── GPS Location ───────────────────────────────────────────────────────
  const handleLocateMe = () => {
    setIsLocating(true);
    setError('');
    setLocationStatus('idle');

    if (!navigator.geolocation) {
      setError('Coğrafi konum tarayıcınız tarafından desteklenmiyor.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        setLocationMode('gps');
        setIsLocating(false);
        if (isInsideBursa(lat, lng)) {
          setLocationStatus('valid');
          setError('');
        } else {
          setLocationStatus('invalid');
          setError(
            'Mevcut konumunuz Bursa il sınırları dışında görünüyor. Bu sistem şu anda yalnızca Bursa içindeki bildirimleri kabul etmektedir.'
          );
        }
      },
      () => {
        setIsLocating(false);
        setError('Konum alınamadı. Lütfen haritadan konum seçin.');
      }
    );
  };

  // ── Map picker callback ────────────────────────────────────────────────
  const handleMapSelect = (lat: number, lng: number) => {
    setLocation({ lat, lng });
    setLocationMode('map');
    if (isInsideBursa(lat, lng)) {
      setLocationStatus('valid');
      setError('');
    } else {
      setLocationStatus('invalid');
      setError(
        'Seçilen konum Bursa il sınırları dışında görünüyor. Lütfen Bursa içinde bir konum seçin.'
      );
    }
  };

  // ── Clear location ─────────────────────────────────────────────────────
  const clearLocation = () => {
    setLocation(null);
    setLocationMode('none');
    setLocationStatus('idle');
    setError('');
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Başlık ve açıklama gereklidir.');
      return;
    }
    if (!location) {
      setError('Bildirim göndermek için konum seçmelisiniz.');
      return;
    }
    if (locationStatus === 'invalid') {
      setError('Bildirim göndermek için Bursa il sınırları içinde bir konum seçmelisiniz.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let finalImageUrl: string | undefined = imagePreview || undefined;

      if (selectedFile) {
        try {
          const publicUrl = await uploadImage(selectedFile);
          if (publicUrl) finalImageUrl = publicUrl;
        } catch (uploadError: unknown) {
          setError(
            uploadError instanceof Error
              ? uploadError.message
              : 'Resim yüklenemedi. Lütfen tekrar deneyin.'
          );
          setIsSubmitting(false);
          return;
        }
      }

      const analysis = await analyzeReport(title, description);

      const newReport: Report = {
        id: `RPT-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        description,
        imageUrl: finalImageUrl,
        latitude: location.lat,
        longitude: location.lng,
        category: analysis.category,
        department: analysis.department,
        riskScore: analysis.riskScore,
        priority: analysis.priority,
        status: 'pending',
        aiSummary: analysis.aiSummary,
        recommendedAction: analysis.recommendedAction,
        userId: profile?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createReport(newReport);
      setSuccessReport(newReport);
    } catch {
      setError('Gönderim sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center min-h-[100vh] pt-20">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────
  if (successReport) {
    return (
      <div className="flex-1 bg-zinc-950 text-zinc-300 py-12 px-6 flex items-center justify-center min-h-[100vh] pt-20">
        <div className="max-w-xl w-full bg-zinc-900 rounded-3xl shadow-xl border border-zinc-800 p-8 text-center">
          <div className="w-20 h-20 bg-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Bildiriminiz Başarıyla Alındı</h2>
          <p className="text-zinc-500 mb-8">
            Daha iyi bir Bursa için katkıda bulunduğunuz için teşekkür ederiz. Bildiriminiz
            kaydedildi ve ilgili birime yönlendirildi.
          </p>

          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 text-left mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-500 mb-4">
              Ön Değerlendirme
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">İlgili Birim</div>
                  <div className="font-semibold text-white text-sm">{successReport.department}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Risk Düzeyi</div>
                  <div>
                    <RiskBadge score={successReport.riskScore} priority={successReport.priority} />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Ön Değerlendirme</div>
                <div className="text-sm font-medium text-zinc-200">{successReport.aiSummary}</div>
              </div>
              <div className="pt-3 border-t border-zinc-800">
                <div className="text-xs text-zinc-500 mb-1">Yönlendirme</div>
                <div className="text-sm text-zinc-300">{successReport.recommendedAction}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/citizen"
              className="block w-full py-3.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-sm text-center"
            >
              Vatandaş Panelini Aç
            </Link>
            <button
              onClick={() => setSuccessReport(null)}
              className="w-full py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-medium hover:bg-zinc-800 transition-colors"
            >
              Başka Bir Bildirim Gönder
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ──────────────────────────────────────────────────────────
  return (
    <div className="flex-1 bg-zinc-950 text-zinc-300 py-12 px-6 pt-20">
      <div className="max-w-3xl mx-auto">
        <div className="bg-zinc-900 rounded-3xl shadow-xl border border-zinc-800 p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-2 text-white">Sorun Bildir</h1>
          <p className="text-zinc-500 mb-8">
            Bölgenizdeki sorunları bildirerek Bursa&apos;yı geliştirmemize yardımcı olun.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-950/40 text-red-400 rounded-xl text-sm border border-red-900/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-zinc-500">
                Sorun Başlığı
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Sorunu kısaca açıklayın (örn. Ana yolda patlak boru, Çukur)"
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white placeholder:opacity-50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-zinc-500">
                Açıklama
              </label>
              <textarea
                id="description"
                rows={5}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Doğru ayrıntıları sağlayın. Gerekirse 'tehlike', 'yaralanma' gibi bağlamlar sağlayarak ciddi protokolleri tetikleyin."
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white placeholder:opacity-50 resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-500">Fotoğraf Kanıtı</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-zinc-800 bg-zinc-900 rounded-xl flex items-center justify-center cursor-pointer hover:bg-zinc-800/50 transition-colors overflow-hidden relative group"
              >
                {imagePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">Fotoğrafı Değiştir</span>
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-zinc-500">Fotoğraf eklemek için dokunun</span>
                )}
              </div>
            </div>

            {/* ── Location Section ─────────────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-500">Konum Bilgileri</label>
                {location && (
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Konumu Temizle
                  </button>
                )}
              </div>

              {/* Location status feedback */}
              {locationStatus === 'valid' && location && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-900/20 border border-emerald-800/40 rounded-xl text-sm text-emerald-400">
                  <span>✓</span>
                  <span>Konum Bursa sınırları içinde doğrulandı.</span>
                  <span className="ml-auto font-mono text-xs text-emerald-600 tabular-nums">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </span>
                </div>
              )}

              {locationStatus === 'invalid' && location && (
                <div className="px-4 py-2.5 bg-amber-900/20 border border-amber-800/40 rounded-xl text-sm text-amber-400">
                  ⚠ Seçilen konum Bursa sınırları dışında.
                </div>
              )}

              {/* Two-button picker (GPS / Map) */}
              {locationMode === 'none' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-zinc-800 border border-zinc-700 rounded-2xl text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600 transition-all disabled:opacity-50"
                  >
                    <span className="text-2xl">📍</span>
                    {isLocating ? 'Konum Belirleniyor...' : 'Mevcut Konumumu Kullan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMode('map')}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-zinc-800 border border-zinc-700 rounded-2xl text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600 transition-all"
                  >
                    <span className="text-2xl">🗺️</span>
                    Haritadan Konum Seç
                  </button>
                </div>
              )}

              {/* Inline map picker */}
              {locationMode === 'map' && (
                <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-xl" style={{ height: 320 }}>
                  <LocationPickerMap selected={location} onSelect={handleMapSelect} />
                </div>
              )}
              {locationMode === 'map' && !location && (
                <p className="text-xs text-zinc-500 text-center mt-1">
                  Konum seçmek için haritaya tıklayın.
                </p>
              )}

              {/* After GPS was used, allow switching to map */}
              {locationMode === 'gps' && (
                <button
                  type="button"
                  onClick={() => setLocationMode('map')}
                  className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors"
                >
                  Haritadan farklı bir konum seç
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 border border-emerald-500 transition-colors shadow-lg shadow-emerald-500/20 text-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Bildiriminiz alınıyor...
                </>
              ) : (
                'Bildirimi Gönder'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
