import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'aetra_supabase_url';
const STORAGE_KEY_KEY = 'aetra_supabase_anon_key';

// Kredensial Resmi Supabase PT Aetra Air Tangerang
export const DEFAULT_SUPABASE_URL = 'https://seemzgfxtbhaabchbkuw.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZW16Z2Z4dGJoYWFiY2hia3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMTAzOTYsImV4cCI6MjEwNTc4NjM5Nn0.QX5L3AG0kR1WLEmYvGEGTYUoywqDOG4CxpjGpg8-w0o';

/**
 * Normalisasi URL Supabase agar selalu valid untuk SupabaseClient
 * (misal jika user menyalin URL dengan akhiran /rest/v1/ atau garis miring berlebih)
 */
export function cleanSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/rest\/v1\/?$/, '');
  url = url.replace(/\/+$/, '');
  return url;
}

export function getSavedSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  const finalUrl = cleanSupabaseUrl(storedUrl || envUrl || DEFAULT_SUPABASE_URL);
  const finalKey = (storedKey || envKey || DEFAULT_SUPABASE_ANON_KEY).trim();

  return {
    url: finalUrl,
    anonKey: finalKey
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_URL, cleanSupabaseUrl(url));
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    else localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

let supabaseInstance: SupabaseClient | null = null;
let lastConfigUrl = '';
let lastConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSavedSupabaseConfig();

  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  if (supabaseInstance && lastConfigUrl === url && lastConfigKey === anonKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, anonKey);
    lastConfigUrl = url;
    lastConfigKey = anonKey;
    return supabaseInstance;
  } catch (err) {
    console.error('Gagal menginisialisasi Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(rawUrl: string, rawKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = cleanSupabaseUrl(rawUrl);
    const anonKey = rawKey.trim();

    if (!url || !anonKey) {
      return { success: false, message: 'URL dan Anon Key harus diisi.' };
    }
    const testClient = createClient(url, anonKey);
    const { error } = await testClient.from('pelanggan_industri').select('count', { count: 'exact', head: true });

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "pelanggan_industri" does not exist')) {
        return {
          success: true,
          message: 'Terhubung ke Supabase! Namun tabel belum dibuat. Harap jalankan skrip supabase_schema.sql di SQL Editor Supabase.'
        };
      }
      return { success: false, message: `Error Supabase: ${error.message}` };
    }
    return { success: true, message: 'Koneksi ke database Supabase Aetra berhasil terverifikasi!' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Kesalahan jaringan';
    return { success: false, message: `Gagal terhubung: ${message}` };
  }
}
