import React, { useState, useMemo } from 'react';
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
  FileCheck2
} from 'lucide-react';
import {
  PelangganIndustri,
  PemakaianAir,
  HasilLabHarian,
  InfoPelayanan,
  TiketLayanan,
  StatusProgressMeter
} from '../types';

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

  // Tiket Form
  const [tiketPerihal, setTiketPerihal] = useState('');
  const [tiketKategori, setTiketKategori] = useState('Kalibrasi & Pengukuran');
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

  // Helper for tracking steps index
  const getStepIndex = (status: StatusProgressMeter): number => {
    switch (status) {
      case 'Penerbitan BPM':
        return 1;
      case 'Pembacaan Meter':
        return 2;
      case 'Terverifikasi':
        return 3;
      default:
        return 2;
    }
  };

  const activeStep = latestPemakaian ? getStepIndex(latestPemakaian.status_progress) : 2;

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

          <div className="flex lg:flex-col items-end justify-between lg:justify-center border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
            <div className="text-left lg:text-right">
              <span className="text-[11px] text-slate-500 block uppercase font-semibold">
                Status Aliran Jaringan
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                Tekanan Normal Stabil (3.2 - 3.8 Bar)
              </span>
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
          <span>Tracking Pemakaian Air ({customerPemakaian.length} Rekap)</span>
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
          <span>Hasil Lab Mutu Air Harian (Permenkes)</span>
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

      {/* TAB 1: PEMAKAIAN AIR BULANAN DENGAN TRACKING 3 TAHAP */}
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

            {/* Card 4: Status Tracking Saat Ini */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Status Tracking Berjalan
              </span>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${
                    latestPemakaian?.status_progress === 'Terverifikasi'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : latestPemakaian?.status_progress === 'Pembacaan Meter'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      latestPemakaian?.status_progress === 'Terverifikasi'
                        ? 'bg-emerald-500'
                        : latestPemakaian?.status_progress === 'Pembacaan Meter'
                        ? 'bg-amber-500 animate-ping'
                        : 'bg-indigo-500'
                    }`}
                  />
                  <span>{latestPemakaian?.status_progress || 'Penerbitan BPM'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {latestPemakaian?.tanggal_baca ? `Tanggal Baca: ${latestPemakaian.tanggal_baca}` : 'Menunggu jadwal'}
              </p>
            </div>
          </div>

          {/* VISUAL 3-STEP TRACKING PROGRESS PIPELINE */}
          {latestPemakaian && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Tracking Progress Pembacaan Meter Industri
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Periode {latestPemakaian.periode_bulan} {latestPemakaian.periode_tahun}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Siklus resmi alur pencatatan stand meter mandiri pelanggan industri PT Aetra Air Tangerang
                  </p>
                </div>
                {latestPemakaian.no_bpm && (
                  <span className="text-xs font-mono bg-slate-800 px-3 py-1 rounded-md text-cyan-300 border border-slate-700">
                    No. Dokumen: {latestPemakaian.no_bpm}
                  </span>
                )}
              </div>

              {/* Steps Component */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                {/* Step 1: Penerbitan BPM */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    activeStep >= 1
                      ? 'bg-slate-800/90 border-cyan-500/60 shadow-sm'
                      : 'bg-slate-900/50 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                      Tahap 1
                    </span>
                    {activeStep >= 1 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                        <Check className="w-3 h-3" />
                        <span>Selesai</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Menunggu</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white">Penerbitan BPM</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Surat Perintah Bukti Pembacaan Meter (BPM) telah diterbitkan kantor Aetra.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 flex flex-col gap-1">
                    <span>Tanggal Terbit: <strong className="text-slate-200">{latestPemakaian.tanggal_bpm || latestPemakaian.tanggal_baca}</strong></span>
                    {latestPemakaian.no_bpm && (
                      <span className="font-mono text-cyan-300 truncate">{latestPemakaian.no_bpm}</span>
                    )}
                  </div>
                </div>

                {/* Step 2: Pembacaan Meter */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    activeStep >= 2
                      ? 'bg-slate-800/90 border-amber-500/60 shadow-sm'
                      : 'bg-slate-900/50 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Tahap 2
                    </span>
                    {activeStep >= 2 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                        <Check className="w-3 h-3" />
                        <span>Tercatat</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-400 animate-pulse">Menunggu Jadwal</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white">Pembacaan Meter Fisik</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Pencatatan stand meter langsung di lokasi flow meter pabrik oleh teknisi lapangan.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 flex flex-col gap-1">
                    <span>Tanggal Baca: <strong className="text-slate-200">{latestPemakaian.tanggal_baca}</strong></span>
                    <span>Volume: <strong className="font-mono text-amber-300 font-bold">{latestPemakaian.total_m3.toLocaleString('id-ID')} m³</strong></span>
                  </div>
                </div>

                {/* Step 3: Terverifikasi */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    activeStep === 3
                      ? 'bg-slate-800/90 border-emerald-500/60 shadow-sm'
                      : 'bg-slate-900/50 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      Tahap 3
                    </span>
                    {activeStep === 3 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                        <Check className="w-3 h-3" />
                        <span>Terverifikasi</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Review Supervisor</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white">Validasi & Terverifikasi</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Data pembacaan disahkan oleh Key Account Executive & Tim Komersial Aetra.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 flex flex-col gap-1">
                    <span>Status: <strong className="text-emerald-300">{activeStep === 3 ? 'Sah & Akurat' : 'Menunggu Pengesahan'}</strong></span>
                    {latestPemakaian.nama_staf_pencatat && (
                      <span className="truncate">Oleh: {latestPemakaian.nama_staf_pencatat}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Table of Readings */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Riwayat Pembacaan Meter Air Industri
                </h3>
                <p className="text-xs text-slate-500">
                  Data historis stand meter fisik, kubikasi air (m³), dan status tahapan progress
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
                    <th className="p-3">No. BPM</th>
                    <th className="p-3 text-right">Stand Awal</th>
                    <th className="p-3 text-right">Stand Akhir</th>
                    <th className="p-3 text-right">Volume (m³)</th>
                    <th className="p-3 text-center">Status Tracking Progress</th>
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
                      <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                        {p.no_bpm || '-'}
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
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            p.status_progress === 'Terverifikasi'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : p.status_progress === 'Pembacaan Meter'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status_progress === 'Terverifikasi'
                                ? 'bg-emerald-500'
                                : p.status_progress === 'Pembacaan Meter'
                                ? 'bg-amber-500'
                                : 'bg-indigo-500'
                            }`}
                          />
                          <span>{p.status_progress}</span>
                        </span>
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

      {/* TAB 2: HASIL LAB KUALITAS AIR HARIAN (PERMENKES NO. 2/2023) */}
      {activeTab === 'lab' && (
        <div className="space-y-6">
          {/* Lab Quality Overview Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                    Jaminan Mutu Air Minum Industri
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Standar Mutu Baku Permenkes RI No. 2 Tahun 2023
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Pengujian kualitas air minum dilakukan setiap hari dari titik offtake dan reservoir distribusi untuk memastikan kesesuaian fisik, kimia, dan mikrobiologi bagi kebutuhan utilitas & produksi industri Anda.
                </p>
              </div>

              {latestLab && (
                <button
                  onClick={() => onOpenCertificate(latestLab)}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Unduh Sertifikat Hasil Uji Lab</span>
                </button>
              )}
            </div>
          </div>

          {/* Detailed Lab Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Log Hasil Pengujian Laboratorium Harian Aetra
              </h3>
              <p className="text-xs text-slate-500">
                Data validasi harian oleh Analis Kualitas Air & Penanggung Jawab Teknis Laboratorium IPA
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tanggal & Waktu Sampling</th>
                    <th className="p-3">Lokasi Sampling</th>
                    <th className="p-3 text-center">pH (6.5 - 8.5)</th>
                    <th className="p-3 text-center">Kekeruhan (&lt; 3.0 NTU)</th>
                    <th className="p-3 text-center">Sisa Khlor (0.2 - 0.5 mg/L)</th>
                    <th className="p-3 text-center">TDS (&lt; 300 mg/L)</th>
                    <th className="p-3 text-center">E. Coli (0 CFU)</th>
                    <th className="p-3 text-center">Status Kelayakan</th>
                    <th className="p-3 text-center">Sertifikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {labResults.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                        <div>{l.tanggal_uji}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{l.waktu_sampling}</div>
                      </td>
                      <td className="p-3 text-slate-700 max-w-xs truncate">
                        {l.lokasi_sampling}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-900">
                        {l.ph}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-700">
                        {l.kekeruhan_ntu} NTU
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-700">
                        {l.sisa_khlor_mg_l} mg/L
                      </td>
                      <td className="p-3 text-center font-mono text-slate-800">
                        {l.tds_mg_l} mg/L
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-700">
                        {l.e_coli_cfu} CFU
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>MEMENUHI SYARAT</span>
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onOpenCertificate(l)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 rounded border border-cyan-200 transition-colors cursor-pointer"
                        >
                          Lihat COA
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                  <div>Status Aliran: <strong className="text-amber-600">{info.status_aliran}</strong></div>
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
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Kalibrasi & Akurasi Meter">Kalibrasi & Akurasi Meter</option>
                  <option value="Permohonan Uji Lab Khusus">Permohonan Uji Lab Khusus</option>
                  <option value="Penyesuaian Debit Aliran">Penyesuaian Debit Aliran</option>
                  <option value="Lainnya">Lainnya</option>
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
                  placeholder="Contoh: Permohonan Uji Tera Bersama"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
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
                  placeholder="Jelaskan kebutuhan teknis pabrik..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
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
              <div className="space-y-3">
                {customerTickets.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-500">{t.kategori}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{t.perihal}</h4>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {t.pesan}
                    </p>
                    {t.respon_petugas && (
                      <div className="mt-2 p-2.5 rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-950">
                        <span className="font-bold block text-[11px] text-cyan-800 mb-0.5">
                          Tanggapan Petugas Aetra:
                        </span>
                        <p>{t.respon_petugas}</p>
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
