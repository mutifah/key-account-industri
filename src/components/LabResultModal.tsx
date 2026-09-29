import React, { useState, useEffect, useRef } from 'react';
import {
  X as CloseIcon,
  FileText as FileTextIcon,
  Upload as UploadIcon,
  CheckCircle2 as CheckCircleIcon,
  Building2 as BuildingIcon,
  Download as DownloadIcon,
  RefreshCw as RefreshIcon,
  Sparkles as SparklesIcon,
  Droplets as DropletsIcon,
  FileCheck as FileCheckIcon,
  Trash2 as TrashIcon
} from 'lucide-react';
import { HasilLabHarian, PelangganIndustri, KategoriUjiLab } from '../types';
import { generateOfficialLabPdfDataUrl, downloadPdfBlob } from '../lib/pdfHelper';

interface LabResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<HasilLabHarian, 'id'> & { id?: string }) => Promise<void>;
  initialData?: HasilLabHarian | null;
  pelangganList?: PelangganIndustri[];
  initialKategori?: 'Reservoar' | 'Industri';
}

export const LabResultModal: React.FC<LabResultModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  pelangganList = [],
  initialKategori = 'Reservoar'
}) => {
  // 2 Pilihan Kategori: Reservoar & Industri
  const [kategori, setKategori] = useState<'Reservoar' | 'Industri'>('Reservoar');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Berkas PDF
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfFilename, setPdfFilename] = useState<string>('');
  const [pdfSize, setPdfSize] = useState<string>('');

  // Catatan / Rekomendasi (Opsional)
  const [catatan, setCatatan] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected customer helper
  const selectedCustomer =
    pelangganList.find((p) => p.id_pelanggan === selectedCustomerId) || pelangganList[0];

  // Initialize data on open
  useEffect(() => {
    if (initialData) {
      const isInd =
        initialData.kategori_lab === 'Industri' ||
        initialData.kategori_lab === 'Uji Khusus Pabrik';
      setKategori(isInd ? 'Industri' : 'Reservoar');
      setSelectedCustomerId(
        initialData.id_pelanggan_khusus || pelangganList[0]?.id_pelanggan || ''
      );
      setCatatan(initialData.catatan || '');
      setPdfUrl(initialData.pdf_url || '');
      setPdfFilename(initialData.pdf_filename || 'Dokumen_Hasil_Lab.pdf');
      setPdfSize(initialData.pdf_size || '1.8 MB');
    } else {
      setKategori(initialKategori || 'Reservoar');
      const firstCust = pelangganList[0];
      setSelectedCustomerId(firstCust?.id_pelanggan || '');
      setCatatan('');
      setPdfFilename('');
      setPdfSize('');
      setPdfUrl('');
    }
    setErrorMessage(null);
  }, [initialData, isOpen, initialKategori, pelangganList]);

  if (!isOpen) return null;

  // Process chosen file
  const processPdfFile = (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Format berkas harus berupa file PDF (.pdf)');
      return;
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processPdfFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processPdfFile(file);
    }
  };

  const handleRemoveFile = () => {
    setPdfUrl('');
    setPdfFilename('');
    setPdfSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate fallback official template PDF if user clicks it
  const handleUseOfficialTemplate = () => {
    const today = new Date().toISOString().split('T')[0];
    const year = new Date().getFullYear();
    const randomSuffix = Date.now().toString().slice(-4);
    const isInd = kategori === 'Industri';
    const companyName = isInd ? selectedCustomer?.nama_perusahaan : undefined;
    const certNumber = isInd
      ? `COA-IND/AETRA/${selectedCustomerId || 'IND'}/${year}-${randomSuffix}`
      : `COA-RES/AETRA/${year}/${randomSuffix}`;
    const title = isInd
      ? `Hasil Uji Mutu Air Industri - ${companyName || 'Mitra Industri'}`
      : 'Hasil Uji Mutu Air Reservoar IPA Sepatan Tangerang';
    const location = isInd
      ? `Inlet Sambungan Meter Fasilitas Pabrik ${companyName || 'Mitra Industri'}`
      : 'Bak Penampungan & Reservoar Utama IPA Sepatan Tangerang';

    const generatedUrl = generateOfficialLabPdfDataUrl(
      title,
      certNumber,
      kategori,
      today,
      location,
      companyName,
      'MEMENUHI SYARAT (Permenkes No. 2/2023)',
      'Nurul Hidayati, S.Si (Analis Pengendalian Mutu)'
    );

    setPdfUrl(generatedUrl);
    setPdfFilename(
      isInd && companyName
        ? `Laporan_Uji_Lab_Industri_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${today}.pdf`
        : `Laporan_Uji_Lab_Reservoar_Sepatan_${today}.pdf`
    );
    setPdfSize('1.6 MB');
    setErrorMessage(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (kategori === 'Industri' && !selectedCustomerId) {
      setErrorMessage('Harap pilih industri / mitra pelanggan yang dituju.');
      return;
    }

    setSubmitting(true);
    try {
      const today = initialData?.tanggal_uji || new Date().toISOString().split('T')[0];
      const year = new Date().getFullYear();
      const randomSuffix = Date.now().toString().slice(-4);
      const isInd = kategori === 'Industri';
      const companyName = isInd ? selectedCustomer?.nama_perusahaan : undefined;

      const certNumber =
        initialData?.no_sertifikat_lab ||
        (isInd
          ? `COA-IND/AETRA/${selectedCustomerId || 'IND'}/${year}-${randomSuffix}`
          : `COA-RES/AETRA/${year}/${randomSuffix}`);

      const title =
        initialData?.judul_dokumen ||
        (isInd
          ? `Hasil Uji Mutu Air Industri - ${companyName || 'Mitra Industri'}`
          : 'Hasil Uji Mutu Air Reservoar IPA Sepatan Tangerang');

      const location =
        initialData?.lokasi_sampling ||
        (isInd
          ? `Inlet Sambungan Meter Fasilitas Pabrik ${companyName || 'Mitra Industri'}`
          : 'Bak Penampungan & Reservoar Utama IPA Sepatan Tangerang');

      // If user hasn't uploaded a PDF manually, automatically generate official signed template
      const finalPdfUrl =
        pdfUrl ||
        generateOfficialLabPdfDataUrl(
          title,
          certNumber,
          kategori,
          today,
          location,
          companyName,
          initialData?.status_kelayakan || 'MEMENUHI SYARAT (Permenkes No. 2/2023)',
          initialData?.nama_analis_lab || 'Nurul Hidayati, S.Si (Analis Pengendalian Mutu)'
        );

      const defaultFilename = isInd
        ? `Laporan_Uji_Lab_Industri_${companyName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Mitra'}_${today}.pdf`
        : `Laporan_Uji_Lab_Reservoar_Sepatan_${today}.pdf`;

      await onSave({
        id: initialData?.id,
        judul_dokumen: title,
        kategori_lab: kategori as KategoriUjiLab,
        id_pelanggan_khusus: isInd ? selectedCustomerId : undefined,
        nama_perusahaan_khusus: isInd ? companyName : undefined,
        tanggal_uji: today,
        waktu_sampling: initialData?.waktu_sampling || '08:00 WIB',
        lokasi_sampling: location,
        nama_analis_lab:
          initialData?.nama_analis_lab || 'Nurul Hidayati, S.Si (Analis Pengendalian Mutu)',
        no_sertifikat_lab: certNumber,
        status_kelayakan:
          initialData?.status_kelayakan || 'MEMENUHI SYARAT (Permenkes No. 2/2023)',
        pdf_url: finalPdfUrl,
        pdf_filename: pdfFilename || defaultFilename,
        pdf_size: pdfSize || '1.6 MB',
        catatan: catatan.trim() || undefined
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Gagal menyimpan berkas dokumen hasil uji lab.');
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
              <FileCheckIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {initialData ? 'Edit Berkas PDF Hasil Uji Lab' : 'Upload Berkas PDF Hasil Uji Lab'}
              </h2>
              <p className="text-xs text-slate-400">
                Pilih opsi pengujian (Reservoir atau Industri), unggah berkas PDF, serta tambahkan catatan bila ada.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* 1. DUA OPSI: RESERVOIR & INDUSTRI */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Pilih Opsi Kategori Hasil Uji Lab:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opsi 1: Reservoir */}
              <button
                type="button"
                onClick={() => setKategori('Reservoar')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  kategori === 'Reservoar'
                    ? 'bg-cyan-50/90 border-cyan-600 shadow-sm ring-2 ring-cyan-600/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        kategori === 'Reservoar'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-cyan-100 text-cyan-700'
                      }`}
                    >
                      <DropletsIcon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-slate-900">1. Reservoar</span>
                  </div>
                  {kategori === 'Reservoar' && (
                    <CheckCircleIcon className="w-4 h-4 text-cyan-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Hasil uji mutu air bak penampungan & instalasi utama Reservoar IPA Sepatan Tangerang.
                </p>
              </button>

              {/* Opsi 2: Industri */}
              <button
                type="button"
                onClick={() => setKategori('Industri')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  kategori === 'Industri'
                    ? 'bg-indigo-50/90 border-indigo-600 shadow-sm ring-2 ring-indigo-600/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        kategori === 'Industri'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      <BuildingIcon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-slate-900">2. Industri</span>
                  </div>
                  {kategori === 'Industri' && (
                    <CheckCircleIcon className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Hasil uji mutu air khusus yang ditujukan langsung ke mitra industri tertentu.
                </p>
              </button>
            </div>
          </div>

          {/* PILIH INDUSTRI / PELANGGAN JIKA MEMILIH OPSI INDUSTRI */}
          {kategori === 'Industri' && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-indigo-950">
                  Pilih Industri / Mitra yang Dituju <span className="text-rose-600 font-bold">*</span>
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                  <SparklesIcon className="w-3 h-3 text-amber-500" />
                  Personalized
                </span>
              </div>

              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
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
                Dokumen hasil uji lab ini otomatis terhubung dan dapat diakses oleh mitra industri{' '}
                <strong>{selectedCustomer?.nama_perusahaan}</strong> di portal pelanggan mereka.
              </p>
            </div>
          )}

          {/* 2. MENU UPLOAD BERKAS PDF */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Upload Berkas Dokumen PDF <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">Mendukung format file .pdf</span>
            </div>

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Drop & Select Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${
                isDragOver
                  ? 'border-cyan-500 bg-cyan-50/50 scale-[1.01]'
                  : kategori === 'Industri'
                  ? 'border-indigo-300 hover:border-indigo-400 bg-indigo-50/20'
                  : 'border-cyan-300 hover:border-cyan-400 bg-cyan-50/20'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-xs ${
                  kategori === 'Industri'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-cyan-100 text-cyan-700'
                }`}
              >
                <FileTextIcon className="w-6 h-6" />
              </div>

              {pdfFilename ? (
                /* PDF File Selected Badge */
                <div className="w-full max-w-md space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-emerald-300 shadow-xs flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircleIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {pdfFilename}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Ukuran berkas: {pdfSize || '1.6 MB'} · Siap Diterbitkan
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      title="Hapus file ini"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 justify-center flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <UploadIcon className="w-3.5 h-3.5" />
                      <span>Ganti File PDF</span>
                    </button>

                    {pdfUrl && (
                      <button
                        type="button"
                        onClick={() => downloadPdfBlob(pdfUrl, pdfFilename || 'Dokumen_Uji_Lab.pdf')}
                        className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <DownloadIcon className="w-3.5 h-3.5" />
                        <span>Download Preview</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* No File Selected Yet */
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Tarik & lepas file PDF di sini, atau klik tombol di bawah
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Unggah berkas PDF hasil pengujian lab ({kategori === 'Reservoar' ? 'Reservoar Sepatan' : selectedCustomer?.nama_perusahaan || 'Industri'})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 justify-center flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <UploadIcon className="w-4 h-4" />
                      <span>Pilih Berkas PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleUseOfficialTemplate}
                      className={`px-3.5 py-2 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                        kategori === 'Industri'
                          ? 'bg-indigo-600 hover:bg-indigo-500'
                          : 'bg-cyan-600 hover:bg-cyan-500'
                      }`}
                      title="Gunakan format template resmi PDF laboratorium Aetra"
                    >
                      <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                      <span>Gunakan Format PDF Resmi Aetra</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. CATATAN / REKOMENDASI HASIL LAB (OPSIONAL) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Catatan / Rekomendasi Hasil Lab{' '}
                <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <span className="text-[10px] text-slate-400">Maks. 500 karakter</span>
            </div>
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tuliskan catatan hasil uji laboratorium, rekomendasi kualitas air, atau himbauan teknis jika diperlukan (opsional)..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-400 leading-relaxed"
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
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
              }`}
            >
              {submitting ? (
                <>
                  <RefreshIcon className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Berkas PDF...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Simpan & Upload PDF Lab</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
