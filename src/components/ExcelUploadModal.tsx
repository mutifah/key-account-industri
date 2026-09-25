import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles,
  Building2,
  UserPlus,
  Check,
  Info
} from 'lucide-react';
import { PelangganIndustri, PemakaianAir, StatusProgressMeter } from '../types';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  pelangganList: PelangganIndustri[];
  latestReadingsMap: Record<string, number>;
  onBatchSave: (
    items: (Omit<PemakaianAir, 'id'> & { id?: string })[],
    customersToUpdate?: PelangganIndustri[]
  ) => Promise<void>;
}

interface ParsedRow {
  id_pelanggan: string;
  nama_perusahaan: string;
  previous_nama_perusahaan?: string;
  isNameUpdated: boolean;
  isNewCustomer: boolean;
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
  const [successInfo, setSuccessInfo] = useState<{ pemakaianCount: number; customerUpdatedCount: number } | null>(null);
  const [syncCompanyName, setSyncCompanyName] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'updated' | 'new' | 'invalid'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Customer lookup helper map (case-insensitive)
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
    setSuccessInfo(null);
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
          const idPelanggan = (
            row['ID Pelanggan'] ||
            row['id_pelanggan'] ||
            row['ID'] ||
            row['Kode Pelanggan'] ||
            row['No Pelanggan'] ||
            row['No Sambungan'] ||
            ''
          ).toString().trim().toUpperCase();

          const cust = customerMap[idPelanggan.toLowerCase()];

          // Extract company name directly from Excel
          const excelNamaPerusahaan = (
            row['Nama Perusahaan'] ||
            row['nama_perusahaan'] ||
            row['Perusahaan'] ||
            row['Nama Pelanggan'] ||
            row['Customer'] ||
            row['Nama Pabrik'] ||
            row['Company'] ||
            row['Company Name'] ||
            ''
          ).toString().trim();

          // Determine final name: priority is what the staff uploaded in the Excel file!
          const finalNamaPerusahaan = excelNamaPerusahaan || cust?.nama_perusahaan || '';

          // Check if this row updates an existing company name
          const isNameUpdated = Boolean(
            cust &&
            excelNamaPerusahaan &&
            cust.nama_perusahaan.trim().toLowerCase() !== excelNamaPerusahaan.trim().toLowerCase()
          );

          // Check if this row represents a new company not yet in the master list
          const isNewCustomer = Boolean(!cust && idPelanggan && finalNamaPerusahaan);

          const bulan = (row['Bulan'] || row['periode_bulan'] || 'September').toString().trim();
          const tahun = Number(row['Tahun'] || row['periode_tahun'] || 2026);
          const tanggalBaca = (
            row['Tanggal Baca (YYYY-MM-DD)'] ||
            row['Tanggal Baca'] ||
            row['tanggal_baca'] ||
            new Date().toISOString().split('T')[0]
          ).toString().trim();

          const meterAwal = Number(row['Meter Awal'] || row['meter_awal'] || row['Stand Awal'] || 0);
          const meterAkhir = Number(row['Meter Akhir'] || row['meter_akhir'] || row['Stand Akhir'] || 0);
          const totalM3 = Math.max(0, meterAkhir - meterAwal);

