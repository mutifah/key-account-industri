-- =========================================================================
-- PT AETRA AIR TANGERANG - SUPABASE DATABASE SCHEMA & INITIAL DATA
-- Jalankan skrip ini langsung di menu "SQL Editor" pada dashboard Supabase
-- =========================================================================

-- 1. Tabel Pelanggan Industri Key Account
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

-- 2. Tabel Pemakaian Air Bulanan & Tracking Progress (BPM -> Baca -> Terverifikasi)
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

-- 3. Tabel Hasil Pengujian Mutu Laboratorium Harian
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

-- 4. Tabel Pengumuman Info Pelayanan & Pasokan Air
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

-- =========================================================================
-- AKTIFKAN ROW LEVEL SECURITY (RLS) & POLICY AKSES PUBLIK / API ANON
-- =========================================================================
ALTER TABLE pelanggan_industri ENABLE ROW LEVEL SECURITY;
ALTER TABLE pemakaian_air ENABLE ROW LEVEL SECURITY;
ALTER TABLE hasil_lab_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_pelayanan ENABLE ROW LEVEL SECURITY;

-- Izinkan akses read & write via client anon key
CREATE POLICY "Public Read Pelanggan" ON pelanggan_industri FOR SELECT USING (true);
CREATE POLICY "Public Manage Pelanggan" ON pelanggan_industri FOR ALL USING (true);

CREATE POLICY "Public Read Pemakaian" ON pemakaian_air FOR SELECT USING (true);
CREATE POLICY "Public Manage Pemakaian" ON pemakaian_air FOR ALL USING (true);

CREATE POLICY "Public Read Lab" ON hasil_lab_harian FOR SELECT USING (true);
CREATE POLICY "Public Manage Lab" ON hasil_lab_harian FOR ALL USING (true);

CREATE POLICY "Public Read Info" ON info_pelayanan FOR SELECT USING (true);
CREATE POLICY "Public Manage Info" ON info_pelayanan FOR ALL USING (true);

-- =========================================================================
-- DATA AWAL (SEED DATA) RESMI PT AETRA AIR TANGERANG
-- =========================================================================

-- Seed Pelanggan Industri Key Account
INSERT INTO pelanggan_industri (id_pelanggan, nama_perusahaan, bidang_usaha, alamat_kawasan, zona_distribusi, pic_nama, pic_telepon, email, no_meter, password)
VALUES 
  ('AETRA-IND-001', 'PT Indofood CBP Sukses Makmur Tbk', 'Industri Makanan & Minuman', 'Kawasan Industri Cikupa Mas Blok A2 No. 8, Tangerang', 'Zona Cikupa - Balaraja (IPA Cikokol)', 'Ir. Hendra Gunawan', '+62 812-8890-1122', 'utility.factory@indofood.co.id', 'MTR-CKP-00918', 'indofood123'),
  ('AETRA-IND-002', 'PT Mayora Indah Tbk (Plant Jatake)', 'Industri Biskuit & Kembang Gula', 'Jl. Telesonic Ujung No. 10, Kawasan Industri Jatake, Tangerang', 'Zona Jatake - Pasar Kemis (IPA Sepatan)', 'Bambang Sudiro, ST', '+62 811-9988-345', 'facility.jatake@mayora.co.id', 'MTR-JTK-04512', 'mayora123'),
  ('AETRA-IND-003', 'PT Torabika Eka Semesta', 'Industri Pengolahan Kopi & Minuman Sachet', 'Jl. Raya Serang Km 12.5, Cikupa, Kabupaten Tangerang', 'Zona Cikupa - Balaraja (IPA Cikokol)', 'Drs. Agus Haryanto', '+62 813-7766-5544', 'maintenance@torabika.com', 'MTR-CKP-00344', 'torabika123'),
  ('AETRA-IND-004', 'PT Gajah Tunggal Tbk (Plant Tire)', 'Industri Otomotif & Ban Kendaraan', 'Jl. Gajah Tunggal No. 1, Jatiuwung, Tangerang', 'Zona Jatiuwung Barat (Booster Station)', 'Rudi Hermawan, MT', '+62 815-4433-2211', 'boiler.plant@gt-tires.com', 'MTR-JTW-09101', 'gajah123'),
  ('AETRA-IND-005', 'PT Unilever Indonesia Tbk (Distribution Center)', 'Pusat Logistik & Manufaktur Personal Care', 'Kawasan Industri Manis Jl. Manis V No. 3, Tangerang', 'Zona Manis - Jatake', 'Siti Rahmadani, S.Si', '+62 812-3344-9988', 'hse.tangerang@unilever.com', 'MTR-MNS-01289', 'unilever123')
ON CONFLICT (id_pelanggan) DO NOTHING;

