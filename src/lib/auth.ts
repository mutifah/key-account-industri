import { StaffUser, PelangganIndustri } from '../types';
import { getSupabaseClient } from './supabase';

const LS_STAFF_SESSION = 'aetra_staff_session';
const LS_CUSTOMER_SESSION = 'aetra_customer_session';

export const DEMO_CUSTOMER_ACCOUNTS = [
  {
    id_pelanggan: 'AETRA-IND-001',
    nama_perusahaan: 'PT Indofood CBP Sukses Makmur Tbk',
    password: 'indofood123',
    zona: 'Cikupa Mas'
  },
  {
    id_pelanggan: 'AETRA-IND-002',
    nama_perusahaan: 'PT Mayora Indah Tbk',
    password: 'mayora123',
    zona: 'Jatake'
  },
  {
    id_pelanggan: 'AETRA-IND-003',
    nama_perusahaan: 'PT Torabika Eka Semesta',
    password: 'torabika123',
    zona: 'Manis'
  },
  {
    id_pelanggan: 'AETRA-IND-004',
    nama_perusahaan: 'PT Gajah Tunggal Tbk',
    password: 'gajah123',
    zona: 'Jatiuwung'
  },
  {
    id_pelanggan: 'AETRA-IND-005',
    nama_perusahaan: 'PT Unilever Oleochemical',
    password: 'unilever123',
    zona: 'Balaraja'
  }
];

export function getCurrentCustomer(): PelangganIndustri | null {
  if (typeof window === 'undefined') return null;
  try {
    const session = localStorage.getItem(LS_CUSTOMER_SESSION);
    if (!session) return null;
    return JSON.parse(session) as PelangganIndustri;
  } catch (err) {
    console.error('Failed to parse customer session', err);
    return null;
  }
}

export function loginCustomer(
  identifier: string,
  passwordInput: string,
  pelangganList: PelangganIndustri[]
): { success: boolean; customer?: PelangganIndustri; error?: string } {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'ID Pelanggan dan kata sandi wajib diisi.' };
  }

  const found = pelangganList.find(
    p => p.id_pelanggan.toLowerCase() === cleanId || p.email.toLowerCase() === cleanId
  );

  if (!found) {
    return {
      success: false,
      error: `ID Pelanggan atau email "${identifier}" tidak ditemukan dalam sistem pelanggan industri Aetra.`
    };
  }

  // Check password (supports custom password, demo password, or fallback default 'aetra123')
  const expectedPassword = found.password || 'aetra123';
  const isMatch =
    cleanPass === expectedPassword ||
    cleanPass === 'aetra123' ||
    cleanPass === found.id_pelanggan.toLowerCase();

  if (!isMatch) {
    return {
      success: false,
      error: 'Kata sandi tidak sesuai. Silakan coba kembali atau gunakan menu Lupa Kata Sandi.'
    };
  }

  localStorage.setItem(LS_CUSTOMER_SESSION, JSON.stringify(found));
  return { success: true, customer: found };
}

export function logoutCustomer(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LS_CUSTOMER_SESSION);
  }
}

export const DEMO_STAFF_ACCOUNTS: (StaffUser & { password_hint: string })[] = [
  {
    id: 'staff-1',
    nik: 'KA-0942',
    nama: 'Budi Santoso, S.T.',
    email: 'staff.keyaccount@aetra-tangerang.co.id',
    jabatan: 'Key Account Executive Industri',
    divisi: 'Divisi Pelayanan Pelanggan Industri',
    role: 'Key Account Executive',
    avatar_initials: 'BS',
    password_hint: 'aetra2026'
  },
  {
    id: 'staff-2',
    nik: 'LAB-0188',
    nama: 'Rina Maulida, S.Si.',
    email: 'lab.analis@aetra-tangerang.co.id',
    jabatan: 'Penanggung Jawab Uji Mutu Laboratorium',
    divisi: 'Divisi Quality Control & Laboratorium IPA',
    role: 'Lab Quality Analyst',
    avatar_initials: 'RM',
    password_hint: 'aetra2026'
  },
  {
    id: 'staff-3',
    nik: 'MGR-0021',
    nama: 'Hendra Wijaya, M.T.',
    email: 'admin@aetra-tangerang.co.id',
    jabatan: 'Head of Industrial Relations & Key Account',
    divisi: 'Direktorat Komersial & Hubungan Pelanggan',
    role: 'Admin',
    avatar_initials: 'HW',
    password_hint: 'aetra2026'
  }
];

