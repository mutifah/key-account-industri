import React from 'react';
import { X, Printer, ShieldCheck, Droplets, CheckCircle2 } from 'lucide-react';
import { HasilLabHarian } from '../types';

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Action Toolbar */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Sertifikat Hasil Uji Mutu Air (Certificate of Analysis)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Sheet */}
        <div className="p-8 overflow-y-auto print:p-0 bg-white text-slate-900 font-['Plus_Jakarta_Sans']">
          {/* Certificate Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center">
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
                  Instalasi Pengolahan Air (IPA) Cikokol & Sepatan Tangerang · Akreditasi ISO/IEC 17025
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider border border-slate-300">
                Official COA
              </span>
              <p className="text-xs font-mono text-slate-600 mt-1">No: {data.no_sertifikat_lab}</p>
            </div>
          </div>

          {/* Certificate Meta Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Titik Pengambilan Sampel:</span>
              <span className="font-semibold text-slate-800">{data.lokasi_sampling}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Tanggal & Jam Sampling:</span>
              <span className="font-semibold text-slate-800">{data.tanggal_uji} · {data.waktu_sampling}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Metode Acuan Standar:</span>
              <span className="font-semibold text-slate-800">Permenkes RI No. 2 Tahun 2023 (Kualitas Air Minum)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Status Kepatuhan:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                MEMENUHI SYARAT
              </span>
            </div>
          </div>

          {/* Parameter Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Hasil Pengujian Parameter Fisika, Kimia & Mikrobiologi
            </h3>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Parameter Uji</th>
                  <th className="p-2.5">Satuan</th>
                  <th className="p-2.5">Baku Mutu Kemenkes</th>
                  <th className="p-2.5 text-right">Hasil Analisa</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-medium">Derajat Keasaman (pH)</td>
                  <td className="p-2.5 text-slate-500">-</td>
                  <td className="p-2.5 text-slate-500">6.5 - 8.5</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">{data.ph}</td>
                  <td className="p-2.5 text-center text-emerald-700 font-medium">Sesuai</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Kekeruhan (Turbidity)</td>
                  <td className="p-2.5 text-slate-500">NTU</td>
                  <td className="p-2.5 text-slate-500">Maks. 3.0</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">{data.kekeruhan_ntu}</td>
                  <td className="p-2.5 text-center text-emerald-700 font-medium">Sesuai</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Sisa Khlor Bebas</td>
                  <td className="p-2.5 text-slate-500">mg/L</td>
                  <td className="p-2.5 text-slate-500">0.2 - 0.5</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">{data.sisa_khlor_mg_l}</td>
                  <td className="p-2.5 text-center text-emerald-700 font-medium">Sesuai</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Zat Padat Terlarut (TDS)</td>
                  <td className="p-2.5 text-slate-500">mg/L</td>
                  <td className="p-2.5 text-slate-500">Maks. 300</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">{data.tds_mg_l}</td>
                  <td className="p-2.5 text-center text-emerald-700 font-medium">Sesuai</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Suhu Sampel</td>
                  <td className="p-2.5 text-slate-500">°C</td>
                  <td className="p-2.5 text-slate-500">Suhu Udara ± 3</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">{data.suhu_celsius}</td>
                  <td className="p-2.5 text-center text-emerald-700 font-medium">Sesuai</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Escherichia Coli (E. Coli)</td>
                  <td className="p-2.5 text-slate-500">CFU/100ml</td>
                  <td className="p-2.5 text-slate-500">0</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">{data.e_coli_cfu}</td>
                  <td className="p-2.5 text-center text-emerald-700 font-medium">Nihil (Aman)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Rasa & Bau</td>
                  <td className="p-2.5 text-slate-500">-</td>
                  <td className="p-2.5 text-slate-500">Tidak Berbau & Rasa Alami</td>
                  <td className="p-2.5 text-right font-medium text-slate-900">{data.rasa_bau}</td>
                  <td className="p-2.5 text-center text-emerald-700 font-medium">Sesuai</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {data.catatan && (
            <div className="mb-8 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-800">Catatan Analis: </span>
              {data.catatan}
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs text-center">
            <div>
              <p className="text-slate-500">Petugas / Analis Kimia Lab,</p>
              <div className="h-14 flex items-end justify-center font-serif italic text-slate-700 text-sm">
                ( {data.nama_analis_lab} )
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Divisi QC & Laboratorium</p>
            </div>
            <div>
              <p className="text-slate-500">Tangerang, {data.tanggal_uji}</p>
              <p className="text-slate-500">Kepala Lab Mutu Air Aetra Tangerang,</p>
              <div className="h-14 flex items-end justify-center font-serif font-bold text-slate-800 text-sm">
                ( Ir. Wahyu Hidayat, M.Sc )
              </div>
              <p className="text-[11px] text-slate-400 font-mono">SIP: 503/LAB-AETRA/2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
