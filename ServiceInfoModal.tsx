import React, { useState, useEffect } from 'react';
import { X, BellRing, Info } from 'lucide-react';
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
    } else {
      setJudul('');
      setDeskripsi('');
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
        status_publikasi: statusPublikasi
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">
                {initialData ? 'Edit Informasi Pelayanan' : 'Input Informasi Pelayanan & Gangguan Jaringan'}
              </h2>
              <p className="text-xs text-slate-400">Pemberitahuan resmi untuk pelanggan industri</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Judul Informasi / Pengumuman *</label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Pemeliharaan Booster Pump & Pencucian Pipa Transmisi DN 500"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Pelayanan</label>
              <select
                value={tipe}
                onChange={(e) => setTipe(e.target.value as TipeInfoPelayanan)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
              >
                <option value="Pemeliharaan Jaringan">Pemeliharaan Jaringan</option>
                <option value="Flushing Pipa">Flushing Pipa</option>
                <option value="Penyesuaian Tekanan">Penyesuaian Tekanan</option>
                <option value="Pemberitahuan Resmi">Pemberitahuan Resmi</option>
                <option value="Pemberitahuan Tagihan">Pemberitahuan Tagihan</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tingkat Urgensi</label>
              <select
                value={tingkatUrgensi}
                onChange={(e) => setTingkatUrgensi(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white font-medium"
              >
                <option value="Normal">Normal</option>
                <option value="Info">Info Rutin</option>
                <option value="Penting">Penting (Wajib Diperhatikan)</option>
                <option value="Darurat">Darurat</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Aliran Air</label>
              <select
                value={statusAliran}
                onChange={(e) => setStatusAliran(e.target.value as StatusAliran)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white font-medium"
              >
                <option value="Normal Bertekanan Stabil">Normal Bertekanan Stabil</option>
                <option value="Penurunan Tekanan Sementara">Penurunan Tekanan Sementara</option>
                <option value="Terganggu Terjadwal">Terganggu Terjadwal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jadwal Mulai *</label>
              <input
                type="datetime-local"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimasi Selesai (Opsional)</label>
              <input
                type="datetime-local"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Wilayah / Kawasan Industri Terdampak *</label>
            <input
              type="text"
              value={wilayahTerdampak}
              onChange={(e) => setWilayahTerdampak(e.target.value)}
              placeholder="Kawasan Industri Jatake, Manis, Cikupa Mas, Balaraja..."
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Uraian & Kronologis Info *</label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan detail pekerjaan, tujuan teknis, dan jam-jam pengerjaan..."
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Solusi Mitigasi & Langkah Pelanggan</label>
            <input
              type="text"
              value={solusiMitigasi}
              onChange={(e) => setSolusiMitigasi(e.target.value)}
              placeholder="Contoh: Mengisi ground tank penuh, atau meminta armada tangki darurat..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama PIC Aetra</label>
              <input
                type="text"
                value={picNama}
                onChange={(e) => setPicNama(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Kontak / WhatsApp</label>
              <input
                type="text"
                value={picKontak}
                onChange={(e) => setPicKontak(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="publikasi"
              checked={statusPublikasi}
              onChange={(e) => setStatusPublikasi(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
            />
            <label htmlFor="publikasi" className="font-semibold text-slate-800">
              Langsung Publikasikan ke Portal Pelanggan Industri
            </label>
          </div>

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
              className="px-5 py-2 text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Informasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
