"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signUpUser, signInUser, getCurrentProfile, signOutUser } from '@/lib/auth';
import { UserRole } from '@/types/auth';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'citizen' | 'municipality'>('citizen');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    // Check if already logged in
    async function checkSession() {
      const profile = await getCurrentProfile();
      if (profile) {
        if (profile.role === 'citizen') router.push('/citizen');
        else if (profile.role === 'municipality') router.push('/municipality');
      }
    }
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isRegister) {
        const { data, error: signUpError } = await signUpUser(
          email, 
          password, 
          fullName, 
          activeTab, 
          activeTab === 'municipality' ? department : undefined
        );
        
        if (signUpError) throw signUpError;

        // If session exists (auto-login), sign out to force manual login
        if (data?.session) {
          await signOutUser();
        }

        // Switch to login mode
        setIsRegister(false);
        setPassword('');
        setSuccess('Kayıt başarıyla oluşturuldu. Devam etmek için giriş yapabilirsiniz.');
      } else {
        const { data, error: signInError } = await signInUser(email, password);
        if (signInError) throw signInError;
        
        if (data?.user) {
          const profile = await getCurrentProfile();
          if (profile) {
            if (profile.role === 'citizen') router.push('/citizen');
            else router.push('/municipality');
          } else {
            setError('Kullanıcı profili bulunamadı.');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans">
      <main className="max-w-[1200px] mx-auto px-6 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 py-12 lg:py-0">
        
        {/* LEFT COLUMN: PRODUCT INFO */}
        <div className="w-full lg:max-w-[520px] flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="text-xl font-bold tracking-tight flex items-center gap-4">
              <img src="/bursamind.png" alt="BursaMind Logo" className="w-20 h-20 object-contain" />
              <div className="flex items-center text-3xl">
                <span>Bursa</span><span className="text-emerald-600">Mind</span>
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              Akıllı Şehir Bildirim ve Yönetim Platformu
            </h1>
            <p className="text-zinc-500 text-base lg:text-lg leading-relaxed">
              Şehirde gördüğünüz sorunları birkaç adımda bildirebilir, belediye ekiplerinin süreci daha hızlı ve düzenli şekilde yönetmesine katkı sağlayabilirsiniz.
            </p>
          </div>

          <ul className="space-y-3.5">
            {[
              'Konum tabanlı bildirim',
              'Fotoğraflı sorun kaydı',
              'Bildirim takibi',
              'Belediye birim yönetimi'
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT COLUMN: AUTH CARD */}
        <div className="w-full lg:max-w-[440px]">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-8 lg:p-10 shadow-xl">
            
            {/* Tabs */}
            <div className="flex p-1 bg-zinc-900 rounded-xl mb-8 border border-zinc-800">
              <button 
                onClick={() => { setActiveTab('citizen'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'citizen' ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Vatandaş
              </button>
              <button 
                onClick={() => { setActiveTab('municipality'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'municipality' ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Belediye
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-1">
                {activeTab === 'citizen' ? 'Vatandaş Girişi' : 'Belediye Personeli'}
              </h2>
              <p className="text-zinc-500 text-xs font-medium">
                {activeTab === 'citizen' 
                  ? 'Şehir bildirimleri için giriş yapın.' 
                  : 'Yönetim paneline erişim sağlayın.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-[11px] font-bold">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-[11px] font-bold">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest ml-1">Ad Soyad</label>
                  <input 
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-emerald-500 outline-none transition-all text-sm placeholder:opacity-50"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest ml-1">E-Posta</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-emerald-500 outline-none transition-all text-sm placeholder:opacity-50"
                  placeholder="eposta@bursa.gov.tr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest ml-1">Şifre</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-emerald-500 outline-none transition-all text-sm placeholder:opacity-50"
                  placeholder="••••••••"
                />
              </div>

              {isRegister && activeTab === 'municipality' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest ml-1">Birim</label>
                    <select 
                      required
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-emerald-500 outline-none transition-all text-sm text-zinc-500"
                    >
                      <option value="">Birim Seçiniz</option>
                      <option value="Fen İşleri">Fen İşleri</option>
                      <option value="BUSKİ">BUSKİ</option>
                      <option value="Ulaşım">Ulaşım</option>
                      <option value="İtfaiye">İtfaiye</option>
                      <option value="Parklar ve Bahçeler">Parklar ve Bahçeler</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-zinc-500 italic mt-2 leading-tight">
                    Bu MVP sürümünde belediye personeli kaydı demo amaçlı açıktır. Üretim ortamında yönetici onayı gerektirir.
                  </p>
                </>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all mt-4 disabled:opacity-50 border border-zinc-800"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  isRegister ? 'Kayıt Ol' : 'Giriş Yap'
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-zinc-800 pt-6">
              <button 
                onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
                className="text-xs text-zinc-500 hover:text-emerald-500 font-bold transition-all"
              >
                {isRegister ? 'Zaten hesabınız var mı? Giriş yapın' : 'Henüz hesabınız yok mu? Kayıt olun'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
