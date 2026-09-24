import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'aetra_supabase_url';
const STORAGE_KEY_KEY = 'aetra_supabase_anon_key';

export function getSavedSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  return {
    url: storedUrl || envUrl || '',
    anonKey: storedKey || envKey || ''
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
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

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'URL dan Anon Key harus diisi.' };
    }
    const testClient = createClient(url.trim(), anonKey.trim());
    const { error } = await testClient.from('pelanggan_industri').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "pelanggan_industri" does not exist')) {
        return { 
          success: true, 
          message: 'Terhubung ke Supabase! Namun tabel belum dibuat. Harap jalankan script schema.sql di SQL Editor Supabase.' 
        };
      }
      return { success: false, message: `Error Supabase: ${error.message}` };
    }
    return { success: true, message: 'Koneksi ke database Supabase berhasil terverifikasi!' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Kesalahan jaringan';
    return { success: false, message: `Gagal terhubung: ${message}` };
  }
}
