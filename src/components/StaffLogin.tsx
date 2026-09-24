import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loginStaff, DEMO_STAFF_ACCOUNTS } from '../lib/auth';
import { StaffUser } from '../types';

interface StaffLoginProps {
  onLoginSuccess: (user: StaffUser) => void;
}

export const StaffLogin: React.FC<StaffLoginProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('staff.keyaccount@aetra-tangerang.co.id');
  const [password, setPassword] = useState('aetra2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const result = await loginStaff(identifier, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMsg(result.error || 'Autentikasi gagal. Periksa kembali email dan kata sandi Anda.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi gangguan saat memproses login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Bar Link */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Ke Halaman Portal Pelanggan</span>
        </Link>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-800/40 px-2.5 py-1 rounded border border-slate-700/40">
          Akses Internal Terproteksi
        </span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-6">
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Card Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-800 to-slate-800/60 border-b border-slate-700/80 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 mb-4 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              PT AETRA AIR TANGERANG
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300 mt-1">
              Portal Staf Key Account & Pengujian Lab
            </p>
            <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
              Silakan masuk dengan akun resmi untuk mengakses pencatatan meter, data mutu air, dan layanan industri.
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 flex items-start gap-2.5 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Korporat / NIK Staf
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="nama.staf@aetra-tangerang.co.id"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Simpan sesi login staf</span>
                </label>
                <span className="text-[11px] text-slate-500">SSO & Supabase Ready</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Masuk ke Dashboard Staf</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Box */}
            <div className="pt-4 border-t border-slate-700/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Pilih Akun Demo Staf (1-Klik)
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">Password: aetra2026</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {DEMO_STAFF_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectDemo(acc.email, acc.password_hint)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                      identifier === acc.email
                        ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-700/70 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-cyan-300 shrink-0">
                        {acc.avatar_initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold truncate text-slate-200">{acc.nama}</div>
                        <div className="text-[10px] text-slate-400 truncate">{acc.jabatan} ({acc.nik})</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-semibold shrink-0 ml-2 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      Pilih
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-md w-full mx-auto text-center text-slate-500 text-xs py-2">
        <p>© PT Aetra Air Tangerang · Divisi Key Account & Mutu Air Minum</p>
        <p className="text-[10px] text-slate-600 mt-0.5">
          Sistem Terbatas & Terenkripsi · Sesuai Standar Permenkes RI No. 2 Tahun 2023
        </p>
      </div>
    </div>
  );
};
