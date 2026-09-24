import { PelangganIndustri, PemakaianAir, HasilLabHarian, InfoPelayanan, TiketLayanan } from '../types';

export const INITIAL_PELANGGAN: PelangganIndustri[] = [
  {
    id_pelanggan: 'AETRA-IND-001',
    nama_perusahaan: 'PT Indofood CBP Sukses Makmur Tbk',
    bidang_usaha: 'Industri Makanan & Minuman (Noodle & Snack Division)',
    alamat_kawasan: 'Kawasan Industri Cikupa Mas Blok A2 No. 8, Tangerang',
    zona_distribusi: 'Zona Cikupa - Balaraja (IPA Cikokol)',
    pic_nama: 'Ir. Budi Santoso',
    pic_telepon: '+62 812-8890-1122',
    email: 'utility.cikupa@indofood.co.id',
    no_meter: 'MTR-CKP-00918',
    password: 'indofood123',
    status_aktif: true,
    created_at: '2026-01-10T08:00:00Z'
  },
  {
    id_pelanggan: 'AETRA-IND-002',
    nama_perusahaan: 'PT Mayora Indah Tbk',
    bidang_usaha: 'Industri Biskuit & Kembang Gula',
    alamat_kawasan: 'Jl. Telesonic Ujung, Kawasan Industri Jatake, Tangerang',
    zona_distribusi: 'Zona Jatake - Pasar Kemis (IPA Sepatan)',
    pic_nama: 'Hendro Prasetyo, S.T.',
    pic_telepon: '+62 813-7744-9988',
    email: 'eng.jatake@mayora.co.id',
    no_meter: 'MTR-JTK-04821',
    password: 'mayora123',
    status_aktif: true,
    created_at: '2026-01-12T09:00:00Z'
  },
  {
    id_pelanggan: 'AETRA-IND-003',
    nama_perusahaan: 'PT Torabika Eka Semesta',
    bidang_usaha: 'Industri Pengolahan Kopi & Minuman Serbuk',
    alamat_kawasan: 'Kawasan Industri Manis, Jl. Manis V No. 18, Tangerang',
    zona_distribusi: 'Zona Manis - Jatake',
    pic_nama: 'Siti Rahmawati',
    pic_telepon: '+62 811-9922-3344',
    email: 'facility.manis@torabika.com',
    no_meter: 'MTR-MNS-01290',
    password: 'torabika123',
    status_aktif: true,
    created_at: '2026-01-15T10:00:00Z'
  },
  {
    id_pelanggan: 'AETRA-IND-004',
    nama_perusahaan: 'PT Gajah Tunggal Tbk',
    bidang_usaha: 'Industri Otomotif, Ban & Karet Sintetis',
    alamat_kawasan: 'Kawasan Industri Gajah Tunggal, Jatiuwung, Tangerang',
    zona_distribusi: 'Zona Jatiuwung Barat (Booster Station)',
    pic_nama: 'Bambang Kusumo',
    pic_telepon: '+62 815-6677-8899',
    email: 'tech.plant@gt-tires.com',
    no_meter: 'MTR-JTW-08172',
    password: 'gajah123',
    status_aktif: true,
    created_at: '2026-01-05T07:30:00Z'
  },
  {
    id_pelanggan: 'AETRA-IND-005',
    nama_perusahaan: 'PT Unilever Oleochemical',
    bidang_usaha: 'Industri Oleokimia & Bahan Baku Sabun',
    alamat_kawasan: 'Balaraja Industrial Estate Kav. 12, Tangerang',
    zona_distribusi: 'Zona Balaraja Barat',
    pic_nama: 'Dewi Lestari',
    pic_telepon: '+62 812-3355-7799',
    email: 'hse.balaraja@unilever.com',
    no_meter: 'MTR-BLR-03120',
    password: 'unilever123',
    status_aktif: true,
    created_at: '2026-01-18T11:00:00Z'
  }
];

