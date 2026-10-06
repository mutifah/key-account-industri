import React, { useState, useMemo, useEffect } from 'react';
import {
  Droplets,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  TrendingUp,
  Activity,
  ShieldCheck,
  Send,
  HelpCircle,
  BarChart3,
  PhoneCall,
  Flame,
  Zap,
  Info,
  ArrowRight,
  Check,
  FileSpreadsheet,
  FileCheck2,
  Download,
  AlertOctagon,
  Sparkles,
  X,
  ExternalLink,
  Eye,
  Gauge,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Headphones,
  MessageSquare
} from 'lucide-react';
import {
  PelangganIndustri,
  PemakaianAir,
  HasilLabHarian,
  InfoPelayanan,
  TiketLayanan,
  StatusProgressMeter,
  KategoriUjiLab
} from '../types';
import { downloadPdfBlob, generateOfficialLabPdfDataUrl } from '../lib/pdfHelper';

export const KATEGORI_PERMOHONAN_OPTIONS = [
  'Informasi pelanggan',
  'Pengajuan Perubahan nama',
  'Relokasi meter industry',
  'Penambahan pipa dinas',
  'Penyambungan Kembali akibat tunggakan',
  'Pengajuan permanent disconnection',
  'Laporan meter rusak',
  'Laporan keran/ball valve rusak',
  'Laporan air kecil/tidak mengalir',
  'Laporan air kotor/keruh',
  'Laporan bocor sebelum meter/pipa dinas',
  'Request Tera meter',
  'Permohonan uji lab khusus',
  'Lainnya'
] as const;

