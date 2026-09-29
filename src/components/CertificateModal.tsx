import React from 'react';
import { X, Printer, ShieldCheck, Droplets, CheckCircle2, Download, FileText, Building2, Sparkles } from 'lucide-react';
import { HasilLabHarian } from '../types';
import { downloadPdfBlob, generateOfficialLabPdfDataUrl } from '../lib/pdfHelper';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: HasilLabHarian | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadOriginalPdf = () => {
    const url = data.pdf_url || generateOfficialLabPdfDataUrl(
      data.judul_dokumen || 'Laporan Uji Lab Mutu Air',
      data.no_sertifikat_lab,
      data.kategori_lab || 'Reservoar',
      data.tanggal_uji,
      data.lokasi_sampling,
      data.nama_perusahaan_khusus,
      data.status_kelayakan,
      data.nama_analis_lab
    );
    downloadPdfBlob(url, data.pdf_filename || `Laporan_Lab_${data.no_sertifikat_lab.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Action Toolbar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Dokumen Resmi Hasil Uji Mutu Air (COA & Laporan Lab)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadOriginalPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
              title="Unduh file dokumen PDF resmi"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Sheet */}
        <div className="p-8 overflow-y-auto print:p-0 bg-white text-slate-900 font-['Plus_Jakarta_Sans']">
          {/* Top PDF Download Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-cyan-50/80 border border-cyan-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {data.pdf_filename || 'Dokumen_Hasil_Uji_Lab_Aetra.pdf'}
                </span>
                <span className="text-[11px] text-slate-500">
                  Kategori: <strong>{data.kategori_lab || 'Reservoar'}</strong> · Ukuran: {data.pdf_size || '1.8 MB'}
                </span>
              </div>
            </div>

            <button
              onClick={handleDownloadOriginalPdf}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Unduh File PDF (.pdf)</span>
            </button>
          </div>

          {/* Certificate Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-700 text-white flex items-center justify-center shrink-0">
                <Droplets className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 uppercase">
                  PT AETRA AIR TANGERANG
                </h1>
                <p className="text-xs font-medium text-slate-600">
                  Laboratorium Pengujian Kualitas & Pengendalian Mutu Air Minum
                </p>
                <p className="text-[11px] text-slate-500">
                  Instalasi Pengolahan Air (IPA) Sepatan Tangerang · Akreditasi ISO/IEC 17025
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider border border-slate-300">
                Official COA
              </span>
              <p className="text-xs font-mono text-slate-600 mt-1">No: {data.no_sertifikat_lab}</p>
            </div>
          </div>

          {/* Certificate Meta Info */}
          <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Judul Pengujian:</span>
              <span className="font-bold text-slate-900 text-sm">{data.judul_dokumen || 'Hasil Uji Mutu Air Minum'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Kategori Pengujian Lab:</span>
              <span className="inline-flex items-center gap-1 font-bold text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded-md border border-cyan-300">
                {data.kategori_lab || 'Reservoar'}
              </span>
            </div>

            {data.kategori_lab === 'Uji Khusus Pabrik' && data.nama_perusahaan_khusus && (
              <div className="sm:col-span-2 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs text-indigo-900 font-bold">
                  Hasil Uji Sampling Khusus In-Plant Mitra: {data.nama_perusahaan_khusus} ({data.id_pelanggan_khusus})
                </span>
              </div>
            )}

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Titik Pengambilan Sampel:</span>
              <span className="font-semibold text-slate-800">{data.lokasi_sampling}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Tanggal & Jam Sampling:</span>
              <span className="font-semibold text-slate-800">{data.tanggal_uji} · {data.waktu_sampling || '08:00 WIB'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Metode Acuan Standar:</span>
              <span className="font-semibold text-slate-800">Permenkes RI No. 2 Tahun 2023 (Kualitas Air Minum)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Status Kepatuhan:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{data.status_kelayakan || 'MEMENUHI SYARAT'}</span>
              </span>
            </div>
          </div>

          {/* Keterangan Resmi */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white mb-6">
            <h4 className="text-xs font-bold text-slate-900 mb-1">Catatan Analis Laboratorium:</h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {data.catatan || 'Hasil pengujian fisik, kimia, dan mikrobiologis pada dokumen PDF terlampir memenuhi seluruh baku mutu air minum nasional.'}
            </p>
          </div>

          {/* Signature Footer */}
          <div className="border-t border-slate-200 pt-6 flex items-center justify-between text-xs text-slate-600">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Analis Pengendalian Mutu</span>
              <span className="font-bold text-slate-900">{data.nama_analis_lab || 'Nurul Hidayati, S.Si'}</span>
              <p className="text-[10px] text-slate-500">QC Analyst Aetra Air Tangerang</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block">Tanggal Verifikasi</span>
              <span className="font-mono text-slate-800 font-bold">{data.tanggal_uji}</span>
              <p className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Tersertifikasi Sah</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