export const INITIAL_PEMAKAIAN: PemakaianAir[] = [
  // AETRA-IND-001 (Indofood) - Tahap: Terverifikasi
  {
    id: 'pmk-001',
    id_pelanggan: 'AETRA-IND-001',
    periode_bulan: 'September',
    periode_tahun: 2026,
    tanggal_baca: '2026-09-20',
    meter_awal: 184520,
    meter_akhir: 198340,
    total_m3: 13820,
    status_progress: 'Terverifikasi',
    no_bpm: 'BPM/2026/09/CKP-001',
    tanggal_bpm: '2026-09-18',
    tanggal_verifikasi: '2026-09-21',
    catatan_petugas: 'Pembacaan meter berjalan lancar. Segel meter utuh dan akurat.',
    nama_staf_pencatat: 'Reza Fauzan (Key Account Field Tech)',
    created_at: '2026-09-20T14:30:00Z'
  },
  {
    id: 'pmk-002',
    id_pelanggan: 'AETRA-IND-001',
    periode_bulan: 'Agustus',
    periode_tahun: 2026,
    tanggal_baca: '2026-08-20',
    meter_awal: 170400,
    meter_akhir: 184520,
    total_m3: 14120,
    status_progress: 'Terverifikasi',
    no_bpm: 'BPM/2026/08/CKP-001',
    tanggal_bpm: '2026-08-18',
    tanggal_verifikasi: '2026-08-21',
    catatan_petugas: 'Kondisi flow meter normal, tidak ada deviasi tekanan.',
    nama_staf_pencatat: 'Reza Fauzan (Key Account Field Tech)',
    created_at: '2026-08-20T11:15:00Z'
  },
  {
    id: 'pmk-003',
    id_pelanggan: 'AETRA-IND-001',
    periode_bulan: 'Juli',
    periode_tahun: 2026,
    tanggal_baca: '2026-07-21',
    meter_awal: 156900,
    meter_akhir: 170400,
    total_m3: 13500,
    status_progress: 'Terverifikasi',
    no_bpm: 'BPM/2026/07/CKP-001',
    tanggal_bpm: '2026-07-19',
    tanggal_verifikasi: '2026-07-22',
    catatan_petugas: 'Sesuai jadwal rutin.',
    nama_staf_pencatat: 'Reza Fauzan (Key Account Field Tech)',
    created_at: '2026-07-21T09:00:00Z'
  },

  // AETRA-IND-002 (Mayora) - Tahap: Pembacaan Meter (Sedang proses verifikasi)
  {
    id: 'pmk-004',
    id_pelanggan: 'AETRA-IND-002',
    periode_bulan: 'September',
    periode_tahun: 2026,
    tanggal_baca: '2026-09-22',
    meter_awal: 92140,
    meter_akhir: 99880,
    total_m3: 7740,
    status_progress: 'Pembacaan Meter',
    no_bpm: 'BPM/2026/09/JTK-002',
    tanggal_bpm: '2026-09-20',
    catatan_petugas: 'Stand meter selesai dicatat di lokasi pabrik Jatake. Menunggu verifikasi supervisor.',
    nama_staf_pencatat: 'Dian Permana (Staf Key Account)',
    created_at: '2026-09-22T13:40:00Z'
  },
  {
    id: 'pmk-005',
    id_pelanggan: 'AETRA-IND-002',
    periode_bulan: 'Agustus',
    periode_tahun: 2026,
    tanggal_baca: '2026-08-21',
    meter_awal: 84300,
    meter_akhir: 92140,
    total_m3: 7840,
    status_progress: 'Terverifikasi',
    no_bpm: 'BPM/2026/08/JTK-002',
    tanggal_bpm: '2026-08-19',
    tanggal_verifikasi: '2026-08-22',
    catatan_petugas: 'Normal.',
    nama_staf_pencatat: 'Dian Permana (Staf Key Account)',
    created_at: '2026-08-21T14:10:00Z'
  },

  // AETRA-IND-003 (Torabika) - Tahap: Penerbitan BPM (Surat perintah baca meter terbit, teknisi akan menuju lokasi)
  {
    id: 'pmk-006',
    id_pelanggan: 'AETRA-IND-003',
    periode_bulan: 'September',
    periode_tahun: 2026,
    tanggal_baca: '2026-09-24',
    meter_awal: 54100,
    meter_akhir: 54100,
    total_m3: 0,
    status_progress: 'Penerbitan BPM',
    no_bpm: 'BPM/2026/09/MNS-003',
    tanggal_bpm: '2026-09-23',
    catatan_petugas: 'Surat Bukti Pembacaan Meter (BPM) telah diterbitkan kantor Aetra. Jadwal pencatatan hari ini.',
    nama_staf_pencatat: 'Budi Santoso, S.T. (Key Account Executive)',
    created_at: '2026-09-23T07:30:00Z'
  },
  {
    id: 'pmk-007',
    id_pelanggan: 'AETRA-IND-003',
    periode_bulan: 'Agustus',
    periode_tahun: 2026,
    tanggal_baca: '2026-08-22',
    meter_awal: 47580,
    meter_akhir: 54100,
    total_m3: 6520,
    status_progress: 'Terverifikasi',
    no_bpm: 'BPM/2026/08/MNS-003',
    tanggal_bpm: '2026-08-20',
    tanggal_verifikasi: '2026-08-23',
    catatan_petugas: 'Display meter digital terbaca jelas.',
    nama_staf_pencatat: 'Dian Permana (Staf Key Account)',
    created_at: '2026-08-22T10:20:00Z'
  },

  // AETRA-IND-004 (Gajah Tunggal) - Tahap: Terverifikasi
  {
    id: 'pmk-008',
    id_pelanggan: 'AETRA-IND-004',
    periode_bulan: 'September',
    periode_tahun: 2026,
    tanggal_baca: '2026-09-19',
    meter_awal: 412500,
    meter_akhir: 434900,
    total_m3: 22400,
    status_progress: 'Terverifikasi',
    no_bpm: 'BPM/2026/09/JTW-004',
    tanggal_bpm: '2026-09-17',
    tanggal_verifikasi: '2026-09-20',
    catatan_petugas: 'Pabrik ban beroperasi 3 shift, debit stabil di 3.8 bar.',
    nama_staf_pencatat: 'Ahmad Fauzi (Senior Key Account)',
    created_at: '2026-09-19T16:00:00Z'
  }
];

