import React, { useState, useEffect } from 'react';
import { X, FlaskConical, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { HasilLabHarian } from '../types';

interface LabResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<HasilLabHarian, 'id'> & { id?: string }) => Promise<void>;
  initialData?: HasilLabHarian | null;
}

export const LabResultModal: React.FC<LabResultModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [tanggalUji, setTanggalUji] = useState(new Date().toISOString().split('T')[0]);
  const [waktuSampling, setWaktuSampling] = useState('08:00 WIB');
  const [lokasiSampling, setLokasiSampling] = useState('Offtake Jaringan Utama Kawasan Industri Cikupa & Jatake');
  const [ph, setPh] = useState<number>(7.3);
  const [kekeruhan, setKekeruhan] = useState<number>(0.38);
  const [sisaKhlor, setSisaKhlor] = useState<number>(0.35);
  const [tds, setTds] = useState<number>(145);
  const [suhu, setSuhu] = useState<number>(27.2);
  const [eColi, setEColi] = useState<number>(0);
  const [rasaBau, setRasaBau] = useState('Tidak Berbau & Normal');
  const [namaAnalis, setNamaAnalis] = useState('Nurul Hidayati, S.Si (QC Analyst)');
  const [noSertifikat, setNoSertifikat] = useState('');
  const [catatan, setCatatan] = useState('Seluruh parameter uji memenuhi baku mutu air minum Permenkes RI.');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTanggalUji(initialData.tanggal_uji);
      setWaktuSampling(initialData.waktu_sampling);
      setLokasiSampling(initialData.lokasi_sampling);
      setPh(initialData.ph);
      setKekeruhan(initialData.kekeruhan_ntu);
      setSisaKhlor(initialData.sisa_khlor_mg_l);
      setTds(initialData.tds_mg_l);
      setSuhu(initialData.suhu_celsius);
      setEColi(initialData.e_coli_cfu);
      setRasaBau(initialData.rasa_bau);
      setNamaAnalis(initialData.nama_analis_lab);
      setNoSertifikat(initialData.no_sertifikat_lab);
      setCatatan(initialData.catatan || '');
    } else {
      const randomCertSuffix = Math.floor(1000 + Math.random() * 9000);
      setNoSertifikat(`QA-AETRA/TGR/2026/09-${randomCertSuffix}`);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Validation rules based on Permenkes No. 2/2023
  const isPhValid = ph >= 6.5 && ph <= 8.5;
  const isKekeruhanValid = kekeruhan <= 3.0;
  const isSisaKhlorValid = sisaKhlor >= 0.2 && sisaKhlor <= 0.5;
  const isTdsValid = tds <= 300;
  const isEColiValid = eColi === 0;

  const allCompliant = isPhValid && isKekeruhanValid && isSisaKhlorValid && isTdsValid && isEColiValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const statusKelayakan = allCompliant
        ? 'MEMENUHI SYARAT (Permenkes No. 2/2023)'
        : 'PERLU PENYESUAIAN DOSIS (QC Alert)';

      await onSave({
        id: initialData?.id,
        tanggal_uji: tanggalUji,
        waktu_sampling: waktuSampling,
        lokasi_sampling: lokasiSampling,
        ph: Number(ph),
        kekeruhan_ntu: Number(kekeruhan),
        sisa_khlor_mg_l: Number(sisaKhlor),
        tds_mg_l: Number(tds),
        suhu_celsius: Number(suhu),
        e_coli_cfu: Number(eColi),
        rasa_bau: rasaBau,
        status_kelayakan: statusKelayakan,
        nama_analis_lab: namaAnalis,
        no_sertifikat_lab: noSertifikat,
        catatan: catatan
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan hasil uji lab.');
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
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">
                {initialData ? 'Edit Hasil Uji Lab Kualitas Air' : 'Input Hasil Pengujian Lab Kualitas Air Harian'}
              </h2>
              <p className="text-xs text-slate-400">Standar Pengujian Permenkes RI No. 2 Tahun 2023</p>
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
          {/* Compliance Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-3 ${
              allCompliant
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            {allCompliant ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div className="text-xs">
              <p className="font-bold">
                {allCompliant
                  ? 'Status Baku Mutu: MEMENUHI SYARAT KEMENKES (100% LAYAK)'
                  : 'Peringatan: Terdapat Parameter Di Luar Rentang Ideal'}
              </p>
              <p className="text-[11px] opacity-90">
                Sistem secara otomatis memverifikasi batas acuan Standar Kualitas Air Minum Permenkes No. 2/2023.
              </p>
            </div>
          </div>

          {/* Sampling Meta */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Uji *</label>
              <input
                type="date"
                value={tanggalUji}
                onChange={(e) => setTanggalUji(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Waktu Sampling</label>
              <input
                type="text"
                value={waktuSampling}
                onChange={(e) => setWaktuSampling(e.target.value)}
                placeholder="08:00 WIB"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. Sertifikat Uji *</label>
              <input
                type="text"
                value={noSertifikat}
                onChange={(e) => setNoSertifikat(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono font-medium"
              />
            </div>
          </div>

          {/* Sampling Location */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Titik / Lokasi Pengambilan Sampel *</label>
            <input
              type="text"
              value={lokasiSampling}
              onChange={(e) => setLokasiSampling(e.target.value)}
              placeholder="Contoh: Offtake Jaringan Utama Kawasan Industri Cikupa & Jatake"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Critical Parameters */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              Parameter Kualitas Air Kimia & Fisika
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {/* pH */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Derajat Keasaman (pH)</label>
                  <span className="text-[10px] text-slate-500">6.5 - 8.5</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={ph}
                  onChange={(e) => setPh(Number(e.target.value))}
                  required
                  className={`w-full px-3 py-2 border rounded-lg font-mono text-xs ${
                    isPhValid ? 'border-slate-300 focus:ring-cyan-500' : 'border-amber-400 bg-amber-50'
                  }`}
                />
              </div>

              {/* Turbidity */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Kekeruhan (NTU)</label>
                  <span className="text-[10px] text-slate-500">&lt; 3.0 NTU</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={kekeruhan}
                  onChange={(e) => setKekeruhan(Number(e.target.value))}
                  required
                  className={`w-full px-3 py-2 border rounded-lg font-mono text-xs ${
                    isKekeruhanValid ? 'border-slate-300 focus:ring-cyan-500' : 'border-amber-400 bg-amber-50'
                  }`}
                />
              </div>

              {/* Free Chlorine */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Sisa Khlor (mg/L)</label>
                  <span className="text-[10px] text-slate-500">0.2 - 0.5 mg/L</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={sisaKhlor}
                  onChange={(e) => setSisaKhlor(Number(e.target.value))}
                  required
                  className={`w-full px-3 py-2 border rounded-lg font-mono text-xs ${
                    isSisaKhlorValid ? 'border-slate-300 focus:ring-cyan-500' : 'border-amber-400 bg-amber-50'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {/* TDS */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">TDS (mg/L)</label>
                  <span className="text-[10px] text-slate-500">&lt; 300 mg/L</span>
                </div>
                <input
                  type="number"
                  value={tds}
                  onChange={(e) => setTds(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              {/* Suhu */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Suhu Sampel (°C)</label>
                  <span className="text-[10px] text-slate-500">± 3°C</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={suhu}
                  onChange={(e) => setSuhu(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              {/* E. Coli */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">E. Coli (CFU/100ml)</label>
                  <span className="text-[10px] text-slate-500">0 (Nihil)</span>
                </div>
                <input
                  type="number"
                  value={eColi}
                  onChange={(e) => setEColi(Number(e.target.value))}
                  required
                  className={`w-full px-3 py-2 border rounded-lg font-mono text-xs ${
                    isEColiValid ? 'border-slate-300' : 'border-rose-400 bg-rose-50'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Rasa Bau & Analis */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rasa & Bau Organoleptik</label>
              <input
                type="text"
                value={rasaBau}
                onChange={(e) => setRasaBau(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Petugas / Analis Kimia Lab *</label>
              <input
                type="text"
                value={namaAnalis}
                onChange={(e) => setNamaAnalis(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Catatan Analisa */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Analis Laboratorium</label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
            />
          </div>

          {/* Action Buttons */}
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
              {submitting ? 'Menyimpan...' : 'Publikasikan Hasil Uji Lab'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