interface CustomerPortalProps {
  currentCustomer: PelangganIndustri;
  pemakaianList: PemakaianAir[];
  labResults: HasilLabHarian[];
  infoPelayanan: InfoPelayanan[];
  tiketList: TiketLayanan[];
  onOpenCertificate: (data: HasilLabHarian) => void;
  onCreateTiket: (tiket: Omit<TiketLayanan, 'id' | 'created_at'>) => Promise<void>;
  onOpenDeployModal: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentCustomer,
  pemakaianList,
  labResults,
  infoPelayanan,
  tiketList,
  onOpenCertificate,
  onCreateTiket,
  onOpenDeployModal
}) => {
  const [activeTab, setActiveTab] = useState<'pemakaian' | 'lab' | 'pelayanan' | 'tiket'>('pemakaian');
  const [activeLabTab, setActiveLabTab] = useState<'Reservoar IPA' | 'Reservoar Booster' | 'Industri'>('Reservoar IPA');
  const [dismissedBannerIds, setDismissedBannerIds] = useState<string[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Active operational disruption / maintenance banners
  const activeDisruptionBanners = useMemo(() => {
    return infoPelayanan.filter((info) => {
      if (info.status_publikasi === false) return false;
      if (dismissedBannerIds.includes(info.id)) return false;
      return (
        info.tampilkan_banner !== false ||
        info.tingkat_urgensi === 'Darurat' ||
        info.tingkat_urgensi === 'Penting' ||
        info.tipe === 'Pemadaman Aliran Air' ||
        info.tipe === 'Perbaikan Pipa Darurat' ||
        info.tipe === 'Pemeliharaan Jaringan'
      );
    });
  }, [infoPelayanan, dismissedBannerIds]);

  // Keep activeBannerIndex valid
  useEffect(() => {
    if (activeBannerIndex >= activeDisruptionBanners.length && activeDisruptionBanners.length > 0) {
      setActiveBannerIndex(activeDisruptionBanners.length - 1);
    }
  }, [activeDisruptionBanners.length, activeBannerIndex]);

  const handlePrevBanner = () => {
    setActiveBannerIndex((prev) => (prev > 0 ? prev - 1 : activeDisruptionBanners.length - 1));
  };

  const handleNextBanner = () => {
    setActiveBannerIndex((prev) => (prev < activeDisruptionBanners.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      handleNextBanner();
    } else if (diff < -45) {
      handlePrevBanner();
    }
    setTouchStartX(null);
  };

  // 3 Kategori Dokumen Hasil Uji Lab:
  // 1. Hasil Uji Lab Reservoar IPA
  const reservoarIpaLabResults = useMemo(() => {
    return labResults.filter(l => {
      if (l.kategori_lab === 'Reservoar IPA') return true;
      if (l.kategori_lab === 'Reservoar' && !l.judul_dokumen?.toLowerCase().includes('booster')) return true;
      return false;
    });
  }, [labResults]);

  // 2. Hasil Uji Lab Reservoar Booster
  const reservoarBoosterLabResults = useMemo(() => {
    return labResults.filter(l => {
      if (l.kategori_lab === 'Reservoar Booster' || l.kategori_lab === 'Pompa Booster') return true;
      if (l.kategori_lab === 'Reservoar' && l.judul_dokumen?.toLowerCase().includes('booster')) return true;
      return false;
    });
  }, [labResults]);

  // 3. Hasil Uji Lab Industri (Personalized)
  const industriLabResults = useMemo(() => {
    return labResults.filter(l => {
      const isIndustri = l.kategori_lab === 'Industri' || l.kategori_lab === 'Uji Khusus Pabrik';
      if (!isIndustri) return false;
      const matchId = l.id_pelanggan_khusus?.toLowerCase() === currentCustomer.id_pelanggan.toLowerCase();
      const matchName = l.nama_perusahaan_khusus?.toLowerCase() === currentCustomer.nama_perusahaan.toLowerCase();
      return matchId || matchName;
    });
  }, [labResults, currentCustomer]);

  const handleDownloadLabPdf = (lab: HasilLabHarian) => {
    const isInd = lab.kategori_lab === 'Industri' || lab.kategori_lab === 'Uji Khusus Pabrik';
    const isBooster = lab.kategori_lab === 'Reservoar Booster' || lab.kategori_lab === 'Pompa Booster' || (!isInd && lab.judul_dokumen?.toLowerCase().includes('booster'));
    const defaultTitle = isInd
      ? `Laporan Uji Mutu Air Industri - ${lab.nama_perusahaan_khusus || currentCustomer.nama_perusahaan}`
      : isBooster
      ? 'Hasil Uji Mutu Air Stasiun Pompa Reservoar Booster'
      : 'Hasil Uji Mutu Air Reservoar IPA Sepatan';

    const url = lab.pdf_url || generateOfficialLabPdfDataUrl(
      lab.judul_dokumen || defaultTitle,
      lab.no_sertifikat_lab,
      lab.kategori_lab || 'Reservoar IPA',
      lab.tanggal_uji,
      lab.lokasi_sampling,
      lab.nama_perusahaan_khusus || (isInd ? currentCustomer.nama_perusahaan : undefined),
      lab.status_kelayakan,
      lab.nama_analis_lab
    );
    downloadPdfBlob(url, lab.pdf_filename || `Laporan_Lab_${lab.no_sertifikat_lab.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  // Tiket Form
  const [tiketPerihal, setTiketPerihal] = useState('');
  const [tiketKategori, setTiketKategori] = useState<string>('Informasi pelanggan');
  const [tiketPesan, setTiketPesan] = useState('');
  const [submittingTiket, setSubmittingTiket] = useState(false);
  const [tiketSuccess, setTiketSuccess] = useState(false);

  // Pemakaian records for current logged-in customer
  const customerPemakaian = useMemo(() => {
    return pemakaianList
      .filter(p => p.id_pelanggan.toLowerCase() === currentCustomer.id_pelanggan.toLowerCase())
      .sort((a, b) => new Date(b.tanggal_baca).getTime() - new Date(a.tanggal_baca).getTime());
  }, [pemakaianList, currentCustomer]);

  // Customer Tickets
  const customerTickets = useMemo(() => {
    return tiketList.filter(t => t.id_pelanggan.toLowerCase() === currentCustomer.id_pelanggan.toLowerCase());
  }, [tiketList, currentCustomer]);

  // Latest water quality reading
  const latestLab = useMemo(() => {
    return labResults.length > 0 ? labResults[0] : null;
  }, [labResults]);

  // Latest pemakaian metrics
  const latestPemakaian = customerPemakaian[0] || null;
  const previousPemakaian = customerPemakaian[1] || null;

  const trendPercent = useMemo(() => {
    if (!latestPemakaian || !previousPemakaian || previousPemakaian.total_m3 === 0) return 0;
    return ((latestPemakaian.total_m3 - previousPemakaian.total_m3) / previousPemakaian.total_m3) * 100;
  }, [latestPemakaian, previousPemakaian]);

  const handleTiketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tiketPerihal || !tiketPesan) return;
    setSubmittingTiket(true);
    try {
      await onCreateTiket({
        id_pelanggan: currentCustomer.id_pelanggan,
        perihal: tiketPerihal,
        kategori: tiketKategori,
        pesan: tiketPesan,
        status: 'Diproses',
        respon_petugas: 'Permohonan telah diterima oleh Key Account Executive dan sedang dikoordinasikan dengan tim teknis.'
      });
      setTiketPerihal('');
      setTiketPesan('');
      setTiketSuccess(true);
      setTimeout(() => setTiketSuccess(false), 4000);
    } catch (e) {
      console.error(e);
      alert('Gagal mengirim tiket.');
    } finally {
      setSubmittingTiket(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. BANNER PENGUMUMAN GANGGUAN / PEMELIHARAAN AIR (SIMPEL & HORIZONTAL SLIDER) */}
      {activeDisruptionBanners.length > 0 && (
        <div
          className="relative overflow-hidden rounded-2xl border border-slate-700/80 shadow-md select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slider Track */}
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeBannerIndex * 100}%)` }}
          >
            {activeDisruptionBanners.map((banner) => {
              const isUrgent = banner.tingkat_urgensi === 'Darurat' || banner.tipe === 'Pemadaman Aliran Air';
              return (
                <div
                  key={banner.id}
                  className={`w-full shrink-0 p-3.5 sm:p-4 text-white flex flex-col justify-between relative overflow-hidden ${
                    isUrgent
                      ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950/90'
                      : 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950/90'
                  }`}
                >
                  {/* Subtle Glow Accent */}
                  <div
                    className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 ${
                      isUrgent ? 'bg-rose-600/15' : 'bg-amber-600/15'
                    }`}
                  />

                  {/* Top Bar: Badge + Title + Slider Nav + Dismiss */}
                  <div className="flex items-start justify-between gap-3 mb-2 relative z-10">
                    <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider shrink-0 ${
                          isUrgent ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {isUrgent ? <AlertOctagon className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{banner.tipe}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/90 border border-white/15 shrink-0">
                        Urgensi: {banner.tingkat_urgensi}
                      </span>

                      <h3 className="font-extrabold text-sm sm:text-base text-white truncate max-w-xl">
                        {banner.judul}
                      </h3>
                    </div>

                    {/* Navigation Arrows & Dismiss */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {activeDisruptionBanners.length > 1 && (
                        <div className="flex items-center bg-black/40 backdrop-blur-xs rounded-xl p-0.5 border border-white/15 mr-1">
                          <button
                            type="button"
                            onClick={handlePrevBanner}
                            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                            title="Slide ke kiri (sebelumnya)"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono font-bold px-1.5 text-white/90">
                            {activeBannerIndex + 1}/{activeDisruptionBanners.length}
                          </span>
                          <button
                            type="button"
                            onClick={handleNextBanner}
                            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                            title="Slide ke kanan (berikutnya)"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setDismissedBannerIds((prev) => [...prev, banner.id])}
                        className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        title="Tutup pemberitahuan ini"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description (Concise & Clean) */}
                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed mb-2.5 relative z-10">
                    {banner.deskripsi}
                  </p>

                  {/* Compact Info Chips: Schedule & Impact Area & Mitigation */}
                  <div className="flex flex-wrap items-center gap-2 mb-2.5 text-xs relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[11px] text-slate-200">
                      <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>
                        <strong>Jadwal:</strong> {banner.tanggal_mulai.replace('T', ' ')}
                        {banner.tanggal_selesai && ` s/d ${banner.tanggal_selesai.replace('T', ' ')}`}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[11px] text-slate-200">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate max-w-sm">
                        <strong>Wilayah:</strong> {banner.wilayah_terdampak}
                      </span>
                    </div>

                    {banner.solusi_mitigasi && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-[11px] text-amber-200 truncate max-w-md">
                        <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                        <span className="truncate">
                          <strong>Himbauan:</strong> {banner.solusi_mitigasi}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Row: PIC Lapangan & Hotline Action Button */}
                  <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs relative z-10">
                    <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <span>PIC Lapangan:</span>
                      <strong className="text-white">{banner.pic_nama}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${banner.pic_kontak.replace(/[^0-9]/g, '')}?text=Halo%20Aetra,%20saya%20PIC%20${encodeURIComponent(
                          currentCustomer.nama_perusahaan
                        )}%20ingin%20koordinasi%20mengenai%20${encodeURIComponent(banner.judul)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Hotline WhatsApp: {banner.pic_kontak}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator when multiple banners exist */}
          {activeDisruptionBanners.length > 1 && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {activeDisruptionBanners.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setActiveBannerIndex(dotIdx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeBannerIndex === dotIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide pemberitahuan ${dotIdx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customer Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-100">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">
                  {currentCustomer.nama_perusahaan}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">
                  {currentCustomer.id_pelanggan}
                </span>
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Koneksi Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {currentCustomer.bidang_usaha} · {currentCustomer.alamat_kawasan}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-600">
                <span>Zona: <strong className="text-slate-800">{currentCustomer.zona_distribusi}</strong></span>
                <span>•</span>
                <span>No. Meter: <strong className="font-mono text-slate-800">{currentCustomer.no_meter}</strong></span>
                <span>•</span>
                <span>PIC Pabrik: <strong className="text-slate-800">{currentCustomer.pic_nama}</strong> ({currentCustomer.pic_telepon})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pemakaian')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'pemakaian'
              ? 'border-cyan-600 text-cyan-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Pemakaian Air Bulanan ({customerPemakaian.length} Rekap)</span>
        </button>

        <button
          onClick={() => setActiveTab('lab')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'lab'
              ? 'border-cyan-600 text-cyan-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Hasil Uji Laboratorium</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </button>

        <button
          onClick={() => setActiveTab('pelayanan')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'pelayanan'
              ? 'border-cyan-600 text-cyan-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Info Jaringan & Pasokan</span>
        </button>

        <button
          onClick={() => setActiveTab('tiket')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'tiket'
              ? 'border-cyan-600 text-cyan-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Layanan & Pengaduan PIC</span>
          {customerTickets.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
              {customerTickets.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PEMAKAIAN AIR BULANAN */}
      {activeTab === 'pemakaian' && (
        <div className="space-y-6">
          {/* Key Metrics Cards (No Kuota, No Tarif, No Tagihan) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Volume Periode Terakhir */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Volume Pemakaian Terakhir
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-mono font-extrabold text-cyan-800">
                  {latestPemakaian ? latestPemakaian.total_m3.toLocaleString('id-ID') : 0}
                </span>
                <span className="text-xs font-bold text-cyan-700">m³</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {latestPemakaian ? `Periode ${latestPemakaian.periode_bulan} ${latestPemakaian.periode_tahun}` : '-'}
              </p>
            </div>

            {/* Card 2: Stand Meter Terakhir */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Posisi Stand Meter
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-mono font-bold text-slate-800">
                  {latestPemakaian ? latestPemakaian.meter_akhir.toLocaleString('id-ID') : 0}
                </span>
                <span className="text-[11px] text-slate-500">Stand Akhir</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Stand Awal: {latestPemakaian ? latestPemakaian.meter_awal.toLocaleString('id-ID') : 0}
              </p>
            </div>

            {/* Card 3: Tren Pemakaian */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Tren vs Bulan Lalu
              </span>
              <div className="mt-2 flex items-center gap-2">
                <TrendingUp
                  className={`w-5 h-5 ${
                    trendPercent > 0 ? 'text-blue-600' : 'text-emerald-600'
                  }`}
                />
                <span className="text-2xl font-mono font-extrabold text-slate-900">
                  {trendPercent > 0 ? `+${trendPercent.toFixed(1)}%` : `${trendPercent.toFixed(1)}%`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {previousPemakaian
                  ? `Bulan lalu: ${previousPemakaian.total_m3.toLocaleString('id-ID')} m³`
                  : 'Data periode pertama'}
              </p>
            </div>

            {/* Card 4: Estimasi Pemakaian Harian */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Estimasi Pemakaian Harian
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-mono font-extrabold text-slate-900">
                  {latestPemakaian ? Math.round(latestPemakaian.total_m3 / 30).toLocaleString('id-ID') : 0}
                </span>
                <span className="text-xs font-bold text-slate-600">m³/hari</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {latestPemakaian ? `Berdasarkan rekap ${latestPemakaian.periode_bulan}` : '-'}
              </p>
            </div>
          </div>

          {/* Detailed Table of Readings */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Riwayat Pembacaan Meter Air Industri
                </h3>
                <p className="text-xs text-slate-500">
                  Data historis stand meter fisik dan kubikasi air bulanan (m³)
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Total {customerPemakaian.length} Periode Tercatat
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Periode</th>
                    <th className="p-3">Tanggal Baca</th>
                    <th className="p-3 text-right">Stand Awal</th>
                    <th className="p-3 text-right">Stand Akhir</th>
                    <th className="p-3 text-right">Volume (m³)</th>
                    <th className="p-3">Catatan Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {customerPemakaian.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                        {p.periode_bulan} {p.periode_tahun}
                      </td>
                      <td className="p-3 text-slate-600 font-mono whitespace-nowrap">
                        {p.tanggal_baca}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        {p.meter_awal.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        {p.meter_akhir.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-cyan-800 text-sm">
                        {p.total_m3.toLocaleString('id-ID')} m³
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">
                        {p.catatan_petugas || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HASIL LAB KUALITAS AIR - 3 OPSI: RESERVOAR, BOOSTER, UJI KHUSUS PABRIK */}
      {activeTab === 'lab' && (
        <div className="space-y-6">
          {/* Lab Quality Overview Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 rounded-3xl p-6 text-white border border-slate-800 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                    Jaminan Mutu Air Minum Industri Permenkes No. 2/2023
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                  Dokumen Hasil Uji Laboratorium Mutu Air
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Staf laboratorium Aetra menerbitkan laporan resmi hasil uji mutu air dalam bentuk berkas PDF tersertifikasi ISO/IEC 17025 yang dapat langsung diunduh untuk keperluan audit QA/QC dan operasional fasilitas industri Anda.
                </p>
              </div>

              {latestLab && (
                <button
                  onClick={() => handleDownloadLabPdf(latestLab)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Uji Mutu Terkini</span>
                </button>
              )}
            </div>
          </div>

          {/* 3 MENU KATEGORI UJI LAB: RESERVOAR IPA, RESERVOAR BOOSTER, INDUSTRI (TANPA TULISAN OPSI) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Menu 1: Hasil Uji Lab Reservoar IPA */}
            <button
              onClick={() => setActiveLabTab('Reservoar IPA')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeLabTab === 'Reservoar IPA'
                  ? 'bg-cyan-50/90 border-cyan-600 shadow-sm ring-2 ring-cyan-600/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  <span>Instalasi Pengolahan Air Sepatan</span>
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  activeLabTab === 'Reservoar IPA'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {reservoarIpaLabResults.length} Laporan
                </span>
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-1">
                Hasil Uji Lab Reservoar IPA
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pengujian mutu air bak penampungan & instalasi utama Reservoar IPA Sepatan Tangerang sesuai standar Permenkes No. 2/2023.
              </p>
            </button>

            {/* Menu 2: Hasil Uji Lab Reservoar Booster */}
            <button
              onClick={() => setActiveLabTab('Reservoar Booster')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeLabTab === 'Reservoar Booster'
                  ? 'bg-blue-50/90 border-blue-600 shadow-sm ring-2 ring-blue-600/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-blue-600" />
                  <span>Stasiun Pompa Booster</span>
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  activeLabTab === 'Reservoar Booster'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {reservoarBoosterLabResults.length} Laporan
                </span>
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-1">
                Hasil Uji Lab Reservoar Booster
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pengujian mutu air stasiun penampungan pompa dorong (booster) transmisi jaringan pipa distribusi kawasan industri.
              </p>
            </button>

            {/* Menu 3: Hasil Uji Lab Industri */}
            <button
              onClick={() => setActiveLabTab('Industri')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeLabTab === 'Industri'
                  ? 'bg-indigo-50/90 border-indigo-600 shadow-sm ring-2 ring-indigo-600/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Personalized In-Plant Sampling</span>
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  activeLabTab === 'Industri'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {industriLabResults.length} Dokumen
                </span>
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-1">
                Hasil Uji Lab Industri
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pengujian mutu air khusus fasilitas pabrik {currentCustomer.nama_perusahaan} (Personalized).
              </p>
            </button>
          </div>

          {/* LIST DOKUMEN SESUAI KATEGORI TERPILIH */}
          <div className="space-y-3">
            {/* DAFTAR 1: RESERVOAR IPA */}
            {activeLabTab === 'Reservoar IPA' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Daftar Dokumen PDF Hasil Uji Lab Reservoar IPA ({reservoarIpaLabResults.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">Mencakup Bak Penampungan Utama & Jaringan Transmisi IPA Sepatan</span>
                </div>

                {reservoarIpaLabResults.map((lab) => (
                  <div
                    key={lab.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Droplets className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">
                            {lab.judul_dokumen || 'Hasil Uji Mutu Air Reservoar IPA'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{lab.status_kelayakan || 'MEMENUHI SYARAT'}</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                          <span>Tanggal: <strong className="text-slate-800">{lab.tanggal_uji}</strong> ({lab.waktu_sampling || '08:00 WIB'})</span>
                          <span>•</span>
                          <span>Lokasi: <strong className="text-slate-800">{lab.lokasi_sampling}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                          <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {lab.pdf_filename || 'Laporan_Lab_Reservoar_IPA.pdf'}
                          </span>
                          <span>({lab.pdf_size || '1.8 MB'})</span>
                          {lab.catatan && <span className="italic text-slate-500 truncate max-w-md">— {lab.catatan}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => onOpenCertificate(lab)}
                        className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Buka pratinjau Hasil Lab & Cetak"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Hasil Lab</span>
                      </button>

                      <button
                        onClick={() => handleDownloadLabPdf(lab)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DAFTAR 2: RESERVOAR BOOSTER */}
            {activeLabTab === 'Reservoar Booster' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Daftar Dokumen PDF Hasil Uji Lab Reservoar Booster ({reservoarBoosterLabResults.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">Mencakup Outlet Discharge Stasiun Pompa Penampungan Booster Jaringan Distribusi</span>
                </div>

                {reservoarBoosterLabResults.length > 0 ? (
                  reservoarBoosterLabResults.map((lab) => (
                    <div
                      key={lab.id}
                      className="bg-white rounded-2xl p-5 border border-blue-200 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Gauge className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">
                              {lab.judul_dokumen || 'Hasil Uji Mutu Air Reservoar Booster'}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{lab.status_kelayakan || 'MEMENUHI SYARAT'}</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                            <span>Tanggal: <strong className="text-slate-800">{lab.tanggal_uji}</strong> ({lab.waktu_sampling || '09:00 WIB'})</span>
                            <span>•</span>
                            <span>Lokasi: <strong className="text-slate-800">{lab.lokasi_sampling}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                            <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {lab.pdf_filename || 'Laporan_Lab_Reservoar_Booster.pdf'}
                            </span>
                            <span>({lab.pdf_size || '1.5 MB'})</span>
                            {lab.catatan && <span className="italic text-slate-500 truncate max-w-md">— {lab.catatan}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => onOpenCertificate(lab)}
                          className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Buka pratinjau Hasil Lab & Cetak"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Hasil Lab</span>
                        </button>

                        <button
                          onClick={() => handleDownloadLabPdf(lab)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
                    Belum ada dokumen hasil uji lab reservoar booster yang diterbitkan.
                  </div>
                )}
              </div>
            )}

            {activeLabTab === 'Industri' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                      Daftar Dokumen PDF Hasil Uji Lab Industri ({industriLabResults.length})
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Personalized
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">Hanya dapat diakses oleh {currentCustomer.nama_perusahaan}</span>
                </div>

                {/* Note Konfirmasi ke PIC Aetra terkait ketersediaan hasil uji lab */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <h5 className="font-bold text-amber-900">
                      Konfirmasi Ketersediaan Hasil Uji Lab Industri:
                    </h5>
                    <p className="text-amber-850/90 leading-relaxed">
                      Mohon konfirmasi terlebih dahulu ke PIC / Key Account Officer dari PT Aetra Air Tangerang terkait jadwal pelaksanaan serta ketersediaan dokumen hasil uji lab mutu air khusus untuk pabrik Anda.
                    </p>
                  </div>
                </div>

                {industriLabResults.length > 0 ? (
                  industriLabResults.map((lab) => (
                    <div
                      key={lab.id}
                      className="bg-white rounded-2xl p-5 border-2 border-indigo-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">
                              {lab.judul_dokumen || `Laporan Uji Mutu Air Fasilitas ${currentCustomer.nama_perusahaan}`}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                              <Sparkles className="w-3 h-3 text-indigo-600" />
                              <span>Khusus Pabrik Anda</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{lab.status_kelayakan || 'MEMENUHI SYARAT'}</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                            <span>Tanggal Sampling: <strong className="text-slate-800">{lab.tanggal_uji}</strong> ({lab.waktu_sampling || '10:00 WIB'})</span>
                            <span>•</span>
                            <span>Titik Sampling: <strong className="text-slate-800">{lab.lokasi_sampling}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                            <span className="font-mono text-indigo-900 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                              {lab.pdf_filename || 'Laporan_Uji_Industri.pdf'}
                            </span>
                            <span>({lab.pdf_size || '2.1 MB'})</span>
                            {lab.catatan && <span className="italic text-slate-500 truncate max-w-md">— {lab.catatan}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => onOpenCertificate(lab)}
                          className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Buka pratinjau Hasil Lab & Cetak"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Hasil Lab</span>
                        </button>

                        <button
                          onClick={() => handleDownloadLabPdf(lab)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF Khusus</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 rounded-2xl bg-indigo-50/50 border border-indigo-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-indigo-950">
                        Belum Ada Dokumen Sampling Industri untuk {currentCustomer.nama_perusahaan}
                      </h4>
                      <p className="text-xs text-indigo-800/80 max-w-md mx-auto mt-1 leading-relaxed">
                        Sampling uji lab industri (in-plant sampling) dilakukan secara berkala langsung pada titik sambungan tandon pabrik atas permintaan atau jadwal audit mitra industri.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('tiket')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Ajukan Jadwal Uji Mutu Industri</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INFO PELAYANAN & PASOKAN JARINGAN */}
      {activeTab === 'pelayanan' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Pengumuman Operasional Jaringan & Pekerjaan Pipa
            </h3>
            <p className="text-xs text-slate-500">
              Jadwal pemeliharaan preventif, flushing berkala, dan penyesuaian tekanan transmisi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoPelayanan.map((info) => (
              <div
                key={info.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-cyan-400 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded border border-cyan-200">
                    {info.tipe}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {info.tingkat_urgensi}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                  {info.judul}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {info.deskripsi}
                </p>
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <div>Waktu: <strong className="text-slate-700">{info.tanggal_mulai} s/d {info.tanggal_selesai || 'Selesai'}</strong></div>
                  <div>Wilayah: <strong className="text-slate-700">{info.wilayah_terdampak}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LAYANAN & PENGADUAN PIC */}
      {activeTab === 'tiket' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Form */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Buat Tiket Layanan Industri
              </h3>
              <p className="text-xs text-slate-500">
                Pengajuan tera kalibrasi flow meter, uji mutu khusus, atau permohonan teknis
              </p>
            </div>

            {tiketSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tiket berhasil dikirim ke Key Account Executive!</span>
              </div>
            )}

            <form onSubmit={handleTiketSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kategori Permohonan
                </label>
                <select
                  value={tiketKategori}
                  onChange={(e) => setTiketKategori(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-xs"
                >
                  {KATEGORI_PERMOHONAN_OPTIONS.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Perihal / Judul
                </label>
                <input
                  type="text"
                  required
                  value={tiketPerihal}
                  onChange={(e) => setTiketPerihal(e.target.value)}
                  placeholder={`Contoh: ${tiketKategori} fasilitas pabrik`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Detail Permohonan & Keterangan
                </label>
                <textarea
                  rows={4}
                  required
                  value={tiketPesan}
                  onChange={(e) => setTiketPesan(e.target.value)}
                  placeholder="Jelaskan kebutuhan teknis pabrik, nomor flow meter, lokasi titik instalasi, atau keterangan pendukung lainnya..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submittingTiket}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingTiket ? 'Mengirim...' : 'Kirim Tiket Layanan'}</span>
              </button>
            </form>
          </div>

          {/* Ticket List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Tiket & Respon Petugas
              </h3>
              <p className="text-xs text-slate-500">
                Histori tindak lanjut permohonan dari Key Account Executive PT Aetra Air Tangerang
              </p>
            </div>

            {customerTickets.length === 0 ? (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                Belum ada tiket layanan yang diajukan oleh perusahaan Anda.
              </div>
            ) : (
              <div className="space-y-3.5">
                {customerTickets.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {t.id}
                        </span>
                        <span className="font-semibold text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
                          {t.kategori}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">
                          {new Date(t.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} WIB
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                            t.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'Diteruskan ke CC'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : t.status === 'Diproses'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800 font-extrabold'
                          }`}
                        >
                          {t.status === 'Diteruskan ke CC' && <Headphones className="w-3 h-3 text-purple-700" />}
                          <span>{t.status === 'Terkirim' ? 'Menunggu Respon' : t.status}</span>
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{t.perihal}</h4>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                      "{t.pesan}"
                    </p>

                    {/* CC Escalation Notice if ticket was forwarded */}
                    {t.no_tiket_cc && (
                      <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 flex items-start gap-2.5">
                        <Headphones className="w-4 h-4 text-purple-700 mt-0.5 shrink-0" />
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="font-bold text-[11px] text-purple-900">
                              Diteruskan ke {t.divisi_tujuan || 'Divisi Contact Center 24 Jam'}
                            </span>
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-purple-600 text-white rounded">
                              No. Tiket CC: {t.no_tiket_cc}
                            </span>
                          </div>
                          <p className="text-[11px] text-purple-800/90 leading-tight">
                            Laporan keluhan pabrik Anda telah didaftarkan ke sistem sentral Contact Center Aetra untuk penugasan tim lapangan.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Official Response from Staff */}
                    {t.respon_petugas && (
                      <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-950 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold block text-[11px] text-cyan-900 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-cyan-700" />
                            <span>Tanggapan Resmi Petugas Key Account PT Aetra:</span>
                          </span>
                          {t.tanggal_tindak_lanjut && (
                            <span className="text-[10px] text-cyan-700 font-medium">
                              {new Date(t.tanggal_tindak_lanjut).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })} WIB
                            </span>
                          )}
                        </div>
                        <p className="text-cyan-950 leading-relaxed font-medium pl-5">{t.respon_petugas}</p>
                        {t.nama_petugas_tindak_lanjut && (
                          <div className="pt-1 text-[10px] text-cyan-700 pl-5">
                            Oleh: <strong>{t.nama_petugas_tindak_lanjut}</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