export const INITIAL_LAB_RESULTS: HasilLabHarian[] = [
  {
    id: 'lab-001',
    tanggal_uji: '2026-09-23',
    waktu_sampling: '07:30 WIB',
    lokasi_sampling: 'Offtake Jaringan Utama Kawasan Industri Cikupa & Jatake',
    ph: 7.35,
    kekeruhan_ntu: 0.38,
    sisa_khlor_mg_l: 0.36,
    tds_mg_l: 142,
    suhu_celsius: 27.2,
    e_coli_cfu: 0,
    rasa_bau: 'Tidak Berbau & Rasa Tawar Alami (Normal)',
    status_kelayakan: 'MEMENUHI SYARAT (Permenkes No. 2/2023)',
    nama_analis_lab: 'Nurul Hidayati, S.Si (Analis Kualitas Air)',
    no_sertifikat_lab: 'QA-AETRA/TGR/2026/09-0238',
    catatan: 'Hasil pengujian fisik, kimia, dan mikrobiologis memenuhi semua parameter baku mutu air minum nasional.',
    created_at: '2026-09-23T08:15:00Z'
  },
  {
    id: 'lab-002',
    tanggal_uji: '2026-09-22',
    waktu_sampling: '08:00 WIB',
    lokasi_sampling: 'Reservoir Distribusi IPA Sepatan Tangerang',
    ph: 7.28,
    kekeruhan_ntu: 0.42,
    sisa_khlor_mg_l: 0.34,
    tds_mg_l: 145,
    suhu_celsius: 27.5,
    e_coli_cfu: 0,
    rasa_bau: 'Tidak Berbau & Rasa Tawar Alami (Normal)',
    status_kelayakan: 'MEMENUHI SYARAT (Permenkes No. 2/2023)',
    nama_analis_lab: 'Nurul Hidayati, S.Si (Analis Kualitas Air)',
    no_sertifikat_lab: 'QA-AETRA/TGR/2026/09-0237',
    catatan: 'Desinfeksi optimal pada zona pipa transmisi primer.',
    created_at: '2026-09-22T08:45:00Z'
  },
  {
    id: 'lab-003',
    tanggal_uji: '2026-09-21',
    waktu_sampling: '07:45 WIB',
    lokasi_sampling: 'Pipa Distribusi Utama Balaraja Industrial Estate',
    ph: 7.42,
    kekeruhan_ntu: 0.35,
    sisa_khlor_mg_l: 0.38,
    tds_mg_l: 138,
    suhu_celsius: 27.1,
    e_coli_cfu: 0,
    rasa_bau: 'Tidak Berbau & Rasa Tawar Alami (Normal)',
    status_kelayakan: 'MEMENUHI SYARAT (Permenkes No. 2/2023)',
    nama_analis_lab: 'Nurul Hidayati, S.Si (Analis Kualitas Air)',
    no_sertifikat_lab: 'QA-AETRA/TGR/2026/09-0236',
    catatan: 'Aman untuk utilitas proses industri pangan dan farmasi.',
    created_at: '2026-09-21T08:30:00Z'
  }
];

