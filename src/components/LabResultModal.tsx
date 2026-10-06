import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FileText,
  Upload,
  CheckCircle2,
  Building2,
  Download,
  RefreshCw,
  Sparkles,
  Droplets,
  Calendar,
  MapPin,
  FileCheck,
  Gauge
} from 'lucide-react';
import { HasilLabHarian, PelangganIndustri, KategoriUjiLab } from '../types';
import { generateOfficialLabPdfDataUrl, downloadPdfBlob } from '../lib/pdfHelper';

export type KategoriLabOption = 'Reservoar IPA' | 'Reservoar Booster' | 'Industri';

interface LabResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<HasilLabHarian, 'id'> & { id?: string }) => Promise<void>;
  initialData?: HasilLabHarian | null;
  pelangganList?: PelangganIndustri[];
  initialKategori?: KategoriLabOption | string;
}

export const LabResultModal: React.FC<LabResultModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  pelangganList = [],
  initialKategori = 'Reservoar IPA'
}) => {
  const [kategori, setKategori] = useState<KategoriLabOption>('Reservoar IPA');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [judulDokumen, setJudulDokumen] = useState('');
  const [lokasiSampling, setLokasiSampling] = useState('');
  const [tanggalUji, setTanggalUji] = useState('');
  const [waktuSampling, setWaktuSampling] = useState('08:00 WIB');
  const [noSertifikat, setNoSertifikat] = useState('');
  const [namaAnalis, setNamaAnalis] = useState('Nurul Hidayati, S.Si (Analis Pengendalian Mutu)');
  const [statusKelayakan, setStatusKelayakan] = useState('MEMENUHI SYARAT (Permenkes No. 2/2023)');
  const [catatan, setCatatan] = useState('');

  // PDF state
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfFilename, setPdfFilename] = useState<string>('');
  const [pdfSize, setPdfSize] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected customer object helper
  const selectedCustomer = pelangganList.find(p => p.id_pelanggan === selectedCustomerId) || pelangganList[0];

  // Initialize or populate form
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const year = new Date().getFullYear();
    const randomSuffix = Date.now().toString().slice(-4);

    if (initialData) {
      let targetKat: KategoriLabOption = 'Reservoar IPA';
      if (initialData.kategori_lab === 'Industri' || initialData.kategori_lab === 'Uji Khusus Pabrik') {
        targetKat = 'Industri';
      } else if (initialData.kategori_lab === 'Reservoar Booster' || initialData.kategori_lab === 'Pompa Booster') {
        targetKat = 'Reservoar Booster';
      } else {
        targetKat = 'Reservoar IPA';
      }

      setKategori(targetKat);
      setSelectedCustomerId(initialData.id_pelanggan_khusus || pelangganList[0]?.id_pelanggan || '');
      setJudulDokumen(initialData.judul_dokumen || '');
      setLokasiSampling(initialData.lokasi_sampling || '');
      setTanggalUji(initialData.tanggal_uji || today);
      setWaktuSampling(initialData.waktu_sampling || '08:00 WIB');
      setNoSertifikat(initialData.no_sertifikat_lab || '');
      setNamaAnalis(initialData.nama_analis_lab || 'Nurul Hidayati, S.Si (Analis Pengendalian Mutu)');
      setStatusKelayakan(initialData.status_kelayakan || 'MEMENUHI SYARAT (Permenkes No. 2/2023)');
      setCatatan(initialData.catatan || '');
      setPdfUrl(initialData.pdf_url || '');
      setPdfFilename(initialData.pdf_filename || 'Dokumen_Hasil_Lab.pdf');
      setPdfSize(initialData.pdf_size || '1.8 MB');
    } else {
      let targetKat: KategoriLabOption = 'Reservoar IPA';
      if (initialKategori === 'Industri' || initialKategori === 'Uji Khusus Pabrik') {
        targetKat = 'Industri';
      } else if (initialKategori === 'Reservoar Booster' || initialKategori === 'Pompa Booster') {
        targetKat = 'Reservoar Booster';
      } else {
        targetKat = 'Reservoar IPA';
      }

      setKategori(targetKat);
      const firstCust = pelangganList[0];
      const custId = firstCust?.id_pelanggan || '';
      setSelectedCustomerId(custId);
      setTanggalUji(today);
      setWaktuSampling('08:30 WIB');
      setNamaAnalis('Nurul Hidayati, S.Si (Analis Pengendalian Mutu)');
      setStatusKelayakan('MEMENUHI SYARAT (Permenkes No. 2/2023)');
      setCatatan('');
      setPdfFilename('');
      setPdfSize('');
      setPdfUrl('');

      if (targetKat === 'Reservoar IPA') {
        setJudulDokumen('Hasil Uji Mutu Air Reservoar IPA Sepatan Tangerang');
        setLokasiSampling('Bak Penampungan & Reservoar Utama IPA Sepatan Tangerang');
        setNoSertifikat(`COA-IPA/AETRA/${year}/${randomSuffix}`);
      } else if (targetKat === 'Reservoar Booster') {
        setJudulDokumen('Hasil Uji Mutu Air Stasiun Pompa Reservoar Booster Tangerang');
        setLokasiSampling('Outlet Discharge Stasiun Reservoar Booster Jatiuwung - Cikupa');
        setNoSertifikat(`COA-BST/AETRA/${year}/${randomSuffix}`);
      } else {
        const cName = firstCust?.nama_perusahaan || 'Mitra Industri';
        setJudulDokumen(`Hasil Uji Mutu Air Industri - ${cName}`);
        setLokasiSampling(`Inlet Sambungan Meter & Fasilitas Pabrik ${cName}`);
        setNoSertifikat(`COA-IND/AETRA/${custId || 'IND'}/${year}-${randomSuffix}`);
      }
    }
    setErrorMessage(null);
  }, [initialData, isOpen, initialKategori, pelangganList]);

  // Handle switching category tab inside modal
  const handleSwitchKategori = (newKat: KategoriLabOption) => {
    setKategori(newKat);
    setErrorMessage(null);
    const today = tanggalUji || new Date().toISOString().split('T')[0];
    const year = new Date().getFullYear();
    const randomSuffix = Date.now().toString().slice(-4);

    if (newKat === 'Reservoar IPA') {
      setJudulDokumen('Hasil Uji Mutu Air Reservoar IPA Sepatan Tangerang');
      setLokasiSampling('Bak Penampungan & Reservoar Utama IPA Sepatan Tangerang');
      setNoSertifikat(`COA-IPA/AETRA/${year}/${randomSuffix}`);
      if (!fileInputRef.current?.value && !initialData) {
        setPdfFilename('');
        setPdfUrl('');
      }
    } else if (newKat === 'Reservoar Booster') {
      setJudulDokumen('Hasil Uji Mutu Air Stasiun Pompa Reservoar Booster Tangerang');
      setLokasiSampling('Outlet Discharge Stasiun Reservoar Booster Jatiuwung - Cikupa');
      setNoSertifikat(`COA-BST/AETRA/${year}/${randomSuffix}`);
      if (!fileInputRef.current?.value && !initialData) {
        setPdfFilename('');
        setPdfUrl('');
      }
    } else {
      const cName = selectedCustomer?.nama_perusahaan || 'Mitra Industri';
      setJudulDokumen(`Hasil Uji Mutu Air Industri - ${cName}`);
      setLokasiSampling(`Inlet Sambungan Meter & Fasilitas Pabrik ${cName}`);
      setNoSertifikat(`COA-IND/AETRA/${selectedCustomerId || 'IND'}/${year}-${randomSuffix}`);
      if (!fileInputRef.current?.value && !initialData) {
        setPdfFilename('');
        setPdfUrl('');
      }
    }
  };

  // Handle customer change for personalized industrial lab
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const cust = pelangganList.find(p => p.id_pelanggan === customerId);
    if (cust && kategori === 'Industri') {
      const year = new Date().getFullYear();
      const randomSuffix = Date.now().toString().slice(-4);
      setJudulDokumen(`Hasil Uji Mutu Air Industri - ${cust.nama_perusahaan}`);
      setLokasiSampling(`Inlet Sambungan Meter & Fasilitas Pabrik ${cust.nama_perusahaan}`);
      setNoSertifikat(`COA-IND/AETRA/${cust.id_pelanggan}/${year}-${randomSuffix}`);
    }
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setPdfFilename(file.name);
    setPdfSize(`${sizeInMb} MB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPdfUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    setErrorMessage(null);
  };

  const handleUseOfficialTemplate = () => {
    const today = tanggalUji || new Date().toISOString().split('T')[0];
    const isInd = kategori === 'Industri';
    const isBooster = kategori === 'Reservoar Booster';
    const companyName = isInd ? (selectedCustomer?.nama_perusahaan || 'Mitra Industri Aetra') : undefined;

    const certPrefix = isInd ? `COA-IND/AETRA/${selectedCustomerId}` : (isBooster ? 'COA-BST/AETRA' : 'COA-IPA/AETRA');
    const certNumber = noSertifikat || `${certPrefix}/${Date.now().toString().slice(-6)}`;
    const title = judulDokumen || (isInd ? `Hasil Uji Mutu Air Industri - ${companyName}` : (isBooster ? 'Hasil Uji Mutu Air Stasiun Pompa Reservoar Booster' : 'Hasil Uji Mutu Air Reservoar IPA Sepatan Tangerang'));
    const location = lokasiSampling || (isInd ? `Inlet Sambungan Meter & Fasilitas Pabrik ${companyName}` : (isBooster ? 'Outlet Discharge Stasiun Reservoar Booster' : 'Bak Penampungan & Reservoar Utama IPA Sepatan'));

    const generatedUrl = generateOfficialLabPdfDataUrl(
      title,
      certNumber,
      kategori,
      today,
      location,
      companyName,
      statusKelayakan || 'MEMENUHI SYARAT (Permenkes No. 2/2023)',
      namaAnalis || 'Nurul Hidayati, S.Si (Analis Pengendalian Mutu)'
    );

    setPdfUrl(generatedUrl);
    if (isInd && companyName) {
      setPdfFilename(`Laporan_Uji_Lab_Industri_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${today}.pdf`);
    } else if (isBooster) {
      setPdfFilename(`Laporan_Uji_Lab_Reservoar_Booster_${today}.pdf`);
    } else {
      setPdfFilename(`Laporan_Uji_Lab_Reservoar_IPA_Sepatan_${today}.pdf`);
    }
    setPdfSize('1.6 MB');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (kategori === 'Industri' && !selectedCustomerId) {
      setErrorMessage('Harap pilih industri / pelanggan yang dituju (wajib).');
      return;
    }

    if (!judulDokumen.trim()) {
      setErrorMessage('Judul dokumen laporan lab wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const today = tanggalUji || new Date().toISOString().split('T')[0];
      const isInd = kategori === 'Industri';
      const isBooster = kategori === 'Reservoar Booster';
      const companyName = isInd ? selectedCustomer?.nama_perusahaan : undefined;

      const certPrefix = isInd ? `COA-IND/AETRA/${selectedCustomerId}` : (isBooster ? 'COA-BST/AETRA' : 'COA-IPA/AETRA');
      const certNumber = noSertifikat || `${certPrefix}/${Date.now().toString().slice(-6)}`;
      const location = lokasiSampling || (isInd ? `Inlet Sambungan Meter Fasilitas Pabrik ${companyName}` : (isBooster ? 'Outlet Discharge Stasiun Reservoar Booster' : 'Bak Penampungan & Reservoar Utama IPA Sepatan'));

      // If no file uploaded manually yet, automatically generate official signed PDF data URL fallback
      const finalPdfUrl = pdfUrl || generateOfficialLabPdfDataUrl(
        judulDokumen,
        certNumber,
        kategori,
        today,
        location,
        companyName,
        statusKelayakan,
        namaAnalis
      );

      let defaultFilename = `Laporan_Uji_Lab_Reservoar_IPA_Sepatan_${today}.pdf`;
      if (isInd) {
        defaultFilename = `Laporan_Uji_Lab_Industri_${companyName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Mitra'}_${today}.pdf`;
      } else if (isBooster) {
        defaultFilename = `Laporan_Uji_Lab_Reservoar_Booster_${today}.pdf`;
      }

      await onSave({
        id: initialData?.id,
        judul_dokumen: judulDokumen,
        kategori_lab: kategori as KategoriUjiLab,
        id_pelanggan_khusus: isInd ? selectedCustomerId : undefined,
        nama_perusahaan_khusus: isInd ? companyName : undefined,
        tanggal_uji: today,
        waktu_sampling: waktuSampling || '08:00 WIB',
        lokasi_sampling: location,
        nama_analis_lab: namaAnalis,
        no_sertifikat_lab: certNumber,
        status_kelayakan: statusKelayakan,
        pdf_url: finalPdfUrl,
        pdf_filename: pdfFilename || defaultFilename,
        pdf_size: pdfSize || '1.6 MB',
        catatan: catatan.trim() || undefined
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Gagal menyimpan dokumen hasil uji lab.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold">
                  {initialData
                    ? `Edit Berkas PDF: Hasil Uji Lab ${kategori}`
                    : `Upload Berkas PDF: Hasil Uji Lab ${kategori}`}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Dapat Diunggah Semua Akun Staf
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {kategori === 'Reservoar IPA' && 'Pengujian mutu air bak penampungan & instalasi utama Reservoar IPA Sepatan'}
                {kategori === 'Reservoar Booster' && 'Pengujian mutu air outlet stasiun pompa penampungan booster jaringan distribusi'}
                {kategori === 'Industri' && 'Pengujian mutu air khusus yang ditujukan pada mitra industri tertentu (Personalized)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* 1. TIGA PILIHAN KATEGORI UJI LAB */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Pilih Jenis Dokumen Hasil Uji Lab (3 Jenis Dokumen):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => handleSwitchKategori('Reservoar IPA')}
                className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  kategori === 'Reservoar IPA'
                    ? 'bg-white text-cyan-800 shadow-sm border border-slate-200 ring-2 ring-cyan-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Droplets className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span>1. Reservoar IPA</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchKategori('Reservoar Booster')}
                className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  kategori === 'Reservoar Booster'
                    ? 'bg-white text-blue-800 shadow-sm border border-slate-200 ring-2 ring-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Gauge className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>2. Reservoar Booster</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchKategori('Industri')}
                className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  kategori === 'Industri'
                    ? 'bg-white text-indigo-800 shadow-sm border border-slate-200 ring-2 ring-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>3. Industri (Personalized)</span>
              </button>
            </div>
          </div>

          {/* 2. PILIH INDUSTRI / PELANGGAN YANG DITUJU (HANYA MUNCUL JIKA KATEGORI INDUSTRI) */}
          {kategori === 'Industri' && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-indigo-950">
                  Pilih Industri / Pelanggan yang Dituju <span className="text-rose-600 font-bold">* (Wajib)</span>
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Personalized
                </span>
              </div>

              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-indigo-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
              >
                {pelangganList.map((p) => (
                  <option key={p.id_pelanggan} value={p.id_pelanggan}>
                    [{p.id_pelanggan}] {p.nama_perusahaan} — ({p.bidang_usaha})
                  </option>
                ))}
              </select>

              <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                Dokumen hasil uji lab ini hanya dapat dilihat dan diunduh oleh mitra industri <strong>{selectedCustomer?.nama_perusahaan}</strong> pada portal mandiri mereka.
              </p>
            </div>
          )}

          {/* 3. INFORMASI DOKUMEN & TITIK SAMPLING (SAMA UNTUK RESERVOAR IPA & RESERVOAR BOOSTER) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul Dokumen Laporan Lab <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={judulDokumen}
                onChange={(e) => setJudulDokumen(e.target.value)}
                required
                placeholder={
                  kategori === 'Reservoar IPA'
                    ? 'Hasil Uji Mutu Air Reservoar IPA Sepatan Tangerang'
                    : kategori === 'Reservoar Booster'
                    ? 'Hasil Uji Mutu Air Stasiun Pompa Reservoar Booster'
                    : 'Hasil Uji Mutu Air Industri'
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Uji Mutu Air <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tanggalUji}
                onChange={(e) => setTanggalUji(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Waktu Sampling
              </label>
              <input
                type="text"
                value={waktuSampling}
                onChange={(e) => setWaktuSampling(e.target.value)}
                placeholder="08:30 WIB"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lokasi / Titik Sampling <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={lokasiSampling}
                onChange={(e) => setLokasiSampling(e.target.value)}
                required
                placeholder="Titik lokasi pengambilan sampel air"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Kelayakan Mutu
              </label>
              <select
                value={statusKelayakan}
                onChange={(e) => setStatusKelayakan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-800 focus:bg-white focus:outline-none focus:border-cyan-600"
              >
                <option value="MEMENUHI SYARAT (Permenkes No. 2/2023)">MEMENUHI SYARAT (Permenkes No. 2/2023)</option>
                <option value="MEMENUHI SYARAT (Grade Industri Pangan)">MEMENUHI SYARAT (Grade Industri Pangan)</option>
                <option value="DALAM PENYESUAIAN DESINFEKSI">DALAM PENYESUAIAN DESINFEKSI</option>
              </select>
            </div>
          </div>

          {/* 4. UPLOAD FILE DOKUMEN PDF (WAJIB) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Upload Berkas PDF Dokumen Lab <span className="text-rose-500">* (Wajib)</span>
              </label>
              <span className="text-[10px] text-slate-500">Format file .pdf</span>
            </div>

            <div className={`p-5 rounded-2xl border-2 border-dashed transition-colors flex flex-col items-center justify-center text-center ${
              kategori === 'Industri'
                ? 'border-indigo-300 hover:border-indigo-500 bg-indigo-50/20'
                : kategori === 'Reservoar Booster'
                ? 'border-blue-300 hover:border-blue-500 bg-blue-50/20'
                : 'border-cyan-300 hover:border-cyan-500 bg-cyan-50/20'
            }`}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-xs ${
                kategori === 'Industri'
                  ? 'bg-indigo-100 text-indigo-700'
                  : kategori === 'Reservoar Booster'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-cyan-100 text-cyan-700'
              }`}>
                <FileText className="w-6 h-6" />
              </div>

              {pdfFilename ? (
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate max-w-xs">{pdfFilename}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Ukuran berkas: {pdfSize || '1.6 MB'}</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800">
                    {kategori === 'Reservoar IPA' && 'Pilih berkas PDF hasil pengujian Reservoar IPA Sepatan'}
                    {kategori === 'Reservoar Booster' && 'Pilih berkas PDF hasil pengujian Reservoar Booster'}
                    {kategori === 'Industri' && `Pilih berkas PDF hasil pengujian industri untuk ${selectedCustomer?.nama_perusahaan || 'Mitra'}`}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Unggah file PDF mandiri atau gunakan generator PDF resmi Aetra
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{pdfFilename ? 'Ganti File PDF' : 'Pilih Berkas PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleUseOfficialTemplate}
                  className={`px-3.5 py-1.5 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                    kategori === 'Industri'
                      ? 'bg-indigo-600 hover:bg-indigo-500'
                      : kategori === 'Reservoar Booster'
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : 'bg-cyan-600 hover:bg-cyan-500'
                  }`}
                  title="Gunakan format template resmi PDF laboratorium Aetra"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Gunakan Format PDF Resmi Aetra</span>
                </button>

                {pdfUrl && (
                  <button
                    type="button"
                    onClick={() => downloadPdfBlob(pdfUrl, pdfFilename || 'Dokumen_Uji_Lab.pdf')}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Preview</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 5. CATATAN / KETERANGAN TAMBAHAN (OPSIONAL) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan / Rekomendasi Hasil Lab <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan hasil uji laboratorium atau himbauan teknis (opsional)..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
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
              className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                kategori === 'Industri'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500'
                  : kategori === 'Reservoar Booster'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
              }`}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Dokumen PDF...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan & Terbitkan PDF Lab</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
