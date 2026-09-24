import React, { useState, useEffect } from 'react';
import { X, Gauge, Calculator, CheckCircle2 } from 'lucide-react';
import { PelangganIndustri, PemakaianAir, StatusProgressMeter } from '../types';

interface MeterReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<PemakaianAir, 'id'> & { id?: string }) => Promise<void>;
  pelangganList: PelangganIndustri[];
  initialData?: PemakaianAir | null;
  latestReadingsMap?: Record<string, number>;
}

const BULAN_OPTIONS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const MeterReadingModal: React.FC<MeterReadingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  pelangganList,
  initialData,
  latestReadingsMap = {}
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [periodeBulan, setPeriodeBulan] = useState('September');
  const [periodeTahun, setPeriodeTahun] = useState(2026);
  const [tanggalBaca, setTanggalBaca] = useState(new Date().toISOString().split('T')[0]);
  const [noBpm, setNoBpm] = useState('');
  const [meterAwal, setMeterAwal] = useState<number>(0);
  const [meterAkhir, setMeterAkhir] = useState<number>(0);
  const [statusProgress, setStatusProgress] = useState<StatusProgressMeter>('Pembacaan Meter');
  const [catatanPetugas, setCatatanPetugas] = useState('');
  const [namaStaf, setNamaStaf] = useState('Staf Key Account Aetra');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSelectedCustomerId(initialData.id_pelanggan);
      setPeriodeBulan(initialData.periode_bulan);
      setPeriodeTahun(initialData.periode_tahun);
      setTanggalBaca(initialData.tanggal_baca);
      setNoBpm(initialData.no_bpm || `BPM/${initialData.periode_tahun}/09/${initialData.id_pelanggan.split('-').pop() || '001'}`);
      setMeterAwal(initialData.meter_awal);
      setMeterAkhir(initialData.meter_akhir);
      setStatusProgress(initialData.status_progress || 'Pembacaan Meter');
      setCatatanPetugas(initialData.catatan_petugas || '');
      setNamaStaf(initialData.nama_staf_pencatat || 'Staf Key Account Aetra');
    } else if (pelangganList.length > 0 && !selectedCustomerId) {
      const first = pelangganList[0];
      setSelectedCustomerId(first.id_pelanggan);
      const prevMeter = latestReadingsMap[first.id_pelanggan] || 0;
      setMeterAwal(prevMeter);
      setMeterAkhir(prevMeter + 1000);
      setNoBpm(`BPM/2026/09/${first.id_pelanggan.split('-').pop() || '001'}`);
    }
  }, [initialData, pelangganList, isOpen]);

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (!initialData) {
      const prevMeter = latestReadingsMap[customerId] || 0;
      setMeterAwal(prevMeter);
      setMeterAkhir(prevMeter);
      setNoBpm(`BPM/2026/09/${customerId.split('-').pop() || '001'}`);
    }
  };

  if (!isOpen) return null;

  const currentCustomer = pelangganList.find(p => p.id_pelanggan === selectedCustomerId);
  const totalM3 = Math.max(0, meterAkhir - meterAwal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;
    if (meterAkhir < meterAwal) {
      alert('Angka meter akhir tidak boleh lebih kecil dari meter awal.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        id: initialData?.id,
        id_pelanggan: selectedCustomerId,
        periode_bulan: periodeBulan,
        periode_tahun: Number(periodeTahun),
        tanggal_baca: tanggalBaca,
        no_bpm: noBpm || undefined,
        tanggal_bpm: statusProgress === 'Penerbitan BPM' ? tanggalBaca : (initialData?.tanggal_bpm || tanggalBaca),
        tanggal_verifikasi: statusProgress === 'Terverifikasi' ? new Date().toISOString().split('T')[0] : undefined,
        meter_awal: Number(meterAwal),
        meter_akhir: Number(meterAkhir),
        total_m3: totalM3,
        status_progress: statusProgress,
        catatan_petugas: catatanPetugas,
        nama_staf_pencatat: namaStaf
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data pemakaian.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">
                {initialData ? 'Edit Data Pembacaan Meter Air' : 'Input Stand Meter Air Industri'}
              </h2>
              <p className="text-xs text-slate-400">Pencatatan real-time stand meter dan tracking progress 3 tahap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Customer Selection */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Pilih Pelanggan Industri *
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
            >
              {pelangganList.map((p) => (
                <option key={p.id_pelanggan} value={p.id_pelanggan}>
                  [{p.id_pelanggan}] {p.nama_perusahaan} ({p.alamat_kawasan})
                </option>
              ))}
            </select>
            {currentCustomer && (
              <div className="mt-1 text-[11px] text-slate-500 flex gap-3">
                <span>No. Meter: <strong className="font-mono text-slate-700">{currentCustomer.no_meter}</strong></span>
                <span>Zona: <strong className="text-slate-700">{currentCustomer.zona_distribusi}</strong></span>
              </div>
            )}
          </div>

          {/* Period & Date & BPM */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Periode Bulan</label>
              <select
                value={periodeBulan}
                onChange={(e) => setPeriodeBulan(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
              >
                {BULAN_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Periode Tahun</label>
              <input
                type="number"
                value={periodeTahun}
                onChange={(e) => setPeriodeTahun(Number(e.target.value))}
                min={2020}
                max={2035}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Pembacaan</label>
              <input
                type="date"
                value={tanggalBaca}
                onChange={(e) => setTanggalBaca(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* No. Dokumen BPM */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nomor Dokumen BPM (Bukti Pembacaan Meter)
            </label>
            <input
              type="text"
              value={noBpm}
              onChange={(e) => setNoBpm(e.target.value)}
              placeholder="Contoh: BPM/2026/09/CKP-001"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono"
            />
          </div>

          {/* Meter Readings */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Angka Meter Awal (m³) *
              </label>
              <input
                type="number"
                value={meterAwal}
                onChange={(e) => setMeterAwal(Number(e.target.value))}
                min={0}
                step="any"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white font-mono text-sm"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Stand meter pembacaan bulan lalu</span>
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Angka Meter Akhir (m³) *
              </label>
              <input
                type="number"
                value={meterAkhir}
                onChange={(e) => setMeterAkhir(Number(e.target.value))}
                min={meterAwal}
                step="any"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white font-mono text-sm font-semibold"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Stand meter hasil pembacaan real-time</span>
            </div>
          </div>

          {/* Calculated Volume */}
          <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-cyan-300">
              <Calculator className="w-4 h-4" />
              Total Volume Kubikasi Pemakaian Air:
            </span>
            <span className="text-lg font-mono font-extrabold text-cyan-300">
              {totalM3.toLocaleString('id-ID')} m³
            </span>
          </div>

          {/* Progress Tracking Status & Staff */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Status Tracking Progress *
              </label>
              <select
                value={statusProgress}
                onChange={(e) => setStatusProgress(e.target.value as StatusProgressMeter)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white font-semibold"
              >
                <option value="Penerbitan BPM">1. Penerbitan BPM (Surat Terbit)</option>
                <option value="Pembacaan Meter">2. Pembacaan Meter (Stand Tercatat)</option>
                <option value="Terverifikasi">3. Terverifikasi (Disahkan Supervisor)</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Status ini akan langsung ter-update di portal pelanggan industri
              </span>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Staf Pencatat</label>
              <input
                type="text"
                value={namaStaf}
                onChange={(e) => setNamaStaf(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Verifikasi / Lapangan</label>
            <textarea
              rows={2}
              value={catatanPetugas}
              onChange={(e) => setCatatanPetugas(e.target.value)}
              placeholder="Contoh: Segel meter utuh dan akurat. Display meter bersih."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Data Pemakaian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