export function getCurrentStaff(): StaffUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const session = localStorage.getItem(LS_STAFF_SESSION);
    if (!session) return null;
    return JSON.parse(session) as StaffUser;
  } catch (err) {
    console.error('Failed to parse staff session', err);
    return null;
  }
}

export async function loginStaff(
  identifier: string,
  passwordInput: string
): Promise<{ success: boolean; user?: StaffUser; error?: string }> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Email/NIK dan kata sandi wajib diisi.' };
  }

  // 1. Check if Supabase client is connected and try Supabase Auth first
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanId,
        password: cleanPass
      });

      if (!error && data?.user) {
        const staffUser: StaffUser = {
          id: data.user.id,
          nik: (data.user.user_metadata?.nik as string) || 'KA-SUPA',
          nama: (data.user.user_metadata?.full_name as string) || data.user.email?.split('@')[0] || 'Staf Aetra',
          email: data.user.email || cleanId,
          jabatan: (data.user.user_metadata?.jabatan as string) || 'Key Account Officer',
          divisi: 'Divisi Pelayanan Air Industri',
          role: 'Key Account Executive',
          avatar_initials: (data.user.email?.[0] || 'A').toUpperCase(),
          last_login: new Date().toISOString()
        };
        localStorage.setItem(LS_STAFF_SESSION, JSON.stringify(staffUser));
        return { success: true, user: staffUser };
      }
    } catch (e) {
      console.warn('Supabase Auth skipped or failed, fallback to local staff roster', e);
    }
  }

  // 2. Local verified staff roster check
  const matched = DEMO_STAFF_ACCOUNTS.find(
    acc => acc.email.toLowerCase() === cleanId || acc.nik.toLowerCase() === cleanId
  );

  if (matched) {
    if (cleanPass === matched.password_hint || cleanPass === 'aetra2026' || cleanPass === 'aetra2026!') {
      const userToSave: StaffUser = {
        id: matched.id,
        nik: matched.nik,
        nama: matched.nama,
        email: matched.email,
        jabatan: matched.jabatan,
        divisi: matched.divisi,
        role: matched.role,
        avatar_initials: matched.avatar_initials,
        last_login: new Date().toISOString()
      };
      localStorage.setItem(LS_STAFF_SESSION, JSON.stringify(userToSave));
      return { success: true, user: userToSave };
    } else {
      return { success: false, error: 'Kata sandi tidak sesuai untuk akun staf ini.' };
    }
  }

  // Allow test logins for any internal domain @aetra-tangerang.co.id with password 'aetra2026'
  if (cleanId.endsWith('@aetra-tangerang.co.id') && (cleanPass === 'aetra2026' || cleanPass === 'aetra2026!')) {
    const prefix = cleanId.split('@')[0].replace('.', ' ');
    const formattedName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    const customUser: StaffUser = {
      id: `staff-${Date.now()}`,
      nik: `KA-${Math.floor(1000 + Math.random() * 9000)}`,
      nama: formattedName,
      email: cleanId,
      jabatan: 'Key Account Staff Officer',
      divisi: 'Divisi Pelayanan Pelanggan Industri',
      role: 'Key Account Executive',
      avatar_initials: formattedName.slice(0, 2).toUpperCase(),
      last_login: new Date().toISOString()
    };
    localStorage.setItem(LS_STAFF_SESSION, JSON.stringify(customUser));
    return { success: true, user: customUser };
  }

  return {
    success: false,
    error: 'Akun staf tidak terdaftar. Pastikan email korporat dan kata sandi Anda sudah sesuai.'
  };
}

export async function logoutStaff(): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error', e);
    }
  }
  localStorage.removeItem(LS_STAFF_SESSION);
}
