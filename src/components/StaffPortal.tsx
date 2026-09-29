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
  KeyRound,
  FileCheck2,
  Clock,
  ArrowRight,
  Download,
  FileText,
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  Megaphone
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
  onOpenLabModal: (initialData?: HasilLabHarian | null, kategori?: 'Reservoar' | 'Pompa Booster' | 'Industri') => void;
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
  onUpdateStatusProgress
}) => {
  const [activeTab, setActiveTab] = useState<'pemakaian' | 'lab' | 'pelayanan' | 'pelanggan'>('pemakaian');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('Semua');
  const [filterLabKategori, setFilterLabKategori] = useState<string>('Semua');

  // Customer map for quick lookup
  const customerMap = useMemo(() => {
    const map: Record<string, PelangganIndustri> = {};
    pelangganList.forEach(p => {
      map[p.id_pelanggan] = p;
    });
    return map;
  }, [pelangganList]);

  // Lab Category counts (Reservoar, Booster, & Industri Personalized)
  const reservoarCount = useMemo(() => labResults.filter(l => (l.kategori_lab || 'Reservoar') === 'Reservoar').length, [labResults]);
  const boosterCount = useMemo(() => labResults.filter(l => l.kategori_lab === 'Pompa Booster').length, [labResults]);
  const industriCount = useMemo(() => labResults.filter(l => l.kategori_lab === 'Industri' || l.kategori_lab === 'Uji Khusus Pabrik').length, [labResults]);

  // Download Lab PDF Helper
  const handleDownloadLabPdf = (lab: HasilLabHarian) => {
    const isInd = lab.kategori_lab === 'Industri' || lab.kategori_lab === 'Uji Khusus Pabrik';
    const url = lab.pdf_url || generateOfficialLabPdfDataUrl(
      lab.judul_dokumen || (isInd ? `Laporan Uji Mutu Air Industri - ${lab.nama_perusahaan_khusus || ''}` : 'Hasil Uji Mutu Air Reservoar IPA Sepatan'),
      lab.no_sertifikat_lab,
      lab.kategori_lab || 'Reservoar',
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

  // Filtered Lab Results
  const filteredLab = useMemo(() => {
    return labResults.filter(l => {
      const matchSearch =
        l.tanggal_uji.includes(searchQuery) ||
        l.lokasi_sampling.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.no_sertifikat_lab.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.judul_dokumen && l.judul_dokumen.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.nama_perusahaan_khusus && l.nama_perusahaan_khusus.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.id_pelanggan_khusus && l.id_pelanggan_khusus.toLowerCase().includes(searchQuery.toLowerCase()));

      const isReservoar = (l.kategori_lab || 'Reservoar') === 'Reservoar';
      const isBooster = l.kategori_lab === 'Pompa Booster';
      const isIndustri = l.kategori_lab === 'Industri' || l.kategori_lab === 'Uji Khusus Pabrik';

      const matchKategori =
        filterLabKategori === 'Semua' ||
        (filterLabKategori === 'Reservoar' && isReservoar) ||
        (filterLabKategori === 'Pompa Booster' && isBooster) ||
        (filterLabKategori === 'Industri' && isIndustri);

      return matchSearch && matchKategori;
    });
  }, [labResults, searchQuery, filterLabKategori]);

  // Export to CSV helper
  const exportPemakaianCSV = () => {
    const headers = ['ID Pelanggan,Nama Perusahaan,Periode Bulan,Tahun,Tanggal Baca,No BPM,Meter Awal,Meter Akhir,Volume m3,Status Progress,Pencatat\n'];
    const rows = filteredPemakaian.map(p => {
      const cust = customerMap[p.id_pelanggan];
      return `"${p.id_pelanggan}","${cust?.nama_perusahaan || ''}","${p.periode_bulan}",${p.periode_tahun},"${p.tanggal_baca}","${p.no_bpm || ''}",${p.meter_awal},${p.meter_akhir},${p.total_m3},"${p.status_progress}","${p.nama_staf_pencatat || ''}"\n`;
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
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                Rekap pemakaian air bulanan via Excel/manual, hasil lab harian & info pelayanan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={onOpenExcelModal}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Rekap Excel</span>
            </button>
            <button
              onClick={() => onOpenMeterModal(null)}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Manual</span>
            </button>
            <button
              onClick={() => onOpenLabModal(null)}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Upload Berkas PDF Hasil Uji Lab (Reservoar / Industri)"
            >
              <FileCheck2 className="w-4 h-4 text-cyan-200" />
              <span>Upload PDF Hasil Uji Lab</span>
            </button>
            <button
              onClick={() => onOpenInfoModal(null)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Megaphone className="w-4 h-4 text-slate-950" />
              <span>Input Banner Gangguan</span>
            </button>
          </div>
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
              setActiveTab('pelanggan');
              setSearchQuery('');
            }}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'pelanggan'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>4. Master Pelanggan & Akun ({pelangganList.length})</span>
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
                  placeholder="Cari ID Pelanggan / Pabrik / No. BPM..."
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
                    <th className="p-3">Periode & No. BPM</th>
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
                          {p.no_bpm ? (
                            <span className="font-mono text-[11px] text-slate-500">
                              {p.no_bpm}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Tanpa No. BPM</span>
                          )}
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

      {/* TAB 2: HASIL LAB KUALITAS AIR - 2 KATEGORI: RESERVOAR & INDUSTRI (PERSONALIZED) */}
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
              </div>
              <h3 className="text-base font-bold text-white">
                Upload Dokumen PDF Hasil Uji Lab Reservoar & Hasil Uji Lab Industri
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Staf laboratorium dapat mengunggah berkas PDF resmi untuk Hasil Uji Lab Reservoar IPA Sepatan maupun Hasil Uji Lab Industri khusus yang ditujukan pada pelanggan industri tertentu.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              <button
                onClick={() => onOpenLabModal(null)}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-cyan-200" />
                <span>+ Upload PDF Hasil Uji Lab</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills & Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Filter Tabs */}
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
                onClick={() => setFilterLabKategori('Reservoar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterLabKategori === 'Reservoar'
                    ? 'bg-cyan-700 text-white shadow-xs'
                    : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Hasil Uji Lab Reservoar</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterLabKategori === 'Reservoar' ? 'bg-white/20' : 'bg-cyan-200 text-cyan-900'}`}>
                  {reservoarCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterLabKategori('Pompa Booster')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterLabKategori === 'Pompa Booster'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Hasil Uji Lab Booster</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterLabKategori === 'Pompa Booster' ? 'bg-white/20' : 'bg-amber-200 text-amber-950'}`}>
                  {boosterCount}
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
                <span>Hasil Uji Lab Industri (Personalized)</span>
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
                placeholder="Cari laporan / no COA / pabrik..."
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
                    <th className="p-3">No. Sertifikat / COA</th>
                    <th className="p-3 text-center">Status Kelayakan</th>
                    <th className="p-3 text-center">Aksi Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLab.map((l) => {
                    const isKhusus = l.kategori_lab === 'Industri' || l.kategori_lab === 'Uji Khusus Pabrik';
                    return (
                      <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                          {l.tanggal_uji}
                          <span className="block text-[10px] text-slate-500 font-sans">{l.waktu_sampling || '08:00 WIB'}</span>
                        </td>

                        <td className="p-3">
                          {l.kategori_lab === 'Pompa Booster' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Gauge className="w-3 h-3 text-amber-700" />
                              <span>Hasil Uji Lab Booster</span>
                            </span>
                          )}
                          {(l.kategori_lab === 'Reservoar' || (!isKhusus && l.kategori_lab !== 'Pompa Booster')) && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-300">
                              <FlaskConical className="w-3 h-3 text-cyan-700" />
                              <span>Hasil Uji Lab Reservoar</span>
                            </span>
                          )}
                          {isKhusus && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
                                <Sparkles className="w-3 h-3 text-indigo-600" />
                                <span>Hasil Uji Lab Industri</span>
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
                          <span className="block text-[10px] text-slate-400">
                            Analis: {l.nama_analis_lab || 'Nurul Hidayati, S.Si'}
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

                        <td className="p-3 font-mono text-cyan-900 font-semibold text-xs whitespace-nowrap">
                          {l.no_sertifikat_lab}
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
                              onClick={() => onOpenLabModal(l, isKhusus ? 'Industri' : l.kategori_lab === 'Pompa Booster' ? 'Pompa Booster' : 'Reservoar')}
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

      {/* TAB 4: MASTER DATA PELANGGAN INDUSTRI (NO DIAMETER, NO TARIF, NO KUOTA) */}
      {activeTab === 'pelanggan' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Master Data Pelanggan Key Account Industri
              </h3>
              <p className="text-xs text-slate-500">
                Data kredensial login portal mandiri pelanggan (ID Pelanggan & Password) serta kontak PIC
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onOpenExcelModal}
                className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload Excel & Sinkronisasi Nama</span>
              </button>
              <button
                onClick={() => onOpenCustomerModal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Registrasi Pelanggan Baru</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">ID Pelanggan</th>
                    <th className="p-3">Nama Perusahaan & Sektor</th>
                    <th className="p-3">Kata Sandi (Password)</th>
                    <th className="p-3">Alamat Kawasan & Zona</th>
                    <th className="p-3">PIC Pabrik</th>
                    <th className="p-3">No. Meter Fisik</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pelangganList.map((c) => (
                    <tr key={c.id_pelanggan} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-cyan-800 whitespace-nowrap">
                        {c.id_pelanggan}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{c.nama_perusahaan}</span>
                        <span className="text-[11px] text-slate-500">{c.bidang_usaha}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          <KeyRound className="w-3 h-3 text-slate-400" />
                          <span>{c.password || 'aetra123'}</span>
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 max-w-xs truncate">
                        <div>{c.alamat_kawasan}</div>
                        <div className="text-[11px] text-slate-500">{c.zona_distribusi}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-slate-800 block">{c.pic_nama}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{c.pic_telepon}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-800 whitespace-nowrap">
                        {c.no_meter}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenCustomerModal(c)}
                            title="Edit Data Pelanggan"
                            className="p-1 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus pelanggan ${c.nama_perusahaan}? Seluruh riwayat pemakaian juga akan terhapus.`)) {
                                onDeleteCustomer(c.id_pelanggan);
                              }
                            }}
                            title="Hapus Pelanggan"
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
