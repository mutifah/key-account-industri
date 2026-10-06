import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Headphones,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Phone,
  User,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react';
import { TiketLayanan, PelangganIndustri, StaffUser, StatusTiketLayanan } from '../types';

interface TiketTindakLanjutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tiket: TiketLayanan | null;
  pelangganList: PelangganIndustri[];
  currentStaff?: StaffUser | null;
  onSave: (updatedTiket: TiketLayanan) => Promise<void>;
}

type TindakLanjutMode = 'gabungan' | 'feedback_saja' | 'eskalasi_cc' | 'selesai';

export const TiketTindakLanjutModal: React.FC<TiketTindakLanjutModalProps> = ({
  isOpen,
  onClose,
  tiket,
  pelangganList,
  currentStaff,
  onSave
}) => {
  const [mode, setMode] = useState<TindakLanjutMode>('gabungan');
  const [responPelanggan, setResponPelanggan] = useState('');
  const [noTiketCc, setNoTiketCc] = useState('');
  const [catatanInternalCc, setCatatanInternalCc] = useState('');
  const [statusTiket, setStatusTiket] = useState<StatusTiketLayanan>('Terkirim');
  const [saving, setSaving] = useState(false);

  // Sync state whenever modal opens or ticket changes
  useEffect(() => {
    if (tiket && isOpen) {
      setMode(tiket.status === 'Selesai' ? 'selesai' : tiket.status === 'Diteruskan ke CC' ? 'gabungan' : 'gabungan');
      setResponPelanggan(tiket.respon_petugas || '');
      setNoTiketCc(tiket.no_tiket_cc || '');
      setCatatanInternalCc(tiket.catatan_internal_cc || '');
      setStatusTiket(tiket.status);
    }
  }, [tiket, isOpen]);

  if (!isOpen || !tiket) return null;

  const customer = pelangganList.find((p) => p.id_pelanggan === tiket.id_pelanggan);

  // Quick auto-generate CC Ticket Number
  const generateCcTicketNumber = () => {
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newNumber = `CC-AETRA-${year}-${randomDigits}`;
    setNoTiketCc(newNumber);
    return newNumber;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tiket) return;

    setSaving(true);
    try {
      let finalStatus: StatusTiketLayanan = statusTiket;
      let finalNoCc = noTiketCc;
      const finalDivisi = 'Divisi Contact Center (CC)';
      let finalCatatanCc = catatanInternalCc;
      let finalRespon = responPelanggan;

      if (mode === 'selesai') {
        finalStatus = 'Selesai';
      } else if (mode === 'eskalasi_cc') {
        finalStatus = 'Diteruskan ke CC';
        if (!finalNoCc) {
          finalNoCc = generateCcTicketNumber();
        }
        if (!finalRespon) {
          finalRespon = `Laporan telah diteruskan ke Contact Center (CC) dengan No. Tiket: ${finalNoCc} untuk penanganan tim teknis.`;
        }
      } else if (mode === 'feedback_saja') {
        finalStatus = 'Diproses';
      } else if (mode === 'gabungan') {
        finalStatus = 'Diteruskan ke CC';
        if (!finalNoCc) {
          finalNoCc = generateCcTicketNumber();
        }
        if (!finalRespon) {
          finalRespon = `Laporan Anda telah diverifikasi oleh Key Account dan diteruskan ke Contact Center (CC) dengan No. Tiket: ${finalNoCc}.`;
        }
      }

      const updated: TiketLayanan = {
        ...tiket,
        status: finalStatus,
        status_tindak_lanjut:
          finalStatus === 'Selesai'
            ? 'Selesai'
            : finalStatus === 'Diteruskan ke CC'
            ? 'Diteruskan ke CC'
            : 'Respon Langsung',
        respon_petugas: finalRespon.trim(),
        no_tiket_cc: finalNoCc.trim() || undefined,
        divisi_tujuan: finalDivisi,
        catatan_internal_cc: finalCatatanCc.trim() || undefined,
        tanggal_tindak_lanjut: new Date().toISOString(),
        nama_petugas_tindak_lanjut: currentStaff?.nama || 'Staf Key Account PT Aetra'
      };

      await onSave(updated);
      onClose();
    } catch (err) {
      console.error('Error saving complaint follow-up:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Tindak Lanjut & Eskalasi Komplain
                </h3>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/30">
                  {tiket.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Respon langsung ke pelanggan atau disposisi tiket ke Divisi Contact Center (CC) / Teknis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {/* Section 1: Detail Keluhan Pelanggan */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-700 shrink-0" />
                <span className="font-bold text-slate-900 text-sm">
                  {customer?.nama_perusahaan || tiket.id_pelanggan}
                </span>
                <span className="font-mono text-[11px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                  {tiket.id_pelanggan}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Dilaporkan: {new Date(tiket.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} WIB
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Pelanggan Mitra:</span>
                <strong className="text-slate-800 font-semibold">
                  {customer?.nama_perusahaan || tiket.id_pelanggan} ({tiket.id_pelanggan})
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">PIC Pabrik:</span>
                <strong className="text-slate-800 font-semibold">
                  {customer?.pic_nama || 'PIC Operasional'} {customer?.pic_telepon ? `(${customer.pic_telepon})` : ''}
                </strong>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-600 inline-block" />
                  <span>{tiket.perihal}</span>
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tiket.status === 'Selesai'
                      ? 'bg-emerald-100 text-emerald-800'
                      : tiket.status === 'Diteruskan ke CC'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Status Saat Ini: {tiket.status}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-xs pt-1">
                "{tiket.pesan}"
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pilihan Mode Tindak Lanjut */}
            <div>
              <label className="block font-bold text-slate-800 text-xs mb-2">
                Pilih Alur & Opsi Tindak Lanjut:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* Mode 1: Gabungan (Direkomendasikan) */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('gabungan');
                    setStatusTiket('Diteruskan ke CC');
                    if (!noTiketCc) generateCcTicketNumber();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    mode === 'gabungan'
                      ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-500/20 text-cyan-950 font-medium'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-cyan-600" />
                      <span className="font-bold text-xs">Eskalasi CC + Feedback</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-600 text-white">
                      Rekomendasi
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Teruskan ke CC (terbit No. Tiket) + kirim kabar update ke pelanggan
                  </p>
                </button>

                {/* Mode 2: Teruskan ke CC Saja */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('eskalasi_cc');
                    setStatusTiket('Diteruskan ke CC');
                    if (!noTiketCc) generateCcTicketNumber();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    mode === 'eskalasi_cc'
                      ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 text-purple-950 font-medium'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Headphones className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-xs">Teruskan ke Divisi CC</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Disposisi ke Contact Center & Divisi Distribusi Teknis
                  </p>
                </button>

                {/* Mode 3: Feedback Langsung ke Pelanggan Saja */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('feedback_saja');
                    setStatusTiket('Diproses');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    mode === 'feedback_saja'
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-950 font-medium'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs">Feedback Langsung</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Jawab langsung ke pelanggan tanpa eskalasi tiket CC
                  </p>
                </button>

                {/* Mode 4: Selesaikan Komplain */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('selesai');
                    setStatusTiket('Selesai');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    mode === 'selesai'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-medium'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs">Selesaikan Komplain</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Tandai selesai dengan catatan resolusi akhir
                  </p>
                </button>
              </div>
            </div>

            {/* Section: Form Eskalasi Contact Center (CC) (Active if mode is 'gabungan' or 'eskalasi_cc') */}
            {(mode === 'gabungan' || mode === 'eskalasi_cc') && (
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-purple-700" />
                    <h4 className="font-bold text-purple-950 text-xs">
                      Eskalasi ke Divisi Contact Center (CC)
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    Sistem CC 24 Jam
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                    Nomor Tiket CC
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={noTiketCc}
                      onChange={(e) => setNoTiketCc(e.target.value)}
                      placeholder="Contoh: CC-AETRA-2026-1029"
                      className="flex-1 p-2 bg-white border border-purple-200 rounded-lg text-xs font-mono font-semibold text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={generateCcTicketNumber}
                      className="px-2.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Auto-Gen
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                    Catatan untuk Tim CC & Petugas Lapangan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={catatanInternalCc}
                    onChange={(e) => setCatatanInternalCc(e.target.value)}
                    placeholder="Tuliskan catatan teknis atau penugasan untuk tim piket CC..."
                    className="w-full p-2 bg-white border border-purple-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Section 5: Tanggapan / Feedback Resmi untuk Pelanggan (Tampil di Portal Pelanggan) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-cyan-600" />
                  <span>
                    {mode === 'selesai'
                      ? 'Laporan Hasil Penanganan / Resolusi Akhir ke Pelanggan'
                      : 'Tanggapan / Catatan Resmi untuk Pelanggan (Tampil di Portal Pelanggan)'}
                  </span>
                </label>
                <span className="text-[10px] text-slate-500">
                  Akan dibaca langsung oleh PIC {customer?.nama_perusahaan || 'Pabrik'}
                </span>
              </div>

              <textarea
                rows={3}
                required
                value={responPelanggan}
                onChange={(e) => setResponPelanggan(e.target.value)}
                placeholder="Tuliskan respon resmi dari Key Account Aetra, penjelasan tindakan yang sedang diambil, estimasi waktu penanganan, atau tindak lanjut teknis..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>
                  Petugas Penjawab:{' '}
                  <strong className="text-slate-700">
                    {currentStaff?.nama || 'Staf Key Account PT Aetra Air Tangerang'}
                  </strong>
                </span>
                <span>
                  Status Tiket Baru:{' '}
                  <strong
                    className={
                      statusTiket === 'Selesai'
                        ? 'text-emerald-700'
                        : statusTiket === 'Diteruskan ke CC'
                        ? 'text-purple-700'
                        : 'text-cyan-700'
                    }
                  >
                    {statusTiket}
                  </strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || !responPelanggan.trim()}
                className="px-5 py-2.5 text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {mode === 'selesai'
                        ? 'Tandai Komplain Selesai'
                        : mode === 'gabungan'
                        ? 'Eskalasi ke CC & Kirim Feedback'
                        : mode === 'eskalasi_cc'
                        ? 'Teruskan Tiket ke CC'
                        : 'Kirim Feedback ke Pelanggan'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
