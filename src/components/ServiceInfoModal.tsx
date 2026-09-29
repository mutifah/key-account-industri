import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, BellRing } from 'lucide-react';
import { InfoPelayanan, TipeInfoPelayanan, StatusAliran } from '../types';

interface ServiceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<InfoPelayanan, 'id'> & { id?: string }) => Promise<void>;
  initialData?: InfoPelayanan | null;
}

export const ServiceInfoModal: React.FC<ServiceInfoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [judul, setJudul] = useState('');
  const [tipe, setTipe] = useState<TipeInfoPelayanan>('Pemeliharaan Jaringan');
  const [tingkatUrgensi, setTingkatUrgensi] = useState<'Normal' | 'Info' | 'Penting' | 'Darurat'>('Penting');
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().slice(0, 16));
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [wilayahTerdampak, setWilayahTerdampak] = useState('Kawasan Industri Jatake, Kawasan Industri Manis, dan sekitarnya');
  const [deskripsi, setDeskripsi] = useState('');
  const [statusAliran, setStatusAliran] = useState<StatusAliran>('Penurunan Tekanan Sementara');
  const [solusiMitigasi, setSolusiMitigasi] = useState('Pelanggan dihimbau mengisi ground water tank penuh sebelum pengerjaan.');
  const [picNama, setPicNama] = useState('Key Account Officer Aetra');
  const [picKontak, setPicKontak] = useState('+62 811-9988-7711 (WhatsApp 24 Jam)');
  const [statusPublikasi, setStatusPublikasi] = useState(true);
  const [tampilkanBanner, setTampilkanBanner] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setJudul(initialData.judul);
      setTipe(initialData.tipe);
      setTingkatUrgensi(initialData.tingkat_urgensi);
      setTanggalMulai(initialData.tanggal_mulai ? initialData.tanggal_mulai.slice(0, 16) : '');
      setTanggalSelesai(initialData.tanggal_selesai ? initialData.tanggal_selesai.slice(0, 16) : '');
      setWilayahTerdampak(initialData.wilayah_terdampak);
      setDeskripsi(initialData.deskripsi);
      setStatusAliran(initialData.status_aliran);
      setSolusiMitigasi(initialData.solusi_mitigasi || '');
      setPicNama(initialData.pic_nama);
      setPicKontak(initialData.pic_kontak);
      setStatusPublikasi(initialData.status_publikasi);
      setTampilkanBanner(initialData.tampilkan_banner !== false);
    } else {
      setJudul('');
      setDeskripsi('');
      setTampilkanBanner(true);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !deskripsi) return;
    setSubmitting(true);
    try {
      await onSave({
        id: initialData?.id,
        judul,
        tipe,
        tingkat_urgensi: tingkatUrgensi,
        tanggal_mulai: tanggalMulai ? new Date(tanggalMulai).toISOString() : new Date().toISOString(),
        tanggal_selesai: tanggalSelesai ? new Date(tanggalSelesai).toISOString() : undefined,
        wilayah_terdampak: wilayahTerdampak,
        deskripsi,
        status_aliran: statusAliran,
        solusi_mitigasi: solusiMitigasi,
        pic_nama: picNama,
        pic_kontak: picKontak,
        status_publikasi: statusPublikasi,
        tampilkan_banner: tampilkanBanner
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan info pelayanan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {initialData ? 'Edit Pengumuman Gangguan / Pemadaman Air' : 'Buat Pengumuman Gangguan & Pemadaman Air'}
              </h2>
              <p className="text-xs text-slate-400">
                Pemberitahuan resmi mengenai perbaikan, pemeliharaan, dan pemadaman operasional air minum
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Banner Toggle Switch */}
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-950 block">
                  Tampilkan Banner Peringatan di Dashboard Pelanggan
                </span>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  Pengumuman ini akan langsung muncul sebagai banner merah/amber mencolok di bagian paling atas portal seluruh mitra industri terdampak.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={tampilkanBanner}
                onChange={(e) => setTampilkanBanner(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Judul Pengumuman / Info Gangguan *</label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Pemadaman Aliran Air Terjadwal & Perbaikan Pipa Transmisi Utama"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipe Pengumuman</label>
              <select
                value={tipe}
                onChange={(e) => setTipe(e.target.value as TipeInfoPelayanan)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-white font-medium"
              >
                <option value="Pemadaman Aliran Air">Pemadaman Aliran Air</option>
                <option value="Perbaikan Pipa Darurat">Perbaikan Pipa Darurat</option>
                <option value="Pemeliharaan Jaringan">Pemeliharaan Jaringan</option>
                <option value="Flushing Pipa">Flushing Pipa</option>
                <option value="Penyesuaian Tekanan">Penyesuaian Tekanan</option>
                <option value="Pemberitahuan Resmi">Pemberitahuan Resmi</option>
                <option value="Pemberitahuan Tagihan">Pemberitahuan Tagihan</option>
                <option value="Lain-lain">Lain-lain</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tingkat Urgensi</label>
              <select
                value={tingkatUrgensi}
                onChange={(e) => setTingkatUrgensi(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-white font-bold"
              >
                <option value="Darurat" className="text-rose-600">Darurat (Merah Terang)</option>
                <option value="Penting" className="text-amber-600">Penting (Kuning Amber)</option>
                <option value="Info" className="text-blue-600">Info Rutin (Biru)</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Aliran Air</label>
              <select
                value={statusAliran}
                onChange={(e) => setStatusAliran(e.target.value as StatusAliran)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-white font-medium"
              >
                <option value="Pemadaman Sementara Terjadwal">Pemadaman Sementara Terjadwal</option>
                <option value="Penghentian Darurat">Penghentian Darurat</option>
                <option value="Penurunan Tekanan Sementara">Penurunan Tekanan Sementara</option>
                <option value="Terganggu Terjadwal">Terganggu Terjadwal</option>
                <option value="Normal Bertekanan Stabil">Normal Bertekanan Stabil</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jadwal / Waktu Mulai *</label>
              <input
                type="datetime-local"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimasi Selesai (Opsional)</label>
              <input
                type="datetime-local"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Wilayah / Kawasan Industri Terdampak *</label>
            <input
              type="text"
              value={wilayahTerdampak}
              onChange={(e) => setWilayahTerdampak(e.target.value)}
              placeholder="Contoh: Kawasan Industri Jatake, Manis, Cikupa Mas, Balaraja..."
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Uraian & Rincian Pengumuman *</label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan alasan perbaikan, pekerjaan teknis di lapangan, dan estimasi normalisasi pasokan..."
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Himbauan Mitigasi untuk Pabrik / Industri</label>
            <textarea
              rows={2}
              value={solusiMitigasi}
              onChange={(e) => setSolusiMitigasi(e.target.value)}
              placeholder="Contoh: Mohon maksimalkan pengisian ground water tank sebelum pukul 21:00 WIB..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama PIC Lapangan / Petugas</label>
              <input
                type="text"
                value={picNama}
                onChange={(e) => setPicNama(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Kontak / WhatsApp Siaga</label>
              <input
                type="text"
                value={picKontak}
                onChange={(e) => setPicKontak(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
              />
            </div>
          </div>

          {/* Publikasi Toggle */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="statusPublikasi"
              checked={statusPublikasi}
              onChange={(e) => setStatusPublikasi(e.target.checked)}
              className="w-4 h-4 text-cyan-600 rounded border-slate-300"
            />
            <label htmlFor="statusPublikasi" className="font-semibold text-slate-800 cursor-pointer">
              Publikasikan Pengumuman (Langsung Aktif)
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <BellRing className="w-4 h-4" />
              <span>Simpan & Tayangkan Pengumuman</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
