import React, { useState } from 'react';
import { Droplets, Lock, Building2, KeyRound, AlertCircle, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PelangganIndustri } from '../types';
import { loginCustomer, DEMO_CUSTOMER_ACCOUNTS } from '../lib/auth';

interface CustomerLoginProps {
  pelangganList: PelangganIndustri[];
  onLoginSuccess: (customer: PelangganIndustri) => void;
}

export const CustomerLogin: React.FC<CustomerLoginProps> = ({
  pelangganList,
  onLoginSuccess
}) => {
  const [identifier, setIdentifier] = useState('AETRA-IND-001');
  const [password, setPassword] = useState('indofood123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = loginCustomer(identifier, password, pelangganList);
      if (res.success && res.customer) {
        onLoginSuccess(res.customer);
      } else {
        setErrorMsg(res.error || 'ID Pelanggan atau kata sandi tidak valid.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi gangguan autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Card Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 text-white text-center relative overflow-hidden">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30 mb-4 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Droplets className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white font-['Plus_Jakarta_Sans']">
              PT AETRA AIR TANGERANG
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-[11px] font-bold uppercase tracking-wider mt-1.5">
              <span>Portal Mandiri Pelanggan Industri</span>
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
              Masuk dengan ID Pelanggan dan kata sandi perusahaan Anda untuk memantau kubikasi air, tracking pembacaan meter, dan mutu lab.
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ID Pelanggan Industri
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Contoh: AETRA-IND-001"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi Akun
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
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer pt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Masuk ke Portal Pelanggan</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Customer Accounts */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Akun Demo Pelanggan (1-Klik)
                </span>
                <span className="text-[10px] text-cyan-700 font-medium">Klik untuk isi otomatis</span>
              </div>
              <div className="space-y-1.5">
                {DEMO_CUSTOMER_ACCOUNTS.slice(0, 4).map((demo) => (
                  <button
                    key={demo.id_pelanggan}
                    type="button"
                    onClick={() => handleSelectDemo(demo.id_pelanggan, demo.password)}
                    className={`w-full text-left p-2 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      identifier === demo.id_pelanggan
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-950 font-medium shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-bold truncate text-slate-900">{demo.nama_perusahaan}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {demo.id_pelanggan} · Pass: <span className="text-cyan-700 font-semibold">{demo.password}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-700 shrink-0">
                      Pilih
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gateway to Staff */}
            <div className="pt-2 text-center text-xs text-slate-500">
              <span>Petugas Internal Aetra? </span>
              <Link to="/staff" className="font-bold text-cyan-700 hover:text-cyan-800 underline">
                Masuk ke Portal Staf Key Account →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
