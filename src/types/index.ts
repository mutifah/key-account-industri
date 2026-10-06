export interface PelangganIndustri {
  id_pelanggan: string;
  nama_perusahaan: string;
  bidang_usaha: string;
  alamat_kawasan: string;
  zona_distribusi: string;
  pic_nama: string;
  pic_telepon: string;
  email: string;
  no_meter: string;
  password?: string;
  status_aktif: boolean;
  created_at?: string;
}

export type StatusProgressMeter = 'Penerbitan BPM' | 'Pembacaan Meter' | 'Terverifikasi';

// Backward compatibility alias
export type StatusVerifikasi = StatusProgressMeter;

export interface PemakaianAir {
  id: string;
  id_pelanggan: string;
  periode_bulan: string;
  periode_tahun: number;
  tanggal_baca: string;
  meter_awal: number;
  meter_akhir: number;
  total_m3: number;
  status_progress: StatusProgressMeter;
  no_bpm?: string;
  tanggal_bpm?: string;
  tanggal_verifikasi?: string;
  catatan_petugas?: string;
  foto_meter_url?: string;
  nama_staf_pencatat?: string;
  created_at?: string;
}

export type KategoriUjiLab =
  | 'Reservoar IPA'
  | 'Reservoar Booster'
  | 'Industri'
  | 'Reservoar'
  | 'Pompa Booster'
  | 'Uji Khusus Pabrik';

export interface HasilLabHarian {
  id: string;
  judul_dokumen?: string;
  kategori_lab: KategoriUjiLab; // 'Reservoar' | 'Industri' | 'Pompa Booster' | 'Uji Khusus Pabrik'
  id_pelanggan_khusus?: string; // ID Pelanggan jika uji khusus pabrik (personalized)
  nama_perusahaan_khusus?: string; // Nama perusahaan jika uji khusus
  tanggal_uji: string;
  waktu_sampling?: string;
  lokasi_sampling: string;
  nama_analis_lab?: string;
  no_sertifikat_lab: string;
  catatan?: string;
  pdf_url?: string;
  pdf_filename?: string;
  pdf_size?: string;
  status_kelayakan?: string;
  ph?: number; // Baku mutu: 6.5 - 8.5
  kekeruhan_ntu?: number; // Baku mutu: < 3.0 NTU
  sisa_khlor_mg_l?: number; // Baku mutu: 0.2 - 0.5 mg/L
  tds_mg_l?: number; // Baku mutu: < 300 mg/L
  suhu_celsius?: number;
  e_coli_cfu?: number; // Baku mutu: 0 CFU/100ml
  rasa_bau?: string;
  created_at?: string;
}

export type TipeInfoPelayanan = 
  | 'Pemadaman Aliran Air'
  | 'Perbaikan Pipa Darurat'
  | 'Pemeliharaan Jaringan' 
  | 'Flushing Pipa' 
  | 'Penyesuaian Tekanan' 
  | 'Pemberitahuan Resmi'
  | 'Pemberitahuan Tagihan'
  | 'Lain-lain';

export type StatusAliran = 
  | 'Normal Bertekanan Stabil' 
  | 'Penurunan Tekanan Sementara' 
  | 'Terganggu Terjadwal'
  | 'Pemadaman Sementara Terjadwal'
  | 'Penghentian Darurat';

export interface InfoPelayanan {
  id: string;
  judul: string;
  tipe: TipeInfoPelayanan;
  tingkat_urgensi: 'Normal' | 'Info' | 'Penting' | 'Darurat';
  tanggal_mulai: string;
  tanggal_selesai?: string;
  wilayah_terdampak: string;
  deskripsi: string;
  status_aliran: StatusAliran;
  solusi_mitigasi?: string;
  pic_nama: string;
  pic_kontak: string;
  status_publikasi: boolean;
  tampilkan_banner?: boolean;
  created_at?: string;
}

export type StatusTiketLayanan = 'Terkirim' | 'Diproses' | 'Diteruskan ke CC' | 'Selesai';

export type TingkatUrgensiTiket = 'Normal' | 'Sedang' | 'Tinggi' | 'Darurat';

export interface TiketLayanan {
  id: string;
  id_pelanggan: string;
  perihal: string;
  kategori: string;
  pesan: string;
  status: StatusTiketLayanan;
  respon_petugas?: string;
  created_at: string;

  // Tindak Lanjut Komplain & Eskalasi Divisi
  status_tindak_lanjut?: 'Belum Ditindaklanjuti' | 'Respon Langsung' | 'Diteruskan ke CC' | 'Selesai';
  no_tiket_cc?: string; // Nomor Tiket resmi Contact Center, e.g. CC-AETRA-2026-0891
  divisi_tujuan?: string; // e.g. 'Contact Center 24 Jam', 'Divisi Pemeliharaan Jaringan & Distribusi', 'Divisi Meter & Instrumentasi', 'Laboratorium Pengendalian Mutu Air'
  catatan_internal_cc?: string; // Instruksi penugasan internal untuk tim CC / tim lapangan
  urgensi?: TingkatUrgensiTiket;
  tanggal_tindak_lanjut?: string;
  nama_petugas_tindak_lanjut?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export interface StaffUser {
  id: string;
  nik: string;
  nama: string;
  email: string;
  jabatan: string;
  divisi: string;
  role: 'Key Account Executive' | 'Lab Quality Analyst' | 'Admin';
  avatar_initials: string;
  last_login?: string;
}