export const INITIAL_INFO_PELAYANAN: InfoPelayanan[] = [
  {
    id: 'info-001',
    judul: 'Pemeliharaan Berkala Pompa Distribusi Booster Station Jatiuwung',
    tipe: 'Pemeliharaan Jaringan',
    tingkat_urgensi: 'Info',
    tanggal_mulai: '2026-09-25 22:00',
    tanggal_selesai: '2026-09-26 04:00',
    wilayah_terdampak: 'Kawasan Industri Jatake, Manis, dan Jatiuwung Barat',
    deskripsi: 'Pekerjaan preventif maintenance pompa transmisi zona barat. Dilakukan pada dini hari untuk meminimalkan dampak operasional pabrik.',
    status_aliran: 'Penurunan Tekanan Sementara',
    solusi_mitigasi: 'Pelanggan industri dihimbau mengoptimalkan pengisian ground water tank internal pabrik sebelum pukul 21:00 WIB. Layanan truk tangki darurat Aetra siaga 24 jam.',
    pic_nama: 'Ahmad Fauzi (Supervisor Distribusi Wilayah Barat)',
    pic_kontak: '+62 811-9988-7711',
    status_publikasi: true,
    created_at: '2026-09-22T10:00:00Z'
  },
  {
    id: 'info-002',
    judul: 'Flushing Rutin Pipa Transmisi Induk DN 400 Kawasan Industri Cikupa Mas',
    tipe: 'Flushing Pipa',
    tingkat_urgensi: 'Normal',
    tanggal_mulai: '2026-09-28 01:00',
    tanggal_selesai: '2026-09-28 04:30',
    wilayah_terdampak: 'Kawasan Industri Cikupa Mas Blok A, B, dan C',
    deskripsi: 'Pembersihan endapan pipa induk dengan sistem scouring berkecepatan tinggi demi menjaga kejernihan air minum sesuai Permenkes No. 2/2023.',
    status_aliran: 'Terganggu Terjadwal',
    solusi_mitigasi: 'Pasokan dialihkan melalui bypass valve sekunder selama pekerjaan berlangsung.',
    pic_nama: 'Reza Fauzan (Staf Operasional Jaringan)',
    pic_kontak: '+62 812-8877-6655',
    status_publikasi: true,
    created_at: '2026-09-21T15:00:00Z'
  }
];

export const INITIAL_TIKET: TiketLayanan[] = [
  {
    id: 'tkt-001',
    id_pelanggan: 'AETRA-IND-001',
    perihal: 'Permohonan Tera Ulang Kalibrasi Flow Meter Utama Pabrik',
    kategori: 'Kalibrasi & Akurasi Meter',
    pesan: 'Mohon dijadwalkan verifikasi dan kalibrasi bersama flow meter 6 inch menjelang audit tahunan ISO 14001 pada awal Oktober 2026.',
    status: 'Diproses',
    respon_petugas: 'Petugas kalibrasi instrumentasi Aetra dijadwalkan hadir bersama tim pabrik pada tanggal 28 September 2026 pukul 09:30 WIB.',
    created_at: '2026-09-21T11:20:00Z'
  }
];
