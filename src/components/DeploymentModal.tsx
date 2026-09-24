import React, { useState } from 'react';
import { X, Copy, Check, Database, GitBranch, ExternalLink, Terminal, ShieldCheck, AlertCircle } from 'lucide-react';
import { getSavedSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../lib/supabase';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ isOpen, onClose, onConfigSaved }) => {
  const currentConfig = getSavedSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.anonKey);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);
  const [activeTab, setActiveTab] = useState<'supabase' | 'vercel' | 'sql'>('supabase');

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setTestResult(res);
    setTesting(false);

    if (res.success || !supabaseUrl) {
      saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
      onConfigSaved();
    }
  };

  const sqlCode = `-- =========================================================================
-- PT AETRA AIR TANGERANG - SUPABASE DDL & SEED DATA
-- =========================================================================

CREATE TABLE IF NOT EXISTS pelanggan_industri (
  id_pelanggan TEXT PRIMARY KEY,
  nama_perusahaan TEXT NOT NULL,
  bidang_usaha TEXT NOT NULL,
  alamat_kawasan TEXT NOT NULL,
  zona_distribusi TEXT NOT NULL DEFAULT 'Zona Cikupa - Balaraja (IPA Cikokol)',
  pic_nama TEXT NOT NULL,
  pic_telepon TEXT NOT NULL,
  email TEXT,
  no_meter TEXT NOT NULL,
  password TEXT NOT NULL DEFAULT 'aetra123',
  status_aktif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pemakaian_air (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  id_pelanggan TEXT NOT NULL REFERENCES pelanggan_industri(id_pelanggan) ON DELETE CASCADE,
  periode_bulan TEXT NOT NULL,
  periode_tahun INTEGER NOT NULL,
  tanggal_baca DATE NOT NULL DEFAULT CURRENT_DATE,
  no_bpm TEXT,
  tanggal_bpm DATE,
  tanggal_verifikasi DATE,
  meter_awal NUMERIC NOT NULL DEFAULT 0,
  meter_akhir NUMERIC NOT NULL DEFAULT 0,
  total_m3 NUMERIC NOT NULL DEFAULT 0,
  status_progress TEXT NOT NULL DEFAULT 'Pembacaan Meter',
  catatan_petugas TEXT,
  nama_staf_pencatat TEXT NOT NULL DEFAULT 'Staf Key Account Aetra',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hasil_lab_harian (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tanggal_uji DATE NOT NULL DEFAULT CURRENT_DATE,
  waktu_sampling TEXT NOT NULL DEFAULT '08:00 WIB',
  lokasi_sampling TEXT NOT NULL,
  ph NUMERIC NOT NULL,
  kekeruhan_ntu NUMERIC NOT NULL,
  sisa_khlor_mg_l NUMERIC NOT NULL,
  tds_mg_l NUMERIC NOT NULL,
  suhu_celsius NUMERIC NOT NULL DEFAULT 27.5,
  e_coli_cfu INTEGER NOT NULL DEFAULT 0,
  rasa_bau TEXT NOT NULL DEFAULT 'Tidak Berbau & Normal',
  status_kelayakan TEXT NOT NULL DEFAULT 'Memenuhi Standar Permenkes No. 2/2023',
  nama_analis_lab TEXT NOT NULL DEFAULT 'QC Lab Aetra',
  no_sertifikat_lab TEXT NOT NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS info_pelayanan (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  judul TEXT NOT NULL,
  tipe TEXT NOT NULL DEFAULT 'Pemeliharaan Jaringan',
  tingkat_urgensi TEXT NOT NULL DEFAULT 'Info',
  tanggal_mulai TIMESTAMPTZ NOT NULL DEFAULT now(),
  tanggal_selesai TIMESTAMPTZ,
  wilayah_terdampak TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  status_aliran TEXT NOT NULL DEFAULT 'Normal Bertekanan Stabil',
  solusi_mitigasi TEXT,
  pic_nama TEXT NOT NULL DEFAULT 'Key Account Management Aetra',
  pic_kontak TEXT NOT NULL DEFAULT '+62 21 5908888',
  status_publikasi BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pelanggan_industri ENABLE ROW LEVEL SECURITY;
ALTER TABLE pemakaian_air ENABLE ROW LEVEL SECURITY;
ALTER TABLE hasil_lab_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_pelayanan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Pelanggan" ON pelanggan_industri FOR SELECT USING (true);
CREATE POLICY "Public Manage Pelanggan" ON pelanggan_industri FOR ALL USING (true);
CREATE POLICY "Public Read Pemakaian" ON pemakaian_air FOR SELECT USING (true);
CREATE POLICY "Public Manage Pemakaian" ON pemakaian_air FOR ALL USING (true);
CREATE POLICY "Public Read Lab" ON hasil_lab_harian FOR SELECT USING (true);
CREATE POLICY "Public Manage Lab" ON hasil_lab_harian FOR ALL USING (true);
CREATE POLICY "Public Read Info" ON info_pelayanan FOR SELECT USING (true);
CREATE POLICY "Public Manage Info" ON info_pelayanan FOR ALL USING (true);

INSERT INTO pelanggan_industri (id_pelanggan, nama_perusahaan, bidang_usaha, alamat_kawasan, zona_distribusi, pic_nama, pic_telepon, email, no_meter, password)
VALUES 
  ('AETRA-IND-001', 'PT Indofood CBP Sukses Makmur Tbk', 'Industri Makanan & Minuman', 'Kawasan Industri Cikupa Mas Blok A2 No. 8, Tangerang', 'Zona Cikupa - Balaraja (IPA Cikokol)', 'Ir. Hendra Gunawan', '+62 812-8890-1122', 'utility.factory@indofood.co.id', 'MTR-CKP-00918', 'indofood123'),
  ('AETRA-IND-002', 'PT Mayora Indah Tbk (Plant Jatake)', 'Industri Biskuit & Kembang Gula', 'Jl. Telesonic Ujung No. 10, Kawasan Industri Jatake, Tangerang', 'Zona Jatake - Pasar Kemis (IPA Sepatan)', 'Bambang Sudiro, ST', '+62 811-9988-345', 'facility.jatake@mayora.co.id', 'MTR-JTK-04512', 'mayora123'),
  ('AETRA-IND-003', 'PT Torabika Eka Semesta', 'Industri Pengolahan Kopi & Minuman Sachet', 'Jl. Raya Serang Km 12.5, Cikupa, Kabupaten Tangerang', 'Zona Cikupa - Balaraja (IPA Cikokol)', 'Drs. Agus Haryanto', '+62 813-7766-5544', 'maintenance@torabika.com', 'MTR-CKP-00344', 'torabika123'),
  ('AETRA-IND-004', 'PT Gajah Tunggal Tbk (Plant Tire)', 'Industri Otomotif & Ban Kendaraan', 'Jl. Gajah Tunggal No. 1, Jatiuwung, Tangerang', 'Zona Jatiuwung Barat (Booster Station)', 'Rudi Hermawan, MT', '+62 815-4433-2211', 'boiler.plant@gt-tires.com', 'MTR-JTW-09101', 'gajah123'),
  ('AETRA-IND-005', 'PT Unilever Indonesia Tbk (Distribution Center)', 'Pusat Logistik & Manufaktur Personal Care', 'Kawasan Industri Manis Jl. Manis V No. 3, Tangerang', 'Zona Manis - Jatake', 'Siti Rahmadani, S.Si', '+62 812-3344-9988', 'hse.tangerang@unilever.com', 'MTR-MNS-01289', 'unilever123')
ON CONFLICT (id_pelanggan) DO NOTHING;`;

  const copyToClipboard = (text: string, type: 'sql' | 'git') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } else {
      setCopiedGit(true);
      setTimeout(() => setCopiedGit(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Panduan Supabase, GitHub & Deploy Vercel</h2>
              <p className="text-xs text-slate-400">Integrasi Cloud Storage & Hosting untuk PT Aetra Air Tangerang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-cyan-600 text-cyan-700 bg-white rounded-t-md shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>1. Hubungkan Supabase</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-cyan-600 text-cyan-700 bg-white rounded-t-md shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. Skrip SQL Supabase</span>
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'vercel'
                ? 'border-cyan-600 text-cyan-700 bg-white rounded-t-md shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>3. Deploy GitHub & Vercel</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {activeTab === 'supabase' && (
            <div className="space-y-5">
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex gap-3 text-cyan-900">
                <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold text-cyan-950 mb-1">Penyimpanan Terintegrasi (Hybrid Storage)</p>
                  Aplikasi ini sudah dilengkapi dengan sistem hybrid: saat URL Supabase belum diisi, aplikasi tetap beroperasi 100% menggunakan Local Storage dengan data awal otentik Aetra Air Tangerang. Ketika Anda memasukkan kredensial Supabase di bawah, data akan langsung tersimpan di Cloud Database Supabase Anda!
                </div>
              </div>

              <form onSubmit={handleTestAndSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Supabase Project URL (VITE_SUPABASE_URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Ditemukan di Supabase Console → Project Settings → API → Project URL.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Supabase Anon / Public API Key (VITE_SUPABASE_ANON_KEY)
                  </label>
                  <input
                    type="text"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Ditemukan di Supabase Console → Project Settings → API → Project API Keys (anon public).
                  </span>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSupabaseUrl('');
                      setSupabaseAnonKey('');
                      saveSupabaseConfig('', '');
                      setTestResult({ success: true, message: 'Kembali ke mode penyimpanan lokal default.' });
                      onConfigSaved();
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Reset ke mode lokal
                  </button>
                  <button
                    type="submit"
                    disabled={testing}
                    className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {testing ? 'Menguji Koneksi...' : 'Simpan & Uji Koneksi Supabase'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Salin skrip SQL ini lalu jalankan di menu <strong>SQL Editor</strong> pada dashboard Supabase Anda:
                </p>
                <button
                  onClick={() => copyToClipboard(sqlCode, 'sql')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin ke Clipboard!' : 'Salin Semua SQL'}</span>
                </button>
              </div>

              <div className="relative bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-72 border border-slate-800">
                <pre>{sqlCode}</pre>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>1. Buka <strong>supabase.com</strong> dan login ke dashboard proyek Anda.</p>
                <p>2. Klik menu <strong>SQL Editor</strong> di bilah navigasi kiri, lalu pilih <strong>New Query</strong>.</p>
                <p>3. Tempel (Paste) kode di atas lalu klik tombol <strong>Run</strong> berwarna hijau.</p>
              </div>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-600" />
                  Langkah 1: Push ke Repositori GitHub
                </h4>
                <div className="relative bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs space-y-1">
                  <p>git init</p>
                  <p>git add .</p>
                  <p>git commit -m &quot;Initial commit PT Aetra Air Tangerang Portal&quot;</p>
                  <p>git branch -M main</p>
                  <p>git remote add origin https://github.com/USERNAME/aetra-air-tangerang.git</p>
                  <p>git push -u origin main</p>
                  <button
                    onClick={() => copyToClipboard(`git init\ngit add .\ngit commit -m "Initial commit PT Aetra Air Tangerang Portal"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/aetra-air-tangerang.git\ngit push -u origin main`, 'git')}
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                    title="Copy Git commands"
                  >
                    {copiedGit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-cyan-600" />
                  Langkah 2: Deploy di Vercel
                </h4>
                <ol className="text-xs text-slate-600 list-decimal list-inside space-y-1.5 leading-relaxed">
                  <li>Buka <strong>vercel.com</strong> dan masuk menggunakan akun GitHub Anda.</li>
                  <li>Pilih <strong>Add New Project</strong> dan import repositori <code>aetra-air-tangerang</code>.</li>
                  <li>File konfigurasi <code>vercel.json</code> sudah otomatis disertakan di dalam proyek ini untuk menangani routing SPA (Single Page Application).</li>
                  <li>Pada bagian <strong>Environment Variables</strong> di Vercel, tambahkan 2 variabel berikut:</li>
                </ol>
                <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs space-y-1 text-slate-700">
                  <p><span className="text-cyan-700 font-semibold">VITE_SUPABASE_URL</span> = https://your-project.supabase.co</p>
                  <p><span className="text-cyan-700 font-semibold">VITE_SUPABASE_ANON_KEY</span> = your-anon-key-here</p>
                </div>
                <p className="text-xs text-slate-600">
                  5. Klik tombol <strong>Deploy</strong>. Dalam waktu sekitar 1 menit website Anda akan aktif online dengan sertifikat SSL gratis!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
