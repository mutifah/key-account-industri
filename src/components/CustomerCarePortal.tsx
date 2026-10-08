import React, { useState, useMemo } from 'react';
import {
  Headphones,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Building2,
  Phone,
  MessageSquare,
  AlertTriangle,
  FileCheck2,
  ExternalLink,
  Edit3,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Send,
  Layers,
  CheckSquare,
  Square,
  FileText
} from 'lucide-react';
import { TiketLayanan, PelangganIndustri, StaffUser } from '../types';

interface CustomerCarePortalProps {
  currentStaff: StaffUser;
  tiketList: TiketLayanan[];
  pelangganList: PelangganIndustri[];
  onUpdateTiket: (tiket: TiketLayanan) => Promise<void>;
}

export const CustomerCarePortal: React.FC<CustomerCarePortalProps> = ({
  currentStaff,
  tiketList,
  pelangganList,
  onUpdateTiket
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterObStatus, setFilterObStatus] = useState<'semua' | 'belum' | 'sudah'>('semua');
  const [activeEditingObId, setActiveEditingObId] = useState<string | null>(null);

  // Form states for active editing ticket
  const [inputNoCaseOb, setInputNoCaseOb] = useState('');
  const [inputCatatanOb, setInputCatatanOb] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  // Map customers for quick lookup
  const customerMap = useMemo(() => {
    const map: Record<string, PelangganIndustri> = {};
    pelangganList.forEach((p) => {
      map[p.id_pelanggan] = p;
    });
    return map;
  }, [pelangganList]);

  // STRICT ACCESS CONTROL:
  // Customer Care ONLY sees tickets that were escalated to Contact Center (CC) by Admin / Key Account
  const escalatedTickets = useMemo(() => {
    return tiketList.filter((t) => {
      return (
        t.status === 'Diteruskan ke CC' ||
        t.status_tindak_lanjut === 'Diteruskan ke CC' ||
        Boolean(t.no_tiket_cc)
      );
    });
  }, [tiketList]);

  // Statistics
  const totalEscalated = escalatedTickets.length;
  const createdObCount = escalatedTickets.filter((t) => t.openbravo_case_created).length;
  const pendingObCount = totalEscalated - createdObCount;

  // Filtered list based on search and OpenBravo status
  const filteredTickets = useMemo(() => {
    return escalatedTickets.filter((t) => {
      const cust = customerMap[t.id_pelanggan];
      const matchSearch =
        !searchQuery ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id_pelanggan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cust?.nama_perusahaan &&
          cust.nama_perusahaan.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.no_tiket_cc && t.no_tiket_cc.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.no_case_openbravo &&
          t.no_case_openbravo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.catatan_internal_cc &&
          t.catatan_internal_cc.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchOb =
        filterObStatus === 'semua' ||
        (filterObStatus === 'belum' && !t.openbravo_case_created) ||
        (filterObStatus === 'sudah' && Boolean(t.openbravo_case_created));

      return matchSearch && matchOb;
    });
  }, [escalatedTickets, searchQuery, filterObStatus, customerMap]);

  // Helper to open the checklist form for a specific ticket
  const handleStartChecklist = (t: TiketLayanan) => {
    setActiveEditingObId(t.id);
    if (t.no_case_openbravo) {
      setInputNoCaseOb(t.no_case_openbravo);
    } else {
      // Auto-generate OpenBravo case number suggestion
      const year = new Date().getFullYear();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setInputNoCaseOb(`OB-CASE-${year}-${randomNum}`);
    }
    setInputCatatanOb(t.catatan_openbravo || '');
  };

  // Helper to save checklist as completed in OpenBravo
  const handleSaveChecklist = async (t: TiketLayanan) => {
    setSavingId(t.id);
    try {
      const finalNoOb = inputNoCaseOb.trim() || `OB-CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const updated: TiketLayanan = {
        ...t,
        openbravo_case_created: true,
        no_case_openbravo: finalNoOb,
        tanggal_case_openbravo: t.tanggal_case_openbravo || new Date().toISOString(),
        petugas_case_openbravo: `${currentStaff.nama} (${currentStaff.nik})`,
        catatan_openbravo: inputCatatanOb.trim() || 'Case OpenBravo berhasil dibuat & diterbitkan ke sistem ERP.',
        status_penanganan_cc: t.status_penanganan_cc || 'Dalam Proses CC'
      };

      await onUpdateTiket(updated);
      setActiveEditingObId(null);
    } catch (err) {
      console.error('Error saving OpenBravo case checklist:', err);
    } finally {
      setSavingId(null);
    }
  };

  // Helper to uncheck OpenBravo status if needed
  const handleUncheckOpenBravo = async (t: TiketLayanan) => {
    if (!confirm(`Batalkan checklist Case OpenBravo untuk tiket ${t.id}?`)) return;
    setSavingId(t.id);
    try {
      const updated: TiketLayanan = {
        ...t,
        openbravo_case_created: false,
        status_penanganan_cc: 'Menunggu Input OB'
      };
      await onUpdateTiket(updated);
      setActiveEditingObId(null);
    } catch (err) {
      console.error('Error unchecking OpenBravo:', err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Care Hero Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                  Dashboard Operasional Contact Center (CC) 24 Jam
                </h1>
                <span className="bg-purple-500/20 text-purple-300 text-[11px] font-mono font-semibold px-2 py-0.5 rounded border border-purple-500/30">
                  Divisi CC & Dispatch
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <span>Petugas CC:</span>
                  <strong className="text-white">{currentStaff.nama}</strong>
                  <span className="text-emerald-400">({currentStaff.nik})</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Penerimaan tiket komplain industri yang dieskalasikan oleh Staf Key Account / Admin.
                Petugas CC dapat memverifikasi instruksi internal dan mencatat checklist pembuatan Case di sistem OpenBravo ERP.
              </p>
            </div>
          </div>
        </div>

        {/* Access Notice Badge */}
        <div className="p-3 bg-purple-950/50 border border-purple-800/60 rounded-xl flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2 text-purple-200">
            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              <strong>Peran Khusus CC Terproteksi:</strong> Akun ini hanya memiliki otorisasi melihat laporan yang telah dieskalasikan ke Contact Center.
            </span>
          </div>
          <span className="text-[11px] font-mono text-purple-300 font-bold bg-purple-900/60 px-2 py-0.5 rounded border border-purple-700/50">
            Mode Khusus Eskalasi
          </span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Total Tiket Diteruskan ke CC
            </span>
            <span className="text-2xl font-black text-slate-900">{totalEscalated}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Dari Staf Key Account Aetra
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-700 block">
              Perlu Checklist OpenBravo
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-900">{pendingObCount}</span>
              {pendingObCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  Belum Dibuat
                </span>
              )}
            </div>
            <span className="text-[10px] text-amber-600 block mt-0.5">
              Menunggu input nomor case OB
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 block">
              Case OpenBravo Selesai Dibuat
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-900">{createdObCount}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Terverifikasi
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 block mt-0.5">
              Siap / Sedang penanganan lapangan
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID tiket, No. CC, pabrik, No. Case OpenBravo..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
            />
          </div>

          {/* Filter Status OpenBravo */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setFilterObStatus('semua')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                filterObStatus === 'semua'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({escalatedTickets.length})
            </button>
            <button
              onClick={() => setFilterObStatus('belum')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                filterObStatus === 'belum'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              Belum Case OB ({pendingObCount})
            </button>
            <button
              onClick={() => setFilterObStatus('sudah')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                filterObStatus === 'sudah'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 hover:text-emerald-950'
              }`}
            >
              Sudah Case OB ({createdObCount})
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Menampilkan <strong className="text-slate-800">{filteredTickets.length}</strong> tiket eskalasi
        </div>
      </div>

      {/* Ticket List for Customer Care */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-400 flex items-center justify-center mx-auto">
            <Headphones className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Tiket Eskalasi</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {totalEscalated === 0
              ? 'Belum ada tiket komplain yang diteruskan oleh Staf Key Account ke divisi Contact Center.'
              : 'Tidak ada tiket eskalasi yang sesuai dengan kata kunci pencarian atau filter yang dipilih.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((t) => {
            const cust = customerMap[t.id_pelanggan];
            const isEditing = activeEditingObId === t.id;
            const hasObCase = Boolean(t.openbravo_case_created);

            return (
              <div
                key={t.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 ${
                  !hasObCase
                    ? 'border-amber-300 ring-1 ring-amber-300/40'
                    : 'border-slate-200 hover:border-purple-200'
                }`}
              >
                {/* Header Bar: Kode Tiket, No Tiket CC, Waktu Eskalasi, Status OpenBravo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Kode Tiket Layanan */}
                    <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg shadow-2xs">
                      {t.id}
                    </span>

                    {/* No Tiket CC Resmi */}
                    {t.no_tiket_cc && (
                      <span className="font-mono text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <Headphones className="w-3.5 h-3.5 text-purple-700" />
                        <span>No. Tiket CC: {t.no_tiket_cc}</span>
                      </span>
                    )}

                    {/* OpenBravo Status Badge */}
                    {hasObCase ? (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Case OpenBravo: {t.no_case_openbravo}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Menunggu Input Case OpenBravo</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Dieskalasikan:{' '}
                      {t.tanggal_tindak_lanjut
                        ? new Date(t.tanggal_tindak_lanjut).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : new Date(t.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}{' '}
                      WIB
                    </span>
                  </div>
                </div>

                {/* Info Pelanggan Mitra */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <strong className="text-slate-900 font-bold text-sm">
                      {cust?.nama_perusahaan || t.id_pelanggan}
                    </strong>
                    <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded font-semibold">
                      {t.id_pelanggan}
                    </span>
                  </div>

                  {cust?.pic_nama && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        PIC Pabrik: <strong className="text-slate-800">{cust.pic_nama}</strong>{' '}
                        {cust.pic_telepon && <span className="font-mono text-slate-500">({cust.pic_telepon})</span>}
                      </span>
                    </div>
                  )}
                </div>

                {/* Perihal & Pesan Komplain Pelanggan */}
                <div className="space-y-1.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                      <span>{t.perihal}</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {t.kategori}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pt-1">
                    "{t.pesan}"
                  </p>
                </div>

                {/* Catatan Instruksi Khusus dari Staf Key Account / Admin */}
                <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-purple-950 font-semibold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-700" />
                      <span>Instruksi Eskalasi dari Staf Key Account / Admin:</span>
                    </span>
                    <span className="text-purple-800 font-bold">
                      {t.nama_petugas_tindak_lanjut || 'Admin Key Account'}
                    </span>
                  </div>
                  <p className="text-xs text-purple-900 font-medium leading-relaxed">
                    "{t.catatan_internal_cc || 'Mohon segera tindak lanjuti laporan pelanggan dan input case ke sistem OpenBravo.'}"
                  </p>
                </div>

                {/* OpenBravo Case Checklist Section */}
                <div className="pt-2 border-t border-slate-100">
                  {/* Condition 1: Case is already created and NOT in edit mode */}
                  {hasObCase && !isEditing && (
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold text-xs text-emerald-950 block">
                              Case Telah Dibuat di OpenBravo: {t.no_case_openbravo}
                            </span>
                            <span className="text-[11px] text-emerald-700 block">
                              Diverifikasi oleh: <strong>{t.petugas_case_openbravo || currentStaff.nama}</strong>
                              {t.tanggal_case_openbravo && (
                                <>
                                  {' '}·{' '}
                                  {new Date(t.tanggal_case_openbravo).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}{' '}
                                  WIB
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartChecklist(t)}
                            className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit Case OB</span>
                          </button>
                          <button
                            onClick={() => handleUncheckOpenBravo(t)}
                            disabled={savingId === t.id}
                            className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                            <span>Batal Checklist</span>
                          </button>
                        </div>
                      </div>

                      {t.catatan_openbravo && (
                        <div className="text-[11px] text-emerald-900 bg-white/70 p-2 rounded-lg border border-emerald-100">
                          <span className="font-semibold">Catatan OpenBravo:</span> "{t.catatan_openbravo}"
                        </div>
                      )}
                    </div>
                  )}

                  {/* Condition 2: Case has NOT been created yet, or user is editing */}
                  {(!hasObCase || isEditing) && (
                    <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                      {!isEditing ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <Square className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-amber-950">
                                Checklist: Buat Case Tiket di OpenBravo
                              </h5>
                              <p className="text-[11px] text-amber-800">
                                Tandai dan catat nomor case OpenBravo setelah case diterbitkan di sistem CC.
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleStartChecklist(t)}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-center"
                          >
                            <CheckSquare className="w-4 h-4" />
                            <span>Checklist Case OpenBravo</span>
                          </button>
                        </div>
                      ) : (
                        /* Inline Form to fill OpenBravo case number */
                        <div className="space-y-3 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between pb-1 border-b border-amber-200">
                            <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                              <CheckSquare className="w-4 h-4 text-amber-700" />
                              <span>Konfirmasi Pembuatan Case di OpenBravo</span>
                            </span>
                            <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                              Petugas CC: {currentStaff.nama}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                                Nomor Case OpenBravo *
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  required
                                  value={inputNoCaseOb}
                                  onChange={(e) => setInputNoCaseOb(e.target.value)}
                                  placeholder="Contoh: OB-CASE-2026-0814"
                                  className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const year = new Date().getFullYear();
                                    const randomDigits = Math.floor(1000 + Math.random() * 9000);
                                    setInputNoCaseOb(`OB-CASE-${year}-${randomDigits}`);
                                  }}
                                  className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  Auto-Gen
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                                Catatan Penugasan / Modul OpenBravo (Opsional)
                              </label>
                              <input
                                type="text"
                                value={inputCatatanOb}
                                onChange={(e) => setInputCatatanOb(e.target.value)}
                                placeholder="Contoh: Disposisi ke modul Pemeliharaan Pipa / Tim Cikupa"
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setActiveEditingObId(null)}
                              disabled={savingId === t.id}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveChecklist(t)}
                              disabled={savingId === t.id || !inputNoCaseOb.trim()}
                              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              {savingId === t.id ? (
                                <span>Menyimpan...</span>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Simpan Checklist Case OpenBravo</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
