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
  ArrowRight
} from 'lucide-react';
import {
  PelangganIndustri,
  PemakaianAir,
  HasilLabHarian,
  InfoPelayanan,
  TiketLayanan,
  StaffUser,
  StatusProgressMeter
} from '../types';

interface StaffPortalProps {
  currentStaff?: StaffUser | null;
  pelangganList: PelangganIndustri[];
  pemakaianList: PemakaianAir[];
  labResults: HasilLabHarian[];
  infoPelayanan: InfoPelayanan[];
  tiketList: TiketLayanan[];
  onOpenMeterModal: (initialData?: PemakaianAir | null) => void;
  onOpenLabModal: (initialData?: HasilLabHarian | null) => void;
  onOpenInfoModal: (initialData?: InfoPelayanan | null) => void;
  onOpenCustomerModal: (initialData?: PelangganIndustri | null) => void;
  onOpenExcelModal: () => void;
  onDeletePemakaian: (id: string) => Promise<void>;
  onDeleteLab: (id: string) => Promise<void>;
  onDeleteInfo: (id: string) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
  onOpenCertificate: (data: HasilLabHarian) => void;
  onToggleInfoPublish: (info: InfoPelayanan) => Promise<void>;
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
  onVerifyPemakaian,
  onUpdateStatusProgress
}) => {
  const [activeTab, setActiveTab] = useState<'pemakaian' | 'lab' | 'pelayanan' | 'pelanggan'>('pemakaian');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Customer map for quick lookup
  const customerMap = useMemo(() => {
    const map: Record<string, PelangganIndustri> = {};
    pelangganList.forEach(p => {
      map[p.id_pelanggan] = p;
    });
    return map;
  }, [pelangganList]);

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
      const matchStatus = filterStatus === 'Semua' || p.status_progress === filterStatus;
      return matchSearch && matchMonth && matchStatus;
    });
  }, [pemakaianList, customerMap, searchQuery, filterMonth, filterStatus]);

  // Filtered Lab Results
  const filteredLab = useMemo(() => {
    return labResults.filter(l => {
      return (
        l.tanggal_uji.includes(searchQuery) ||
        l.lokasi_sampling.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.no_sertifikat_lab.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [labResults, searchQuery]);

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
                Rekap pemakaian air bulanan via Excel/manual, tracking 3 tahap (BPM - Baca - Terverifikasi), hasil lab harian & info pelayanan.
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
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <span>Input Hasil Lab</span>
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
            <span>1. Pemakaian Air & Tracking ({pemakaianList.length})</span>
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
            <span>2. Hasil Lab Mutu Air ({labResults.length})</span>
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

      {/* TAB 1: PEMAKAIAN AIR BULANAN & TRACKING PROGRESS */}
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

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
              >
                <option value="Semua">Semua Status Tracking</option>
                <option value="Penerbitan BPM">Penerbitan BPM</option>
                <option value="Pembacaan Meter">Pembacaan Meter</option>
                <option value="Terverifikasi">Terverifikasi</option>
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
                    <th className="p-3 text-center">Tracking Progress (Klik untuk Update)</th>
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
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <select
                              value={p.status_progress}
                              onChange={(e) => onUpdateStatusProgress(p, e.target.value as StatusProgressMeter)}
                              className={`text-[11px] font-bold py-1 px-2.5 rounded-lg border cursor-pointer transition-colors ${
                                p.status_progress === 'Terverifikasi'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : p.status_progress === 'Pembacaan Meter'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                              }`}
                            >
                              <option value="Penerbitan BPM">1. Penerbitan BPM</option>
                              <option value="Pembacaan Meter">2. Pembacaan Meter</option>
                              <option value="Terverifikasi">3. Terverifikasi</option>
                            </select>

                            {/* Quick advance shortcut */}
                            {p.status_progress === 'Penerbitan BPM' && (
                              <button
                                onClick={() => onUpdateStatusProgress(p, 'Pembacaan Meter')}
                                title="Lanjut ke Pembacaan Meter"
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              >
                                <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                              </button>
                            )}
                            {p.status_progress === 'Pembacaan Meter' && (
                              <button
                                onClick={() => onUpdateStatusProgress(p, 'Terverifikasi')}
                                title="Verifikasi Selesai"
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              </button>
                            )}
                          </div>
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

      {/* TAB 2: HASIL LAB KUALITAS AIR */}
      {activeTab === 'lab' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tanggal / titik sampling / no sertifikat..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              onClick={() => onOpenLabModal(null)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Pengujian Lab Baru</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tanggal & Waktu</th>
                    <th className="p-3">Titik Sampling</th>
                    <th className="p-3 text-right">pH</th>
                    <th className="p-3 text-right">Kekeruhan</th>
                    <th className="p-3 text-right">Khlor (mg/L)</th>
                    <th className="p-3 text-right">TDS (mg/L)</th>
                    <th className="p-3 text-center">E. Coli</th>
                    <th className="p-3">No. Sertifikat</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLab.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-semibold text-slate-900">
                        {l.tanggal_uji}
                        <span className="block text-[10px] text-slate-500 font-sans">{l.waktu_sampling}</span>
                      </td>
                      <td className="p-3 text-slate-700 max-w-xs truncate">
                        {l.lokasi_sampling}
                        <span className="block text-[10px] text-slate-500">Analis: {l.nama_analis_lab}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{l.ph}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">{l.kekeruhan_ntu} NTU</td>
                      <td className="p-3 text-right font-mono font-bold text-cyan-700">{l.sisa_khlor_mg_l}</td>
                      <td className="p-3 text-right font-mono text-slate-800">{l.tds_mg_l}</td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-700">{l.e_coli_cfu} CFU</td>
                      <td className="p-3 font-mono text-cyan-800">{l.no_sertifikat_lab}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenCertificate(l)}
                            title="Lihat Sertifikat COA"
                            className="p-1 rounded text-cyan-700 hover:bg-cyan-50 cursor-pointer"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenLabModal(l)}
                            title="Edit Data Lab"
                            className="p-1 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Hapus hasil pengujian lab ini?')) {
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
                  ))}
                  {filteredLab.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        Tidak ada log pengujian lab yang sesuai.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INFO PELAYANAN */}
      {activeTab === 'pelayanan' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pusat Pengumuman Pelayanan & Pasokan Air
              </h3>
              <p className="text-xs text-slate-500">
                Pemberitahuan pemeliharaan jaringan, flushing, dan informasi transmisi bagi pelanggan
              </p>
            </div>
            <button
              onClick={() => onOpenInfoModal(null)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Info Baru</span>
            </button>
          </div>

          <div className="space-y-3">
            {infoPelayanan.map((info) => (
              <div
                key={info.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded border border-cyan-200">
                      {info.tipe}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {info.tingkat_urgensi}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {info.judul}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {info.deskripsi}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Wilayah: <strong className="text-slate-700">{info.wilayah_terdampak}</strong></span>
                    <span>Status: <strong className="text-slate-700">{info.status_aliran}</strong></span>
                    <span>PIC: {info.pic_nama} ({info.pic_kontak})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                  <button
                    onClick={() => onToggleInfoPublish(info)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      info.status_publikasi
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {info.status_publikasi ? 'Tayang (Aktif)' : 'Disembunyikan'}
                  </button>
                  <button
                    onClick={() => onOpenInfoModal(info)}
                    className="p-1.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
                        onDeleteInfo(info.id);
                      }
                    }}
                    className="p-1.5 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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