          const rawStatus = (
            row['Status Progress'] ||
            row['status_progress'] ||
            row['status'] ||
            'Pembacaan Meter'
          ).toString().trim();

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
          } else if (!cust && !finalNamaPerusahaan) {
            isValid = false;
            errorMessage = `ID "${idPelanggan}" tidak terdaftar & Nama Perusahaan tidak ada di Excel`;
          } else if (meterAkhir < meterAwal) {
            isValid = false;
            errorMessage = 'Meter akhir lebih kecil dari meter awal';
          }

          return {
            id_pelanggan: idPelanggan,
            nama_perusahaan: finalNamaPerusahaan,
            previous_nama_perusahaan: cust?.nama_perusahaan,
            isNameUpdated,
            isNewCustomer,
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
      // 1. Prepare Pemakaian records
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

      // 2. Prepare Customers to update/register if company name sync is active
      const customersToUpdate: PelangganIndustri[] = [];
      if (syncCompanyName) {
        const processedCustMap: Record<string, boolean> = {};

        validRows.forEach((row) => {
          const key = row.id_pelanggan.toLowerCase();
          if (processedCustMap[key]) return;
          processedCustMap[key] = true;

          const existingCust = customerMap[key];
          if (existingCust) {
            // If the staff gave a name in Excel and it's different from the existing one, update it!
            if (row.nama_perusahaan && row.nama_perusahaan.trim() !== existingCust.nama_perusahaan.trim()) {
              customersToUpdate.push({
                ...existingCust,
                nama_perusahaan: row.nama_perusahaan.trim()
              });
            }
          } else if (row.isNewCustomer) {
            // Auto register newly discovered industrial partner from Excel
            const numericPart = row.id_pelanggan.replace(/[^0-9]/g, '');
            customersToUpdate.push({
              id_pelanggan: row.id_pelanggan,
              nama_perusahaan: row.nama_perusahaan.trim(),
              bidang_usaha: 'Industri Manufaktur',
              alamat_kawasan: 'Kawasan Industri Tangerang',
              zona_distribusi: 'Zona A - Cikupa & Pasar Kemis',
              no_meter: `MTR-${numericPart || Math.floor(1000 + Math.random() * 9000)}`,
              pic_nama: 'PIC Perusahaan',
              pic_telepon: '0812-0000-0000',
              email: `pic.${row.id_pelanggan.toLowerCase()}@perusahaan.co.id`,
              password: 'aetra' + (numericPart || '123'),
              status_aktif: true,
              created_at: new Date().toISOString()
            });
          }
        });
      }

      await onBatchSave(itemsToSave, customersToUpdate);

      setSuccessInfo({
        pemakaianCount: itemsToSave.length,
        customerUpdatedCount: customersToUpdate.length
      });

      setTimeout(() => {
        onClose();
        setParsedRows([]);
        setFileName('');
        setSuccessInfo(null);
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan data rekap ke database.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;
  const updatedNameCount = parsedRows.filter((r) => r.isNameUpdated).length;
  const newCustomerCount = parsedRows.filter((r) => r.isNewCustomer).length;

  const displayedRows = useMemo(() => {
    if (activeFilter === 'updated') return parsedRows.filter((r) => r.isNameUpdated);
    if (activeFilter === 'new') return parsedRows.filter((r) => r.isNewCustomer);
    if (activeFilter === 'invalid') return parsedRows.filter((r) => !r.isValid);
    return parsedRows;
  }, [parsedRows, activeFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  Upload Excel Rekap & Sinkronisasi Nama Perusahaan
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 hidden sm:inline-block">
                  Auto-Sync Aktif
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Impor data rekap pemakaian sekaligus perbarui nama perusahaan di seluruh website secara otomatis
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Synchronize Company Name Switch Banner */}
          <div className="p-4 bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 border border-cyan-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Sinkronisasi Nama Perusahaan dari File Excel
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {syncCompanyName ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                  Jika nama perusahaan di file Excel diubah oleh staf, sistem akan otomatis memperbarui nama perusahaan di seluruh website (portal mandiri pelanggan, bukti BPM, header, dan dashboard).
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0 self-end sm:self-center">
              <input
                type="checkbox"
                checked={syncCompanyName}
                onChange={(e) => setSyncCompanyName(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          {/* Step 1 & Step 2 Guide Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Download Template */}
            <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-900 font-bold text-xs mb-1">
                  <Download className="w-4 h-4 text-cyan-600" />
                  <span>1. Unduh Format Template Excel (.xlsx)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Template memuat kolom <strong>ID Pelanggan</strong>, <strong>Nama Perusahaan</strong>, stand meter, dan periode. Anda dapat mengedit nama perusahaan langsung di kolom Excel.
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
              <Upload className="w-6 h-6 text-cyan-600 mb-1.5" />
              <span className="text-xs font-bold text-slate-800">
                2. Pilih File Excel yang Diunggah Staf
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
                className="mt-3 py-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {fileName ? `Ganti File (${fileName})` : 'Pilih File dari Komputer'}
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
          {successInfo !== null && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-bold text-sm">
                  Sinkronisasi & Impor Berhasil!
                </span>
              </div>
              <p className="text-slate-700 pl-7 leading-relaxed">
                Tersimpan <strong>{successInfo.pemakaianCount}</strong> data rekap pemakaian air.
                {successInfo.customerUpdatedCount > 0 && (
                  <span className="text-emerald-800 block">
                    ✨ Sebanyak <strong>{successInfo.customerUpdatedCount} nama perusahaan</strong> berhasil diperbarui dan kini langsung tayang di portal website pelanggan & staf!
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              {/* Summary Badges and Filter Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-800 mr-1">
                    Filter Pratinjau:
                  </span>
                  
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Semua ({parsedRows.length})
                  </button>

                  {updatedNameCount > 0 && (
                    <button
                      onClick={() => setActiveFilter('updated')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                        activeFilter === 'updated'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Nama Berubah ({updatedNameCount})</span>
                    </button>
                  )}

                  {newCustomerCount > 0 && (
                    <button
                      onClick={() => setActiveFilter('new')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                        activeFilter === 'new'
                          ? 'bg-cyan-700 text-white'
                          : 'bg-cyan-100 text-cyan-900 hover:bg-cyan-200 border border-cyan-300'
                      }`}
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Mitra Baru ({newCustomerCount})</span>
                    </button>
                  )}

                  {invalidCount > 0 && (
                    <button
                      onClick={() => setActiveFilter('invalid')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                        activeFilter === 'invalid'
                          ? 'bg-rose-700 text-white'
                          : 'bg-rose-100 text-rose-900 hover:bg-rose-200 border border-rose-300'
                      }`}
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>Perlu Dicek ({invalidCount})</span>
                    </button>
                  )}
                </div>

                <span className="text-[11px] text-slate-500 font-mono truncate max-w-xs">
                  File: {fileName}
                </span>
              </div>

              {/* Data Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto shadow-xs max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5">ID & Nama Perusahaan dari Excel</th>
                      <th className="p-2.5">Periode</th>
                      <th className="p-2.5 text-right">Meter Awal</th>
                      <th className="p-2.5 text-right">Meter Akhir</th>
                      <th className="p-2.5 text-right">Volume (m³)</th>
                      <th className="p-2.5">Status Tracking</th>
                      <th className="p-2.5 text-center">Status Nama di Website</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          !row.isValid
                            ? 'bg-rose-50/60'
                            : row.isNameUpdated
                            ? 'bg-amber-50/60'
                            : row.isNewCustomer
                            ? 'bg-cyan-50/60'
                            : 'hover:bg-slate-50'
                        }
                      >
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900">
                              {row.id_pelanggan}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-slate-800 truncate block max-w-sm">
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
                        <td className="p-2.5 text-center whitespace-nowrap">
                          {!row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-medium">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{row.errorMessage}</span>
                            </span>
                          ) : row.isNameUpdated ? (
                            <div className="flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                                <Sparkles className="w-3 h-3 text-amber-700" />
                                <span>Update Nama Baru</span>
                              </span>
                              {row.previous_nama_perusahaan && (
                                <span className="text-[10px] text-slate-500 line-through mt-0.5 max-w-[160px] truncate" title={row.previous_nama_perusahaan}>
                                  Lama: {row.previous_nama_perusahaan}
                                </span>
                              )}
                            </div>
                          ) : row.isNewCustomer ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold border border-cyan-300">
                              <UserPlus className="w-3 h-3 text-cyan-700" />
                              <span>Mitra Baru</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                              <Check className="w-3.5 h-3.5" />
                              <span>Sesuai Database</span>
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {parsedRows.length > 0 && (
              <button
                type="button"
                disabled={isProcessing || validCount === 0}
                onClick={handleCommitBatch}
                className="w-full sm:w-auto py-2.5 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan & Menyinkronkan Nama...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Proses & Simpan ({validCount} Rekap
                      {syncCompanyName && updatedNameCount > 0 ? ` + ${updatedNameCount} Ganti Nama` : ''}
                      {syncCompanyName && newCustomerCount > 0 ? ` + ${newCustomerCount} Mitra Baru` : ''})
                    </span>
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
