import React, { useState, useEffect } from 'react';
import { X, Building2, KeyRound } from 'lucide-react';
import { PelangganIndustri } from '../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PelangganIndustri) => Promise<void>;
  initialData?: PelangganIndustri | null;
  existingIds: string[];
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingIds
}) => {
  const [idPelanggan, setIdPelanggan] = useState('');
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [bidangUsaha, setBidangUsaha] = useState('');
  const [alamatKawasan, setAlamatKawasan] = useState('');
  const [zonaDistribusi, setZonaDistribusi] = useState('Zona Cikupa - Balaraja (IPA Cikokol)');
  const [picNama, setPicNama] = useState('');
  const [picTelepon, setPicTelepon] = useState('');
  const [email, setEmail] = useState('');
  const [noMeter, setNoMeter] = useState('');
  const [password, setPassword] = useState('aetra123');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setIdPelanggan(initialData.id_pelanggan);
      setNamaPerusahaan(initialData.nama_perusahaan);
      setBidangUsaha(initialData.bidang_usaha);
      setAlamatKawasan(initialData.alamat_kawasan);
      setZonaDistribusi(initialData.zona_distribusi);
      setPicNama(initialData.pic_nama);
      setPicTelepon(initialData.pic_telepon);
      setEmail(initialData.email || '');
      setNoMeter(initialData.no_meter);
      setPassword(initialData.password || 'aetra123');
    } else {
      const nextNum = existingIds.length + 1;
      const formattedNum = String(nextNum).padStart(3, '0');
      setIdPelanggan(`AETRA-IND-${formattedNum}`);
      setNamaPerusahaan('');
      setBidangUsaha('');
      setAlamatKawasan('');
      setPicNama('');
      setPicTelepon('');
      setEmail('');
      setNoMeter(`MTR-TGR-${Math.floor(10000 + Math.random() * 90000)}`);
      setPassword('aetra123');
    }
  }, [initialData, existingIds, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPelanggan || !namaPerusahaan) return;
    setSubmitting(true);
    try {
      await onSave({
        id_pelanggan: idPelanggan.trim().toUpperCase(),
        nama_perusahaan: namaPerusahaan.trim(),
        bidang_usaha: bidangUsaha.trim(),
        alamat_kawasan: alamatKawasan.trim(),
        zona_distribusi: zonaDistribusi,
        pic_nama: picNama.trim(),
        pic_telepon: picTelepon.trim(),
        email: email.trim(),
        no_meter: noMeter.trim(),
        password: password.trim() || 'aetra123',
        status_aktif: true
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data pelanggan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">
                {initialData ? 'Edit Data Pelanggan Industri' : 'Registrasi Mitra Industri Baru'}
              </h2>
              <p className="text-xs text-slate-400">Master data akun industri & akun login portal mandiri</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Identitas Perusahaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                ID Pelanggan (Otomatis/Kustom) *
              </label>
              <input
                type="text"
                required
                value={idPelanggan}
                onChange={(e) => setIdPelanggan(e.target.value)}
                placeholder="AETRA-IND-001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono font-bold uppercase bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Nama Perusahaan / Pabrik *
              </label>
              <input
                type="text"
                required
                value={namaPerusahaan}
                onChange={(e) => setNamaPerusahaan(e.target.value)}
                placeholder="PT Indofood CBP Sukses Makmur Tbk"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Password Portal Pelanggan */}
          <div className="p-3.5 bg-cyan-50/80 rounded-xl border border-cyan-200">
            <div className="flex items-center gap-1.5 text-cyan-900 font-bold mb-1">
              <KeyRound className="w-4 h-4 text-cyan-600" />
              <span>Kata Sandi Akses Portal Pelanggan *</span>
            </div>
            <p className="text-[11px] text-slate-600 mb-2">
              Digunakan oleh PIC pelanggan industri untuk login ke halaman portal mandiri.
            </p>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contoh: indofood123"
              className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono bg-white text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sektor / Bidang Usaha</label>
              <input
                type="text"
                value={bidangUsaha}
                onChange={(e) => setBidangUsaha(e.target.value)}
                placeholder="Industri Makanan & Minuman"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Zona Distribusi Air</label>
              <select
                value={zonaDistribusi}
                onChange={(e) => setZonaDistribusi(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
              >
                <option value="Zona Cikupa - Balaraja (IPA Cikokol)">Zona Cikupa - Balaraja (IPA Cikokol)</option>
                <option value="Zona Jatake - Pasar Kemis (IPA Sepatan)">Zona Jatake - Pasar Kemis (IPA Sepatan)</option>
                <option value="Zona Manis - Jatake">Zona Manis - Jatake</option>
                <option value="Zona Jatiuwung Barat (Booster Station)">Zona Jatiuwung Barat (Booster Station)</option>
                <option value="Zona Balaraja Barat">Zona Balaraja Barat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alamat Kawasan Industri</label>
            <input
              type="text"
              value={alamatKawasan}
              onChange={(e) => setAlamatKawasan(e.target.value)}
              placeholder="Kawasan Industri Cikupa Mas Blok A2 No. 8, Tangerang"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Kontak PIC & No Meter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama PIC Pabrik</label>
              <input
                type="text"
                value={picNama}
                onChange={(e) => setPicNama(e.target.value)}
                placeholder="Ir. Budi Santoso"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp/HP PIC</label>
              <input
                type="text"
                value={picTelepon}
                onChange={(e) => setPicTelepon(e.target.value)}
                placeholder="+62 812-8890-1122"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Resmi Korporat</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utility@perusahaan.co.id"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nomor Seri Meter Fisik</label>
            <input
              type="text"
              value={noMeter}
              onChange={(e) => setNoMeter(e.target.value)}
              placeholder="MTR-CKP-00918"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Data Pelanggan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
