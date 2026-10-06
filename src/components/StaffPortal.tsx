import React, { useState, useMemo } from 'react';
import {
  Gauge,
  FlaskConical,
  BellRing,
  Building2,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  FileSpreadsheet,
  ShieldCheck,
  Upload,
  ChevronRight,
  FileCheck2,
  Clock,
  ArrowRight,
  Download,
  FileText,
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  Megaphone,
  Droplets,
  Headphones,
  MessageSquare,
  Send,
  Phone,
  Layers,
  Filter
} from 'lucide-react';
import {
  PelangganIndustri,
  PemakaianAir,
  HasilLabHarian,
  InfoPelayanan,
  TiketLayanan,
  StaffUser,
  StatusProgressMeter,
  KategoriUjiLab
} from '../types';
import { generateOfficialLabPdfDataUrl, downloadPdfBlob } from '../lib/pdfHelper';

interface StaffPortalProps {
  currentStaff?: StaffUser | null;
  pelangganList: PelangganIndustri[];
  pemakaianList: PemakaianAir[];
  labResults: HasilLabHarian[];
  infoPelayanan: InfoPelayanan[];
  tiketList: TiketLayanan[];
  onOpenMeterModal: (initialData?: PemakaianAir | null) => void;
  onOpenLabModal: (initialData?: HasilLabHarian | null, kategori?: 'Reservoar IPA' | 'Reservoar Booster' | 'Industri' | string) => void;
  onOpenInfoModal: (initialData?: InfoPelayanan | null) => void;
  onOpenCustomerModal: (initialData?: PelangganIndustri | null) => void;
  onOpenExcelModal: () => void;
  onDeletePemakaian: (id: string) => Promise<void>;
  onDeleteLab: (id: string) => Promise<void>;
  onDeleteInfo: (id: string) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
  onOpenCertificate: (data: HasilLabHarian) => void;
  onToggleInfoPublish: (info: InfoPelayanan) => Promise<void>;
  onToggleInfoBanner?: (info: InfoPelayanan) => Promise<void>;
  onVerifyPemakaian: (pemakaian: PemakaianAir) => Promise<void>;
  onUpdateStatusProgress: (pemakaian: PemakaianAir, status: StatusProgressMeter) => Promise<void>;
  onOpenTiketModal: (tiket: TiketLayanan) => void;
  onDeleteTiket: (id: string) => Promise<void>;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({
  currentStaff,
  pelangganList,
  pemakaianList,
  labResults,
  infoPelayanan,
  tiketList,
  onOpenMeterModal,
  onOpenLabModal,
  onOpenInfoModal,
  onOpenCustomerModal,
  onOpenExcelModal,
  onDeletePemakaian,
  onDeleteLab,
  onDeleteInfo,
  onDeleteCustomer,
  onOpenCertificate,
  onToggleInfoPublish,
  onToggleInfoBanner,
  onVerifyPemakaian,
  onUpdateStatusProgress,
  onOpenTiketModal,
  onDeleteTiket
}) => {
  const [activeTab, setActiveTab] = useState<'pemakaian' | 'lab' | 'pelayanan' | 'tiket'>('pemakaian');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('Semua');
  const [filterLabKategori, setFilterLabKategori] = useState<string>('Semua');
  const [filterTiketStatus, setFilterTiketStatus] = useState<string>('Semua');

  // Customer map for quick lookup
  const customerMap = useMemo(() => {
    const map: Record<string, PelangganIndustri> = {};
    pelangganList.forEach(p => {
      map[p.id_pelanggan] = p;
    });
    return map;
  }, [pelangganList]);

  // Ticket counts & stats
  const unhandledTiketCount = useMemo(() => {
    return tiketList.filter(t => t.status === 'Terkirim').length;
  }, [tiketList]);

  const escalatedCcTiketCount = useMemo(() => {
    return tiketList.filter(t => t.status === 'Diteruskan ke CC').length;
  }, [tiketList]);

  const activeTiketCount = useMemo(() => {
    return tiketList.filter(t => t.status !== 'Selesai').length;
  }, [tiketList]);

  const resolvedTiketCount = useMemo(() => {
    return tiketList.filter(t => t.status === 'Selesai').length;
  }, [tiketList]);

  // Lab Category counts (3 Jenis Dokumen: Reservoar IPA, Reservoar Booster, Industri Personalized)
  const reservoarIpaCount = useMemo(() => {
    return labResults.filter(l => {
      if (l.kategori_lab === 'Reservoar IPA') return true;
      if (l.kategori_lab === 'Reservoar' && !l.judul_dokumen?.toLowerCase().includes('booster')) return true;
      return false;
    }).length;
  }, [labResults]);

  const reservoarBoosterCount = useMemo(() => {
    return labResults.filter(l => {
      if (l.kategori_lab === 'Reservoar Booster' || l.kategori_lab === 'Pompa Booster') return true;
      if (l.kategori_lab === 'Reservoar' && l.judul_dokumen?.toLowerCase().includes('booster')) return true;
      return false;
    }).length;
  }, [labResults]);

  const industriCount = useMemo(() => {
    return labResults.filter(l => l.kategori_lab === 'Industri' || l.kategori_lab === 'Uji Khusus Pabrik').length;
  }, [labResults]);

  // Download Lab PDF Helper
  const handleDownloadLabPdf = (lab: HasilLabHarian) => {
    const isInd = lab.kategori_lab === 'Industri' || lab.kategori_lab === 'Uji Khusus Pabrik';
    const isBooster = lab.kategori_lab === 'Reservoar Booster' || lab.kategori_lab === 'Pompa Booster' || (!isInd && lab.judul_dokumen?.toLowerCase().includes('booster'));
    const defaultTitle = isInd
      ? `Laporan Uji Mutu Air Industri - ${lab.nama_perusahaan_khusus || ''}`
      : isBooster
      ? 'Hasil Uji Mutu Air Stasiun Pompa Reservoar Booster'
      : 'Hasil Uji Mutu Air Reservoar IPA Sepatan';

    const url = lab.pdf_url || generateOfficialLabPdfDataUrl(
      lab.judul_dokumen || defaultTitle,
      lab.no_sertifikat_lab,
      lab.kategori_lab || 'Reservoar IPA',
      lab.tanggal_uji,
      lab.lokasi_sampling,
      lab.nama_perusahaan_khusus,
      lab.status_kelayakan,
      lab.nama_analis_lab
    );
    downloadPdfBlob(url, lab.pdf_filename || `Laporan_Lab_${lab.no_sertifikat_lab.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  // Filtered Pemakaian
  const filteredPemakaian = useMemo(() => {
    return pemakaianList.filter(p => {
      const cust = customerMap[p.id_pelanggan];
      const name = cust?.nama_perusahaan || '';
      const matchSearch =
        p.id_pelanggan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.no_bpm && p.no_bpm.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.periode_bulan.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMonth = filterMonth === 'Semua' || p.periode_bulan === filterMonth;
      return matchSearch && matchMonth;
    });
  }, [pemakaianList, customerMap, searchQuery, filterMonth]);

  // Filtered Lab Results (3 Jenis Dokumen)
  const filteredLab = useMemo(() => {
    return labResults.filter(l => {
      const matchSearch =
        l.tanggal_uji.includes(searchQuery) ||
        l.lokasi_sampling.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.no_sertifikat_lab.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.judul_dokumen && l.judul_dokumen.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.nama_perusahaan_khusus && l.nama_perusahaan_khusus.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.id_pelanggan_khusus && l.id_pelanggan_khusus.toLowerCase().includes(searchQuery.toLowerCase()));

      const isInd = l.kategori_lab === 'Industri' || l.kategori_lab === 'Uji Khusus Pabrik';
      const isBooster = l.kategori_lab === 'Reservoar Booster' || l.kategori_lab === 'Pompa Booster' || (!isInd && l.judul_dokumen?.toLowerCase().includes('booster'));
      const isIpa = !isInd && !isBooster;

      const matchKategori =
        filterLabKategori === 'Semua' ||
        (filterLabKategori === 'Reservoar IPA' && isIpa) ||
        (filterLabKategori === 'Reservoar Booster' && isBooster) ||
        (filterLabKategori === 'Industri' && isInd);

      return matchSearch && matchKategori;
    });
  }, [labResults, searchQuery, filterLabKategori]);

  // Filtered Tiket Komplain
  const filteredTiket = useMemo(() => {
    return tiketList.filter(t => {
      const cust = customerMap[t.id_pelanggan];
      const name = cust?.nama_perusahaan || '';
      const matchSearch =
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id_pelanggan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.no_tiket_cc && t.no_tiket_cc.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.pesan && t.pesan.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        filterTiketStatus === 'Semua' ||
        (filterTiketStatus === 'Terkirim' && t.status === 'Terkirim') ||
        (filterTiketStatus === 'Diteruskan ke CC' && t.status === 'Diteruskan ke CC') ||
        (filterTiketStatus === 'Diproses' && t.status === 'Diproses') ||
        (filterTiketStatus === 'Selesai' && t.status === 'Selesai');

      return matchSearch && matchStatus;
    });
  }, [tiketList, customerMap, searchQuery, filterTiketStatus]);

  // Export to CSV helper
  const exportPemakaianCSV = () => {
    const headers = ['ID Pelanggan,Nama Perusahaan,Periode Bulan,Tahun,Tanggal Baca,Meter Awal,Meter Akhir,Volume m3,Status Progress,Pencatat\n'];
    const rows = filteredPemakaian.map(p => {
      const cust = customerMap[p.id_pelanggan];
      return `"${p.id_pelanggan}","${cust?.nama_perusahaan || ''}","${p.periode_bulan}",${p.periode_tahun},"${p.tanggal_baca}",${p.meter_awal},${p.meter_akhir},${p.total_m3},"${p.status_progress}","${p.nama_staf_pencatat || ''}"\n`;
    });
    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap_pemakaian_aetra_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Staff Workspace Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                  Dashboard Staf Key Account & Pengendalian Mutu
                </h1>
                <span className="bg-cyan-500/20 text-cyan-300 text-[11px] font-mono font-semibold px-2 py-0.5 rounded border border-cyan-500/30">
                  PT Aetra Air Tangerang
                </span>
                {currentStaff && (
                  <span className="bg-amber-500/20 text-amber-300 text-[11px] font-semibold px-2.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                    <span>Petugas:</span>
                    <strong className="text-white">{currentStaff.nama}</strong>
                    <span className="text-amber-400">({currentStaff.nik})</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Portal operasional rekap pemakaian air industri, verifikasi stand meter, hasil lab mutu air, dan publikasi info layanan.
              </p>
            </div>
          </div>
        </div>

        {/* 5 Kotak Menu Upload & Aksi Cepat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2 border-t border-slate-800/80">
          {/* Kotak 1: Upload Rekap Excel (warna hijau) */}
          <button
            onClick={onOpenExcelModal}
            className="group relative p-4 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left border border-emerald-600 flex flex-col justify-between min-h-[138px] overflow-hidden cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs shadow-xs">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-100 border border-white/20">
                Berkas .xlsx
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight leading-snug">
                Upload Rekap Excel
              </h3>
              <p className="text-[11px] text-emerald-100 mt-0.5 line-clamp-1">
                Impor data pemakaian air bulanan
              </p>
            </div>
          </button>

          {/* Kotak 2: Input Manual (warna hijau muda) */}
          <button
            onClick={() => onOpenMeterModal(null)}
            className="group relative p-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left border border-emerald-300 flex flex-col justify-between min-h-[138px] overflow-hidden cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-slate-950/15 flex items-center justify-center text-slate-950 backdrop-blur-xs shadow-xs">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/30 text-slate-950 border border-emerald-600/40">
                Form Satuan
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight leading-snug text-slate-950">
                Input Manual
              </h3>
              <p className="text-[11px] text-slate-800 mt-0.5 line-clamp-1">
                Pencatatan meter air individu
              </p>
            </div>
          </button>

          {/* Kotak 3: Upload Hasil Uji Lab (warna biru muda - tampilan disatukan) */}
          <button
            onClick={() => onOpenLabModal(null)}
            className="group relative p-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left border border-sky-400 flex flex-col justify-between min-h-[138px] overflow-hidden cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs shadow-xs">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-700/60 text-sky-100 border border-white/20">
                PDF Lab Mutu
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight leading-snug">
                Upload Hasil Uji Lab
              </h3>
              <p className="text-[11px] text-sky-100 mt-0.5 line-clamp-1">
                Dapat diunggah semua akun staf · 3 Jenis Dokumen
              </p>
            </div>
          </button>

          {/* Kotak 4: Upload Banner Gangguan (warna oren) */}
          <button
            onClick={() => onOpenInfoModal(null)}
            className="group relative p-4 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left border border-orange-400 flex flex-col justify-between min-h-[138px] overflow-hidden cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs shadow-xs">
                <Megaphone className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-700/60 text-orange-100 border border-white/20">
                Pemberitahuan
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight leading-snug">
                Upload Banner Gangguan
              </h3>
              <p className="text-[11px] text-orange-100 mt-0.5 line-clamp-1">
                Info pemeliharaan pipa & pasokan
              </p>
            </div>
          </button>

          {/* Kotak 5: Tindak Lanjut Komplain Pelanggan (warna ungu) */}
          <button
            onClick={() => {
              setActiveTab('tiket');
              setSearchQuery('');
            }}
            className="group relative p-4 rounded-2xl bg-purple-700 hover:bg-purple-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left border border-purple-600 flex flex-col justify-between min-h-[138px] overflow-hidden cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs shadow-xs">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 ${
                  unhandledTiketCount > 0
                    ? 'bg-amber-400 text-slate-950 font-extrabold animate-pulse'
                    : 'bg-purple-900/60 text-purple-100'
                }`}
              >
                {unhandledTiketCount > 0 ? `${unhandledTiketCount} Baru` : `${activeTiketCount} Aktif`}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight leading-snug">
                Tindak Lanjut Komplain
              </h3>
              <p className="text-[11px] text-purple-100 mt-0.5 line-clamp-1">
                Respon pelanggan & eskalasi CC
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Staff Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('pemakaian');
              setSearchQuery('');
            }}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'pemakaian'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>1. Pemakaian Air Bulanan ({pemakaianList.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('lab');
              setSearchQuery('');
            }}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'lab'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>2. Hasil Uji Laboratorium ({labResults.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('pelayanan');
              setSearchQuery('');
            }}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'pelayanan'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>3. Info Pelayanan ({infoPelayanan.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('tiket');
              setSearchQuery('');
            }}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'tiket'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>4. Komplain & Tiket Layanan ({tiketList.length})</span>
            {unhandledTiketCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                {unhandledTiketCount} Baru
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: PEMAKAIAN AIR BULANAN */}
      {activeTab === 'pemakaian' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari ID Pelanggan / Nama Pabrik..."
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
              >
                <option value="Semua">Semua Bulan</option>
                <option value="September">September</option>
                <option value="Agustus">Agustus</option>
                <option value="Juli">Juli</option>
                <option value="Juni">Juni</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <button
                onClick={onOpenExcelModal}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upload File Excel</span>
              </button>

              <button
                onClick={exportPemakaianCSV}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={() => onOpenMeterModal(null)}
                className="px-3 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Manual</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">ID & Nama Industri</th>
                    <th className="p-3">Periode</th>
                    <th className="p-3">Tanggal Catat</th>
                    <th className="p-3 text-right">Meter Awal</th>
                    <th className="p-3 text-right">Meter Akhir</th>
                    <th className="p-3 text-right">Volume (m³)</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPemakaian.map((p) => {
                    const cust = customerMap[p.id_pelanggan];
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <span className="font-mono font-bold text-cyan-800 block">
                            {p.id_pelanggan}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {cust?.nama_perusahaan || 'Pelanggan Key Account'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-900 block">
                            {p.periode_bulan} {p.periode_tahun}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
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
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onOpenMeterModal(p)}
                              title="Edit Data"
                              className="p-1 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Apakah Anda yakin ingin menghapus data baca meter ini?')) {
                                  onDeletePemakaian(p.id);
                                }
                              }}
                              title="Hapus Data"
                              className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPemakaian.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        Tidak ada data pemakaian air yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HASIL LAB KUALITAS AIR - 3 KATEGORI: RESERVOAR IPA, RESERVOAR BOOSTER, INDUSTRI (PERSONALIZED) */}
      {activeTab === 'lab' && (
        <div className="space-y-4">
          {/* Information & Category Badges Header */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                  Pengelolaan Dokumen Hasil Uji Laboratorium Mutu Air
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Dapat Diunggah Semua Akun Staf
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Upload Dokumen PDF Hasil Uji Lab (3 Jenis Dokumen)
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Hasil uji lab dapat diunggah oleh seluruh akun staf Aetra untuk 1. Hasil Uji Lab Reservoar IPA, 2. Hasil Uji Lab Reservoar Booster, serta 3. Hasil Uji Lab Industri (Personalized) yang ditujukan pada mitra industri tertentu.
              </p>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => onOpenLabModal(null)}
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <FlaskConical className="w-4 h-4 text-sky-100" />
                <span>+ Upload Hasil Uji Lab</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills & Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Filter Tabs (3 Jenis Dokumen) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setFilterLabKategori('Semua')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterLabKategori === 'Semua'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Semua Kategori</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">{labResults.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterLabKategori('Reservoar IPA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterLabKategori === 'Reservoar IPA'
                    ? 'bg-cyan-700 text-white shadow-xs'
                    : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200'
                }`}
              >
                <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                <span>1. Reservoar IPA</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterLabKategori === 'Reservoar IPA' ? 'bg-white/20' : 'bg-cyan-200 text-cyan-900'}`}>
                  {reservoarIpaCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterLabKategori('Reservoar Booster')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterLabKategori === 'Reservoar Booster'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <Gauge className="w-3.5 h-3.5 text-blue-600" />
                <span>2. Reservoar Booster</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterLabKategori === 'Reservoar Booster' ? 'bg-white/20' : 'bg-blue-200 text-blue-900'}`}>
                  {reservoarBoosterCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterLabKategori('Industri')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterLabKategori === 'Industri'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>3. Industri (Personalized)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterLabKategori === 'Industri' ? 'bg-white/20' : 'bg-indigo-200 text-indigo-900'}`}>
                  {industriCount}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul dokumen / lokasi / pabrik..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Table Hasil Lab dengan Dokumen PDF */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tanggal & Waktu</th>
                    <th className="p-3">Kategori & Sasaran</th>
                    <th className="p-3">Judul Dokumen & Titik Sampling</th>
                    <th className="p-3">Berkas Dokumen PDF</th>
                    <th className="p-3 text-center">Status Kelayakan</th>
                    <th className="p-3 text-center">Aksi Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLab.map((l) => {
                    const isInd = l.kategori_lab === 'Industri' || l.kategori_lab === 'Uji Khusus Pabrik';
                    const isBooster = l.kategori_lab === 'Reservoar Booster' || l.kategori_lab === 'Pompa Booster' || (!isInd && l.judul_dokumen?.toLowerCase().includes('booster'));
                    const isIpa = !isInd && !isBooster;

                    const editKategori = isInd ? 'Industri' : isBooster ? 'Reservoar Booster' : 'Reservoar IPA';

                    return (
                      <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                          {l.tanggal_uji}
                          <span className="block text-[10px] text-slate-500 font-sans">{l.waktu_sampling || '08:00 WIB'}</span>
                        </td>

                        <td className="p-3">
                          {isIpa && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-300">
                              <Droplets className="w-3 h-3 text-cyan-700" />
                              <span>1. Reservoar IPA</span>
                            </span>
                          )}
                          {isBooster && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                              <Gauge className="w-3 h-3 text-blue-700" />
                              <span>2. Reservoar Booster</span>
                            </span>
                          )}
                          {isInd && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
                                <Sparkles className="w-3 h-3 text-indigo-600" />
                                <span>3. Industri (Personalized)</span>
                              </span>
                              <div className="font-semibold text-slate-900 flex items-center gap-1 text-[11px]">
                                <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span className="truncate max-w-[180px]">{l.nama_perusahaan_khusus || 'Pabrik Tertentu'}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 block">ID: {l.id_pelanggan_khusus || '-'}</span>
                            </div>
                          )}
                        </td>

                        <td className="p-3 max-w-xs">
                          <p className="font-bold text-slate-900 text-xs line-clamp-1">
                            {l.judul_dokumen || 'Laporan Uji Mutu Air'}
                          </p>
                          <span className="block text-[11px] text-slate-600 line-clamp-1">
                            {l.lokasi_sampling}
                          </span>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <span className="block font-bold text-slate-800 text-[11px] truncate max-w-[150px]">
                                {l.pdf_filename || 'Dokumen_Uji_Lab.pdf'}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {l.pdf_size || '1.8 MB'} · PDF
                              </span>
                            </div>
                            <button
                              onClick={() => handleDownloadLabPdf(l)}
                              title="Download file PDF ini"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer ml-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="p-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{l.status_kelayakan || 'MEMENUHI SYARAT'}</span>
                          </span>
                        </td>

                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleDownloadLabPdf(l)}
                              title="Unduh File PDF"
                              className="px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>Unduh PDF</span>
                            </button>
                            <button
                              onClick={() => onOpenCertificate(l)}
                              title="Lihat Pratinjau Lab"
                              className="p-1 rounded text-cyan-700 hover:bg-cyan-50 cursor-pointer"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onOpenLabModal(l, editKategori)}
                              title="Edit Data / Ganti PDF"
                              className="p-1 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Hapus dokumen hasil pengujian lab ini?')) {
                                  onDeleteLab(l.id);
                                }
                              }}
                              title="Hapus Data Lab"
                              className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLab.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        Tidak ada dokumen pengujian lab yang sesuai dengan kategori atau filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PUSAT PENGUMUMAN & BANNER GANGGUAN OPERASIONAL AIR */}
      {activeTab === 'pelayanan' && (
        <div className="space-y-5">
          {/* Header with Quick Action to create announcement */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Pengumuman Gangguan & Pemeliharaan Operasional Air
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Kelola Pemberitahuan & Banner Beranda Dashboard Pelanggan
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Pengumuman mengenai perbaikan pipa darurat, pemeliharaan jaringan, pemadaman terjadwal, dan flushing otomatis ditampilkan mencolok sebagai banner di halaman depan dashboard pelanggan industri.
              </p>
            </div>

            <button
              onClick={() => onOpenInfoModal(null)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Input Pengumuman / Banner Gangguan</span>
            </button>
          </div>

          {/* Header Summary Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-600">
              Daftar pengumuman resmi operasional air, pemadaman, pemeliharaan, dan pemberitahuan lainnya.
            </span>
            <span className="text-slate-500 font-medium shrink-0">
              Total Pengumuman: <strong className="text-slate-800">{infoPelayanan.length}</strong>
            </span>
          </div>

          {/* List of Announcements with Banner Visibility Controls */}
          <div className="space-y-3">
            {infoPelayanan.map((info) => {
              const isBannerActive = info.status_publikasi && info.tampilkan_banner !== false;
              const isUrgent = info.tingkat_urgensi === 'Darurat' || info.tipe === 'Pemadaman Aliran Air';

              return (
                <div
                  key={info.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all ${
                    isBannerActive
                      ? 'border-amber-300 ring-2 ring-amber-400/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                        isUrgent ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                      }`}>
                        {isUrgent ? <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-cyan-600" />}
                        <span>{info.tipe}</span>
                      </span>

                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Urgensi: {info.tingkat_urgensi}
                      </span>

                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        Status Aliran: {info.status_aliran}
                      </span>

                      {/* Prominent Banner Status Badge */}
                      {isBannerActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          <Megaphone className="w-3 h-3 text-emerald-700" />
                          <span>Tampil di Banner Depan Pelanggan</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <span>Tidak Tampil di Banner</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      {info.judul}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {info.deskripsi}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span>Jadwal: <strong className="text-slate-800">{info.tanggal_mulai.replace('T', ' ')}</strong> {info.tanggal_selesai ? `s/d ${info.tanggal_selesai.replace('T', ' ')}` : ''}</span>
                      <span>Wilayah: <strong className="text-slate-800">{info.wilayah_terdampak}</strong></span>
                      <span>PIC Siaga: <strong className="text-slate-800">{info.pic_nama}</strong> ({info.pic_kontak})</span>
                    </div>

                    {info.solusi_mitigasi && (
                      <p className="text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
                        <strong>Langkah Mitigasi Industri:</strong> {info.solusi_mitigasi}
                      </p>
                    )}
                  </div>

                  {/* Actions & Banner Visibility Toggles */}
                  <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 w-full lg:w-auto justify-end flex-wrap">
                    {/* Toggle Banner Button */}
                    <button
                      type="button"
                      onClick={() => onToggleInfoBanner && onToggleInfoBanner(info)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                        info.tampilkan_banner !== false
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                      }`}
                      title="Klik untuk mengubah apakah pengumuman ini tampil di banner beranda pelanggan"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>{info.tampilkan_banner !== false ? 'Banner Aktif' : 'Pasang Banner'}</span>
                    </button>

                    {/* Toggle Publish Status */}
                    <button
                      type="button"
                      onClick={() => onToggleInfoPublish(info)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        info.status_publikasi
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {info.status_publikasi ? 'Tayang (Aktif)' : 'Draft'}
                    </button>

                    <button
                      onClick={() => onOpenInfoModal(info)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                      title="Edit Pengumuman"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
                          onDeleteInfo(info.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {infoPelayanan.length === 0 && (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                Belum ada pengumuman gangguan operasional. Klik tombol &quot;+ Input Pengumuman / Banner Gangguan&quot; di atas untuk membuat.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: KOMPLAIN & TIKET LAYANAN PELANGGAN */}
      {activeTab === 'tiket' && (
        <div className="space-y-4">
          {/* Header & KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Total Tiket Komplain</span>
                <span className="text-xl font-black text-slate-900">{tiketList.length}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-amber-700 block">Perlu Respon (Baru)</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black text-amber-900">{unhandledTiketCount}</span>
                  {unhandledTiketCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-purple-700 block">Diteruskan ke CC / Teknis</span>
                <span className="text-xl font-black text-purple-900">{escalatedCcTiketCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-700 block">Komplain Terselesaikan</span>
                <span className="text-xl font-black text-emerald-900">{resolvedTiketCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Action Toolbar & Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari ID tiket, perusahaan, perihal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* Filter Status */}
              <select
                value={filterTiketStatus}
                onChange={(e) => setFilterTiketStatus(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="Semua">Semua Status Tiket</option>
                <option value="Terkirim">Terkirim (Perlu Tindak Lanjut)</option>
                <option value="Diteruskan ke CC">Diteruskan ke CC</option>
                <option value="Diproses">Diproses Key Account</option>
                <option value="Selesai">Telah Selesai</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-800">{filteredTiket.length}</strong> tiket
            </div>
          </div>

          {/* Ticket Cards List */}
          {filteredTiket.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Headphones className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Tiket yang Sesuai</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Silakan sesuaikan kata kunci pencarian atau ubah filter status tiket di atas.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTiket.map((t) => {
                const cust = customerMap[t.id_pelanggan];
                const isResolved = t.status === 'Selesai';
                const isEscalated = t.status === 'Diteruskan ke CC';
                const isNew = t.status === 'Terkirim';

                return (
                  <div
                    key={t.id}
                    className={`bg-white rounded-xl border p-4 shadow-xs transition-all hover:shadow-sm space-y-3 ${
                      isNew
                        ? 'border-amber-300 ring-1 ring-amber-300/40'
                        : isEscalated
                        ? 'border-purple-200'
                        : isResolved
                        ? 'border-emerald-200'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Header Bar: Kode Tiket, Waktu, Status */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 flex-wrap">
                      <div className="flex items-center gap-2">
                        {/* Kode Tiket Utama */}
                        <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-lg shadow-2xs">
                          {t.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] text-slate-400">
                          {new Date(t.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} WIB
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isResolved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isEscalated
                              ? 'bg-purple-100 text-purple-800'
                              : isNew
                              ? 'bg-amber-100 text-amber-800 font-extrabold'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {t.status === 'Terkirim' ? 'Belum Ditindaklanjuti' : t.status}
                        </span>
                      </div>
                    </div>

                    {/* Pelanggan & Kontak (Bersih tanpa zona/stand meter) */}
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-600 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <strong className="text-slate-900 font-bold">
                          {cust?.nama_perusahaan || t.id_pelanggan}
                        </strong>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({t.id_pelanggan})
                        </span>
                      </div>

                      {cust?.pic_nama && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>PIC: <strong>{cust.pic_nama}</strong></span>
                          {cust.pic_telepon && <span className="text-slate-400 font-mono">({cust.pic_telepon})</span>}
                        </div>
                      )}
                    </div>

                    {/* Perihal & Pesan Komplain */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                        {t.perihal}
                      </h4>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        "{t.pesan}"
                      </p>
                    </div>

                    {/* Follow-up Details (Hanya muncul jika sudah ada tindakan) */}
                    {(t.no_tiket_cc || t.respon_petugas) && (
                      <div className="space-y-1.5 pt-1 text-xs">
                        {/* Jika ada no tiket CC */}
                        {t.no_tiket_cc && (
                          <div className="p-2 bg-purple-50 rounded-lg border border-purple-100 text-purple-950 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <Headphones className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                              <span>Eskalasi CC: <strong className="font-mono">{t.no_tiket_cc}</strong></span>
                            </div>
                            {t.catatan_internal_cc && (
                              <span className="italic text-purple-800 text-[10px]">
                                "{t.catatan_internal_cc}"
                              </span>
                            )}
                          </div>
                        )}

                        {/* Jika ada tanggapan ke pelanggan */}
                        {t.respon_petugas && (
                          <div className="p-2 bg-cyan-50 rounded-lg border border-cyan-100 text-cyan-950 text-[11px] space-y-0.5">
                            <div className="flex items-center justify-between text-[10px] text-cyan-800">
                              <span className="font-semibold flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-cyan-700" />
                                <span>Tanggapan ke Pelanggan:</span>
                              </span>
                              <span>{t.nama_petugas_tindak_lanjut || 'Key Account'}</span>
                            </div>
                            <p className="font-medium text-cyan-950">"{t.respon_petugas}"</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus tiket ${t.id}?`)) {
                            onDeleteTiket(t.id);
                          }
                        }}
                        className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        Hapus
                      </button>

                      <button
                        onClick={() => onOpenTiketModal(t)}
                        className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>Tindak Lanjuti</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