-- Seed Pemakaian Air dengan Status Progress 3 Tahap
INSERT INTO pemakaian_air (id, id_pelanggan, periode_bulan, periode_tahun, tanggal_baca, no_bpm, tanggal_bpm, tanggal_verifikasi, meter_awal, meter_akhir, total_m3, status_progress, catatan_petugas, nama_staf_pencatat)
VALUES
  ('pmk-001', 'AETRA-IND-001', 'September', 2026, '2026-09-22', 'BPM/2026/09/CKP-001', '2026-09-18', '2026-09-22', 124500, 131250, 6750, 'Terverifikasi', 'Pemeriksaan bersama PIC pabrik, meter fisik bekerja optimal dan segel utuh.', 'Deni Prasetyo (Key Account Officer)'),
  ('pmk-002', 'AETRA-IND-002', 'September', 2026, '2026-09-21', 'BPM/2026/09/JTK-045', '2026-09-18', NULL, 98400, 102900, 4500, 'Pembacaan Meter', 'Stand tercatat oleh petugas lapangan, menunggu approval supervisor untuk verifikasi.', 'Suryanto (Petugas Lapangan)'),
  ('pmk-003', 'AETRA-IND-003', 'September', 2026, '2026-09-20', 'BPM/2026/09/CKP-003', '2026-09-20', NULL, 78100, 81900, 3800, 'Penerbitan BPM', 'Surat Bukti Pembacaan Meter telah terbit, menunggu jadwal pembacaan stand fisik.', 'Deni Prasetyo (Key Account Officer)'),
  ('pmk-004', 'AETRA-IND-004', 'September', 2026, '2026-09-22', 'BPM/2026/09/JTW-091', '2026-09-18', '2026-09-22', 215000, 227500, 12500, 'Terverifikasi', 'Pabrik beroperasi dengan kapasitas optimal, data tervalidasi.', 'Deni Prasetyo (Key Account Officer)'),
  ('pmk-005', 'AETRA-IND-005', 'September', 2026, '2026-09-21', 'BPM/2026/09/MNS-012', '2026-09-18', '2026-09-21', 45200, 47350, 2150, 'Terverifikasi', 'Konsumsi air normal sesuai tren distribusi bulanan.', 'Suryanto (Petugas Lapangan)')
ON CONFLICT (id) DO NOTHING;

-- Seed Data Pengujian Kualitas Air Laboratorium
INSERT INTO hasil_lab_harian (id, tanggal_uji, waktu_sampling, lokasi_sampling, ph, kekeruhan_ntu, sisa_khlor_mg_l, tds_mg_l, suhu_celsius, e_coli_cfu, rasa_bau, status_kelayakan, nama_analis_lab, no_sertifikat_lab, catatan)
VALUES
  ('lab-001', '2026-09-23', '08:00 WIB', 'Outfall Distribusi Utama IPA Cikokol (Jalur Industri)', 7.28, 0.42, 0.48, 142, 27.2, 0, 'Normal & Segar', 'Memenuhi Standar Permenkes No. 2/2023', 'apt. Rina Kartika, S.Farm', 'LAB-AETRA-2026-092301', 'Kualitas air sangat prima, siap untuk industri makanan dan farmasi.'),
  ('lab-002', '2026-09-22', '08:30 WIB', 'Pipa Transmisi Utama Offtake Jatake (Pintu 1 Kawasan)', 7.15, 0.51, 0.42, 148, 27.5, 0, 'Normal & Segar', 'Memenuhi Standar Permenkes No. 2/2023', 'Ahmad Farhan, ST', 'LAB-AETRA-2026-092202', 'Kadar sisa khlor stabil menjamin proteksi mikrobiologis pipa transmisi.')
ON CONFLICT (id) DO NOTHING;

-- Seed Info Pelayanan Publikasi
INSERT INTO info_pelayanan (id, judul, tipe, tingkat_urgensi, tanggal_mulai, tanggal_selesai, wilayah_terdampak, deskripsi, status_aliran, solusi_mitigasi, pic_nama, pic_kontak, status_publikasi)
VALUES
  ('info-001', 'Pemeliharaan Preventif Pompa Distribusi Utama IPA Cikokol', 'Pemeliharaan Jaringan', 'Penting', '2026-09-25T01:00:00Z', '2026-09-25T05:00:00Z', 'Kawasan Industri Cikupa Mas & Balaraja Timur', 'Pekerjaan berkala peningkatan keandalan suplai air industri. Tekanan air berpotensi menurun sementara pada dini hari.', 'Tekanan Menurun Sementara', 'Aetra menyiagakan armada truk tangki air bersih darurat dan booster pump cadangan.', 'Fajar Nugraha (Kepala Divisi Transmisi)', '+62 811-2233-4455', true),
  ('info-002', 'Flushing & Pembersihan Pipa Transmisi Jalur Jatake', 'Flushing Pipa', 'Info', '2026-09-24T23:00:00Z', '2026-09-25T03:00:00Z', 'Kawasan Industri Manis & Jatake Barat', 'Pembersihan pipa transmisi untuk mempertahankan standar kejernihan air bersih tingkat tinggi.', 'Normal Terkendali', 'Pekerjaan dialihkan ke pipa bypass interkoneksi.', 'Tim Jaringan Aetra', '+62 21 5908888', true)
ON CONFLICT (id) DO NOTHING;
