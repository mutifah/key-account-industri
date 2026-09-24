import React, { useState } from 'react';
import {
  Lock,
  Building2,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Mail,
  User,
  MapPin,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PelangganIndustri } from '../types';
import { loginCustomer } from '../lib/auth';
import { useData } from '../context/DataContext';

interface CustomerLoginProps {
  pelangganList: PelangganIndustri[];
  onLoginSuccess: (customer: PelangganIndustri) => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const CustomerLogin: React.FC<CustomerLoginProps> = ({
  pelangganList,
  onLoginSuccess
}) => {
  const { handleSaveCustomer } = useData();

  const [mode, setMode] = useState<AuthMode>('login');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State: Login
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form State: Register
  const nextSuggestedId = `AETRA-IND-${String(pelangganList.length + 1).padStart(3, '0')}`;
  const [regForm, setRegForm] = useState({
    id_pelanggan: nextSuggestedId,
    nama_perusahaan: '',
    bidang_usaha: 'Makanan & Minuman',
    alamat_kawasan: '',
    zona_distribusi: 'Zona A - Cikupa & Pasar Kemis',
    no_meter: '',
    pic_nama: '',
    pic_telepon: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Form State: Forgot Password
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<'identify' | 'reset'>('identify');
  const [matchedCustomer, setMatchedCustomer] = useState<PelangganIndustri | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = loginCustomer(loginId.trim(), loginPassword, pelangganList);
      if (res.success && res.customer) {
        onLoginSuccess(res.customer);
      } else {
        setErrorMsg(res.error || 'ID Pelanggan atau kata sandi tidak cocok.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kendala saat verifikasi login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regForm.password !== regForm.confirm_password) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.');
      return;
    }

    if (regForm.password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter demi keamanan akun industri Anda.');
      return;
    }

    const trimmedId = regForm.id_pelanggan.trim().toUpperCase();
    const isIdExist = pelangganList.some(
      p => p.id_pelanggan.toUpperCase() === trimmedId
    );
    if (isIdExist) {
      setErrorMsg(`ID Pelanggan ${trimmedId} sudah terdaftar. Harap gunakan ID lain.`);
      return;
    }

    setIsLoading(true);

    try {
      const newCustomer: PelangganIndustri = {
        id_pelanggan: trimmedId,
        nama_perusahaan: regForm.nama_perusahaan.trim(),
        bidang_usaha: regForm.bidang_usaha,
        alamat_kawasan: regForm.alamat_kawasan.trim() || 'Kawasan Industri Tangerang',
        zona_distribusi: regForm.zona_distribusi,
        no_meter: regForm.no_meter.trim() || `MTR-${Math.floor(1000 + Math.random() * 9000)}`,
        pic_nama: regForm.pic_nama.trim(),
        pic_telepon: regForm.pic_telepon.trim(),
        email: regForm.email.trim().toLowerCase(),
        password: regForm.password,
        status_aktif: true,
        created_at: new Date().toISOString()
      };

      await handleSaveCustomer(newCustomer);
      setSuccessMsg(`Pendaftaran berhasil! Akun untuk ${newCustomer.nama_perusahaan} telah aktif.`);
      setLoginId(newCustomer.id_pelanggan);
      setLoginPassword(newCustomer.password || '');
      setMode('login');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mendaftarkan akun ke database.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotIdentify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const query = forgotIdentifier.trim().toLowerCase();
    const found = pelangganList.find(
      p =>
        p.id_pelanggan.toLowerCase() === query ||
        (p.email && p.email.toLowerCase() === query)
    );

    if (!found) {
      setErrorMsg('ID Pelanggan atau Email PIC tidak ditemukan pada pangkalan data Aetra.');
      return;
    }

    setMatchedCustomer(found);
    setForgotStep('reset');
  };

  const handleForgotResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!matchedCustomer) return;

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak sama.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Kata sandi baru minimal 6 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const updatedCustomer: PelangganIndustri = {
        ...matchedCustomer,
        password: newPassword
      };

      await handleSaveCustomer(updatedCustomer);
      setSuccessMsg('Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru.');
      setLoginId(updatedCustomer.id_pelanggan);
      setLoginPassword(newPassword);
      setMode('login');
      setForgotStep('identify');
      setMatchedCustomer(null);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal memperbarui kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className={`w-full mx-auto transition-all ${mode === 'register' ? 'max-w-xl' : 'max-w-md'}`}>
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
          
          {/* Card Header with Official Transparent Aetra Logo */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 text-white text-center relative overflow-hidden">
            {/* Official Logo Display */}
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg shadow-cyan-500/10 mb-3 mx-auto">
              <img
                src="/aetra-logo.png"
                alt="PT Aetra Air Tangerang"
                className="h-12 sm:h-14 w-auto object-contain"
                onError={(e) => {
                  // Fallback to text if image not ready
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-['Plus_Jakarta_Sans']">
              PT AETRA AIR TANGERANG
            </h2>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-700/60 text-cyan-300 text-xs font-bold uppercase tracking-wider mt-2">
              <span>
                {mode === 'login' && 'Portal Mandiri Pelanggan Industri'}
                {mode === 'register' && 'Pendaftaran Akun Industri Baru'}
                {mode === 'forgot' && 'Pemulihan Kata Sandi Akun'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
              {mode === 'login' &&
                'Masuk dengan ID Pelanggan Industri dan kata sandi Anda untuk memantau kubikasi air, tracking pembacaan meter, dan mutu lab.'}
              {mode === 'register' &&
                'Daftarkan fasilitas industri Anda untuk mendapatkan akses pemantauan suplai air minum dan transparansi pembacaan meter.'}
              {mode === 'forgot' &&
                'Atur ulang kata sandi akun industri Anda secara mandiri atau hubungi PIC Layanan Key Account Aetra.'}
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Alerts */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 leading-relaxed animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 leading-relaxed animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* 1. VIEW: LOGIN                                            */}
            {/* ========================================================= */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="Contoh: AETRA-IND-001"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 font-mono transition-all uppercase"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Kata Sandi Akun
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 hover:underline cursor-pointer"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
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

                {/* Option to Register New Account */}
                <div className="pt-4 border-t border-slate-200 text-center">
                  <p className="text-xs text-slate-600">
                    Belum memiliki akun pelanggan industri?
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100/80 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer border border-cyan-200"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftar Akun Industri Baru</span>
                  </button>
                </div>

                {/* Gateway to Staff */}
                <div className="pt-2 text-center text-xs text-slate-500">
                  <span>Petugas Internal Aetra? </span>
                  <Link to="/staff" className="font-bold text-cyan-700 hover:text-cyan-800 underline">
                    Masuk ke Portal Staf Key Account →
                  </Link>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* 2. VIEW: REGISTER (BIKIN AKUN BARU)                      */}
            {/* ========================================================= */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ID Pelanggan
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.id_pelanggan}
                      onChange={(e) => setRegForm({ ...regForm, id_pelanggan: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bidang Usaha / Industri
                    </label>
                    <select
                      value={regForm.bidang_usaha}
                      onChange={(e) => setRegForm({ ...regForm, bidang_usaha: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                    >
                      <option value="Makanan & Minuman">Makanan & Minuman (F&B)</option>
                      <option value="Tekstil & Garmen">Tekstil & Garmen</option>
                      <option value="Farmasi & Kimia">Farmasi & Kimia</option>
                      <option value="Otomotif & Komponen">Otomotif & Komponen</option>
                      <option value="Elektronik & Mesin">Elektronik & Mesin</option>
                      <option value="Manufaktur Lainnya">Manufaktur Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Perusahaan / Pabrik
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regForm.nama_perusahaan}
                      onChange={(e) => setRegForm({ ...regForm, nama_perusahaan: e.target.value })}
                      placeholder="Contoh: PT Indotirta Prima Sejahtera"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama PIC Perusahaan
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regForm.pic_nama}
                        onChange={(e) => setRegForm({ ...regForm, pic_nama: e.target.value })}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      No. Telepon / WhatsApp PIC
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={regForm.pic_telepon}
                        onChange={(e) => setRegForm({ ...regForm, pic_telepon: e.target.value })}
                        placeholder="0812-xxxx-xxxx"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email PIC Resmi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        required
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        placeholder="pic@perusahaan.co.id"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor Seri Meter (Opsional)
                    </label>
                    <input
                      type="text"
                      value={regForm.no_meter}
                      onChange={(e) => setRegForm({ ...regForm, no_meter: e.target.value })}
                      placeholder="MTR-IND-..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Kawasan Industri / Fasilitas
                  </label>
                  <div className="relative">
                    <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regForm.alamat_kawasan}
                      onChange={(e) => setRegForm({ ...regForm, alamat_kawasan: e.target.value })}
                      placeholder="Jl. Industri Raya Blok A No. 1, Cikupa, Tangerang"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="Min. 6 karakter"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Konfirmasi Sandi
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regForm.confirm_password}
                        onChange={(e) => setRegForm({ ...regForm, confirm_password: e.target.value })}
                        placeholder="Ulangi kata sandi"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mendaftarkan ke Database...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Daftarkan Akun Pelanggan Industri</span>
                    </>
                  )}
                </button>

                <div className="pt-3 border-t border-slate-200 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-cyan-700 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Sudah memiliki akun? Masuk di sini</span>
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* 3. VIEW: FORGOT PASSWORD                                  */}
            {/* ========================================================= */}
            {mode === 'forgot' && (
              <div className="space-y-4">
                {forgotStep === 'identify' ? (
                  <form onSubmit={handleForgotIdentify} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Masukkan ID Pelanggan atau Email PIC Terdaftar
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={forgotIdentifier}
                          onChange={(e) => setForgotIdentifier(e.target.value)}
                          placeholder="AETRA-IND-001 atau pic@perusahaan.co.id"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-600"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        Sistem akan memvalidasi data kepemilikan akun industri Anda di database Aetra.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Verifikasi Identitas Akun</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotResetSubmit} className="space-y-4">
                    <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-cyan-950">
                      <div className="font-bold text-slate-900">{matchedCustomer?.nama_perusahaan}</div>
                      <div className="text-[11px] text-cyan-800 font-mono mt-0.5">
                        ID: {matchedCustomer?.id_pelanggan} · PIC: {matchedCustomer?.pic_nama}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Kata Sandi Baru
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Masukkan kata sandi baru (min. 6 digit)"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Konfirmasi Kata Sandi Baru
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Ketik ulang kata sandi baru"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Menyimpan Sandi Baru...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Perbarui Kata Sandi Sekarang</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Direct Assistance / WhatsApp Hotline */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-800 block mb-1">
                      Kendala Akses atau Lupa Email PIC?
                    </span>
                    <p className="text-slate-600 text-[11px] mb-2 leading-relaxed">
                      Hubungi Tim Key Account & Customer Care Aetra Air Tangerang untuk verifikasi manual via surat resmi atau WhatsApp.
                    </p>
                    <a
                      href="https://wa.me/628111900223?text=Halo%20Aetra%20Air%20Tangerang,%20saya%20PIC%20Pelanggan%20Industri%20membutuhkan%20bantuan%20reset%20kata%20sandi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Layanan Key Account (0811-1900-223)</span>
                    </a>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setForgotStep('identify');
                      setMatchedCustomer(null);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-cyan-700 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Halaman Masuk</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
