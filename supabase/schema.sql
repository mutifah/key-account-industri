-- =========================================================================
-- PT AETRA AIR TANGERANG - SCHEMA DATABASE SUPABASE
-- Skrip DDL untuk Portal Key Account & Pelanggan Industri
-- Jalankan skrip ini di: Supabase Console -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. TABEL PELANGGAN INDUSTRI (Master Key Account)
CREATE TABLE IF NOT EXISTS pelanggan_industri (
  id_pelanggan TEXT PRIMARY KEY,
  nama_perusahaan TEXT NOT NULL,
  bidang_usaha TEXT NOT NULL,
  alamat_kawasan TEXT NOT NULL,
  zona_distribusi TEXT NOT NULL DEFAULT 'Zona Industri Tangerang',
  pic_nama TEXT NOT NULL,
  pic_telepon TEXT NOT NULL,
  email TEXT,
  no_meter TEXT NOT NULL,
  diameter_pipa TEXT NOT NULL DEFAULT '4 inch (DN 100)',
  kuota_kontrak_m3 NUMERIC NOT NULL DEFAULT 5000,
  tarif_per_m3 NUMERIC NOT NULL DEFAULT 12500,
  status_aktif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABEL PEMAKAIAN AIR BULANAN (Pencatatan Real-Time Staf Key Account)
CREATE TABLE IF NOT EXISTS pemakaian_air (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_pelanggan TEXT NOT NULL REFERENCES pelanggan_industri(id_pelanggan) ON DELETE CASCADE,
  periode_bulan TEXT NOT NULL, -- e.g. 'Januari', 'Februari', 'Maret', dsb.
  periode_tahun INTEGER NOT NULL, -- e.g. 2026
  tanggal_baca DATE NOT NULL DEFAULT CURRENT_DATE,
  meter_awal NUMERIC NOT NULL DEFAULT 0,
  meter_akhir NUMERIC NOT NULL DEFAULT 0,
  total_m3 NUMERIC GENERATED ALWAYS AS (meter_akhir - meter_awal) STORED,
  kuota_kontrak_m3 NUMERIC NOT NULL DEFAULT 5000,
  tagihan_estimasi NUMERIC NOT NULL DEFAULT 0,
  status_verifikasi TEXT NOT NULL DEFAULT 'Terverifikasi', -- 'Terverifikasi' | 'Menunggu Review' | 'Perlu Kalibrasi'
  catatan_petugas TEXT,
  foto_meter_url TEXT,
  nama_staf_pencatat TEXT NOT NULL DEFAULT 'Staf Key Account Aetra',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABEL HASIL LAB KUALITAS AIR HARIAN (Laboratorium Terakreditasi Aetra)
CREATE TABLE IF NOT EXISTS hasil_lab_harian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal_uji DATE NOT NULL DEFAULT CURRENT_DATE,
  waktu_sampling TEXT NOT NULL DEFAULT '08:00 WIB',
  lokasi_sampling TEXT NOT NULL, -- e.g. 'Reservoir Utama Cikokol', 'Offtake Jargas Cikupa Mas'
  ph NUMERIC NOT NULL, -- Ambang Baku Mutu Permenkes: 6.5 - 8.5
  kekeruhan_ntu NUMERIC NOT NULL, -- Ambang Baku Mutu: < 3.0 NTU
  sisa_khlor_mg_l NUMERIC NOT NULL, -- Ambang: 0.2 - 0.5 mg/L
  tds_mg_l NUMERIC NOT NULL, -- Ambang: < 300 mg/L
  suhu_celsius NUMERIC NOT NULL DEFAULT 27.5,
  e_coli_cfu INTEGER NOT NULL DEFAULT 0, -- Ambang: 0 CFU/100ml
  rasa_bau TEXT NOT NULL DEFAULT 'Tidak Berbau & Normal',
  status_kelayakan TEXT NOT NULL DEFAULT 'Memenuhi Standar Permenkes No. 2/2023',
  nama_analis_lab TEXT NOT NULL DEFAULT 'Tim QC Lab Kualitas Air Aetra',
  no_sertifikat_lab TEXT NOT NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABEL INFO PELAYANAN & PENGUMUMAN JARINGAN
CREATE TABLE IF NOT EXISTS info_pelayanan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul TEXT NOT NULL,
  tipe TEXT NOT NULL DEFAULT 'Pemeliharaan Jaringan', -- 'Pemeliharaan Jaringan' | 'Flushing Pipa' | 'Penyesuaian Tekanan' | 'Pemberitahuan Resmi'
  tingkat_urgensi TEXT NOT NULL DEFAULT 'Info', -- 'Normal' | 'Info' | 'Penting' | 'Darurat'
  tanggal_mulai TIMESTAMPTZ NOT NULL DEFAULT now(),
  tanggal_selesai TIMESTAMPTZ,
  wilayah_terdampak TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  status_aliran TEXT NOT NULL DEFAULT 'Normal Bertekanan Stabil', -- 'Normal Bertekanan Stabil' | 'Penurunan Tekanan Sementara' | 'Terganggu Terjadwal'
  solusi_mitigasi TEXT,
  pic_nama TEXT NOT NULL DEFAULT 'Key Account Management Aetra',
  pic_kontak TEXT NOT NULL DEFAULT '+62 21 5908888',
  status_publikasi BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABEL TIKET & PERMOHONAN LAYANAN PELANGGAN INDUSTRI
CREATE TABLE IF NOT EXISTS tiket_layanan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_pelanggan TEXT NOT NULL REFERENCES pelanggan_industri(id_pelanggan) ON DELETE CASCADE,
  perihal TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT 'Permintaan Kalibrasi Meter',
  pesan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Diproses', -- 'Terkirim' | 'Diproses' | 'Selesai'
  respon_petugas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Memberikan izin SELECT, INSERT, UPDATE untuk kemudahan prototipe & live access
-- =========================================================================

ALTER TABLE pelanggan_industri ENABLE ROW LEVEL SECURITY;
ALTER TABLE pemakaian_air ENABLE ROW LEVEL SECURITY;
ALTER TABLE hasil_lab_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_pelayanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiket_layanan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Pelanggan Industri" ON pelanggan_industri FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Pelanggan Industri" ON pelanggan_industri FOR ALL USING (true);

CREATE POLICY "Public Read Pemakaian Air" ON pemakaian_air FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Pemakaian Air" ON pemakaian_air FOR ALL USING (true);

CREATE POLICY "Public Read Hasil Lab" ON hasil_lab_harian FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Hasil Lab" ON hasil_lab_harian FOR ALL USING (true);

CREATE POLICY "Public Read Info Pelayanan" ON info_pelayanan FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Info Pelayanan" ON info_pelayanan FOR ALL USING (true);

CREATE POLICY "Public Read/Write Tiket Layanan" ON tiket_layanan FOR ALL USING (true);

-- =========================================================================
-- DATA AWAL (SEED DATA INDUSTRI TANGERANG)
-- =========================================================================

INSERT INTO pelanggan_industri (id_pelanggan, nama_perusahaan, bidang_usaha, alamat_kawasan, zona_distribusi, pic_nama, pic_telepon, email, no_meter, diameter_pipa, kuota_kontrak_m3, tarif_per_m3)
VALUES 
  ('AETRA-IND-001', 'PT Indofood CBP Sukses Makmur Tbk', 'Industri Makanan & Minuman', 'Kawasan Industri Cikupa Mas Blok A2 No. 8, Tangerang', 'Zona Cikupa - Balaraja', 'Ir. Budi Santoso (Utility Head)', '+62 812-8890-1122', 'utility.cikupa@indofood.co.id', 'MTR-CKP-00918', '6 inch (DN 150)', 15000, 12500),
  ('AETRA-IND-002', 'PT Mayora Indah Tbk', 'Industri Biskuit & Kembang Gula', 'Jl. Telesonic Ujung, Kawasan Industri Jatake, Tangerang', 'Zona Jatake - Pasar Kemis', 'Hendro Prasetyo (Plant Eng.)', '+62 813-7744-9988', 'eng.jatake@mayora.co.id', 'MTR-JTK-04821', '4 inch (DN 100)', 8500, 12500),
  ('AETRA-IND-003', 'PT Torabika Eka Semesta', 'Industri Pengolahan Kopi', 'Kawasan Industri Manis, Jl. Manis V No. 18, Tangerang', 'Zona Manis - Jatake', 'Siti Rahmawati (Facility Mgr)', '+62 811-9922-3344', 'facility.manis@torabika.com', 'MTR-MNS-01290', '4 inch (DN 100)', 7200, 12500),
  ('AETRA-IND-004', 'PT Gajah Tunggal Tbk', 'Industri Otomotif & Ban', 'Kawasan Industri Gajah Tunggal, Jatiuwung, Tangerang', 'Zona Distribusi Jatiuwung', 'Bambang Kusumo (VP Technical)', '+62 815-6677-8899', 'tech.plant@gt-tires.com', 'MTR-JTW-08172', '8 inch (DN 200)', 24000, 12500),
  ('AETRA-IND-005', 'PT Unilever Oleochemical', 'Industri Kimia & Pembersih', 'Kawasan Industri Balaraja Industrial Estate Kav. 12', 'Zona Balaraja Barat', 'Dewi Lestari (HSE Officer)', '+62 812-3355-7799', 'hse.balaraja@unilever.com', 'MTR-BLR-03120', '6 inch (DN 150)', 11000, 12500)
ON CONFLICT (id_pelanggan) DO NOTHING;
