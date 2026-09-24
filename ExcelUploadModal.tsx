import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  RefreshCw,
  FileText,
  Building2
} from 'lucide-react';
import { PelangganIndustri, PemakaianAir, StatusProgressMeter } from '../types';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  pelangganList: PelangganIndustri[];
  latestReadingsMap: Record<string, number>;
  onBatchSave: (items: (Omit<PemakaianAir, 'id'> & { id?: string })[]) => Promise<void>;
}

interface ParsedRow {
  id_pelanggan: string;
  nama_perusahaan: string;
  periode_bulan: string;
  periode_tahun: number;
  tanggal_baca: string;
  meter_awal: number;
  meter_akhir: number;
  total_m3: number;
  status_progress: StatusProgressMeter;
  no_bpm?: string;
  catatan_petugas?: string;
  isValid: boolean;
  errorMessage?: string;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  pelangganList,
  latestReadingsMap,
  onBatchSave
}) => {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Customer lookup helper
  const customerMap = pelangganList.reduce<Record<string, PelangganIndustri>>((acc, p) => {
    acc[p.id_pelanggan.toLowerCase()] = p;
    return acc;
  }, {});

  // 1. Download Template Excel Rekap
  const handleDownloadTemplate = () => {
    const currentYear = 2026;
    const currentMonth = 'September';
    const todayStr = new Date().toISOString().split('T')[0];

    const templateData = pelangganList.map((p, idx) => {
      const lastMeter = latestReadingsMap[p.id_pelanggan] || 10000 + idx * 5000;
      const estimatedNext = lastMeter + Math.floor(4000 + Math.random() * 8000);
      return {
        'ID Pelanggan': p.id_pelanggan,
        'Nama Perusahaan': p.nama_perusahaan,
        'Bulan': currentMonth,
        'Tahun': currentYear,
        'Tanggal Baca (YYYY-MM-DD)': todayStr,
        'Meter Awal': lastMeter,
        'Meter Akhir': estimatedNext,
        'Status Progress': 'Pembacaan Meter', // Options: Penerbitan BPM, Pembacaan Meter, Terverifikasi
        'No BPM': `BPM/${currentYear}/09/${p.id_pelanggan.split('-').pop() || '001'}`,
        'Catatan Petugas': 'Stand meter tercatat jelas di lokasi pabrik.'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Auto-width columns
    const colWidths = [
      { wch: 18 }, // ID Pelanggan
      { wch: 38 }, // Nama Perusahaan
      { wch: 14 }, // Bulan
      { wch: 8 },  // Tahun
      { wch: 25 }, // Tanggal Baca
      { wch: 14 }, // Meter Awal
      { wch: 14 }, // Meter Akhir
      { wch: 20 }, // Status Progress
      { wch: 22 }, // No BPM
      { wch: 40 }  // Catatan
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap_Meter_Aetra');

    // Download file
    XLSX.writeFile(workbook, `Template_Rekap_Pemakaian_Aetra_${currentMonth}_${currentYear}.xlsx`);
  };

  // 2. Parse uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessCount(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setErrorMsg('File Excel kosong atau tidak memiliki data yang valid.');
          return;
        }

        const rows: ParsedRow[] = rawJson.map((row) => {
          // Normalize column keys
          const idPelanggan = (row['ID Pelanggan'] || row['id_pelanggan'] || row['ID'] || '').toString().trim();
          const cust = customerMap[idPelanggan.toLowerCase()];
          const namaPerusahaan = cust?.nama_perusahaan || (row['Nama Perusahaan'] || row['nama_perusahaan'] || '').toString().trim();

          const bulan = (row['Bulan'] || row['periode_bulan'] || 'September').toString().trim();
          const tahun = Number(row['Tahun'] || row['periode_tahun'] || 2026);
          const tanggalBaca = (row['Tanggal Baca (YYYY-MM-DD)'] || row['tanggal_baca'] || new Date().toISOString().split('T')[0]).toString().trim();

          const meterAwal = Number(row['Meter Awal'] || row['meter_awal'] || 0);
          const meterAkhir = Number(row['Meter Akhir'] || row['meter_akhir'] || 0);
          const totalM3 = Math.max(0, meterAkhir - meterAwal);

          const rawStatus = (row['Status Progress'] || row['status_progress'] || row['status'] || 'Pembacaan Meter').toString().trim();
          let statusProgress: StatusProgressMeter = 'Pembacaan Meter';
          if (rawStatus.toLowerCase().includes('bpm') || rawStatus.toLowerCase().includes('penerbitan')) {
            statusProgress = 'Penerbitan BPM';
          } else if (rawStatus.toLowerCase().includes('verifikasi') || rawStatus.toLowerCase().includes('terverifikasi')) {
            statusProgress = 'Terverifikasi';
          }

          const noBpm = (row['No BPM'] || row['no_bpm'] || '').toString().trim() || undefined;
          const catatan = (row['Catatan Petugas'] || row['catatan_petugas'] || '').toString().trim() || undefined;

          // Validation
          let isValid = true;
          let errorMessage = '';

          if (!idPelanggan) {
            isValid = false;
            errorMessage = 'ID Pelanggan kosong';
          } else if (!cust) {
            isValid = false;
            errorMessage = `ID "${idPelanggan}" tidak terdaftar`;
          } else if (meterAkhir < meterAwal) {
            isValid = false;
            errorMessage = 'Meter akhir lebih kecil dari meter awal';
          }

          return {
            id_pelanggan: idPelanggan,
            nama_perusahaan: namaPerusahaan,
            periode_bulan: bulan,
            periode_tahun: tahun,
            tanggal_baca: tanggalBaca,
            meter_awal: meterAwal,
            meter_akhir: meterAkhir,
            total_m3: totalM3,
            status_progress: statusProgress,
            no_bpm: noBpm,
            catatan_petugas: catatan,
            isValid,
            errorMessage
          };
        });

        setParsedRows(rows);
      } catch (err: any) {
        console.error('Failed to parse Excel file', err);
        setErrorMsg('Gagal membaca format file. Pastikan file berformat .xlsx, .xls, atau .csv valid.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // 3. Commit and save all records
  const handleCommitBatch = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMsg('Tidak ada baris data yang valid untuk disimpan.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const itemsToSave: (Omit<PemakaianAir, 'id'> & { id?: string })[] = validRows.map((row) => ({
        id_pelanggan: row.id_pelanggan,
        periode_bulan: row.periode_bulan,
        periode_tahun: row.periode_tahun,
        tanggal_baca: row.tanggal_baca,
        meter_awal: row.meter_awal,
        meter_akhir: row.meter_akhir,
        total_m3: row.total_m3,
        status_progress: row.status_progress,
        no_bpm: row.no_bpm,
        tanggal_bpm: row.status_progress === 'Penerbitan BPM' ? row.tanggal_baca : undefined,
        tanggal_verifikasi: row.status_progress === 'Terverifikasi' ? new Date().toISOString().split('T')[0] : undefined,
        catatan_petugas: row.catatan_petugas,
        nama_staf_pencatat: 'Batch Import Excel Staf'
      }));

      await onBatchSave(itemsToSave);
      setSuccessCount(itemsToSave.length);
      setTimeout(() => {
        onClose();
        setParsedRows([]);
        setFileName('');
        setSuccessCount(null);
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan data rekap ke database.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Upload Rekap Excel Pemakaian Air Industri
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Impor serentak satu file Excel/CSV untuk generate otomatis seluruh perusahaan mitra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Step 1 & Step 2 Guide Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Download Template */}
            <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/70 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-900 font-bold text-xs mb-1">
                  <Download className="w-4 h-4 text-cyan-600" />
                  <span>1. Unduh Format Template Excel</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Template sudah berisi daftar seluruh ID Pelanggan aktif, nama pabrik, dan stand meter awal bulan sebelumnya secara otomatis.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="mt-3 w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template (.xlsx)</span>
              </button>
            </div>

            {/* Box 2: Upload Area */}
            <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-cyan-500 transition-colors bg-slate-50 flex flex-col items-center justify-center text-center">
              <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
              <span className="text-xs font-bold text-slate-700">
                2. Pilih File Rekap yang Sudah Diisi
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mendukung file Excel (.xlsx, .xls) atau .csv
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {fileName ? 'Ganti File Excel' : 'Pilih File dari Komputer'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Notification */}
          {successCount !== null && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold">
                Berhasil mengimpor {successCount} data pemakaian air ke database!
              </span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Pratinjau Data ({parsedRows.length} baris terdeteksi)
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    {validCount} Valid
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                      {invalidCount} Perlu Dicek
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  File: {fileName}
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto shadow-xs max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-2.5">ID & Pelanggan</th>
                      <th className="p-2.5">Periode</th>
                      <th className="p-2.5 text-right">Meter Awal</th>
                      <th className="p-2.5 text-right">Meter Akhir</th>
                      <th className="p-2.5 text-right">Volume (m³)</th>
                      <th className="p-2.5">Status Tracking</th>
                      <th className="p-2.5">Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}
                      >
                        <td className="p-2.5">
                          <span className="font-mono font-bold text-slate-900 block">
                            {row.id_pelanggan}
                          </span>
                          <span className="text-[11px] text-slate-600 truncate block max-w-xs">
                            {row.nama_perusahaan}
                          </span>
                        </td>
                        <td className="p-2.5 whitespace-nowrap text-slate-700">
                          {row.periode_bulan} {row.periode_tahun}
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-700">
                          {row.meter_awal.toLocaleString('id-ID')}
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-700">
                          {row.meter_akhir.toLocaleString('id-ID')}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-cyan-700">
                          {row.total_m3.toLocaleString('id-ID')} m³
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              row.status_progress === 'Terverifikasi'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : row.status_progress === 'Pembacaan Meter'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}
                          >
                            {row.status_progress}
                          </span>
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>OK</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-medium">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{row.errorMessage}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-3">
            {parsedRows.length > 0 && (
              <button
                type="button"
                disabled={isProcessing || validCount === 0}
                onClick={handleCommitBatch}
                className="py-2 px-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Proses & Simpan Semua Data ({validCount} Industri)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
