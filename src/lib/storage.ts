import { PelangganIndustri, PemakaianAir, HasilLabHarian, InfoPelayanan, TiketLayanan } from '../types';
import { INITIAL_PELANGGAN, INITIAL_PEMAKAIAN, INITIAL_LAB_RESULTS, INITIAL_INFO_PELAYANAN, INITIAL_TIKET } from './mockData';
import { getSupabaseClient } from './supabase';

const LS_PELANGGAN = 'aetra_db_pelanggan';
const LS_PEMAKAIAN = 'aetra_db_pemakaian';
const LS_LAB = 'aetra_db_lab';
const LS_INFO = 'aetra_db_info';
const LS_TIKET = 'aetra_db_tiket';

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

function setLocal<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage`, e);
  }
}

// Ensure initial seed in localStorage
export function initializeStorage() {
  if (typeof window === 'undefined') return;

  // Auto-upgrade storage if old schema without status_progress or customer passwords
  const MIGRATION_KEY = 'aetra_migrated_v2_progress';
  if (localStorage.getItem(MIGRATION_KEY) !== 'true') {
    setLocal(LS_PELANGGAN, INITIAL_PELANGGAN);
    setLocal(LS_PEMAKAIAN, INITIAL_PEMAKAIAN);
    localStorage.setItem(MIGRATION_KEY, 'true');
  }

  if (!localStorage.getItem(LS_PELANGGAN)) {
    setLocal(LS_PELANGGAN, INITIAL_PELANGGAN);
  }
  if (!localStorage.getItem(LS_PEMAKAIAN)) {
    setLocal(LS_PEMAKAIAN, INITIAL_PEMAKAIAN);
  }
  if (!localStorage.getItem(LS_LAB)) {
    setLocal(LS_LAB, INITIAL_LAB_RESULTS);
  }
  if (!localStorage.getItem(LS_INFO)) {
    setLocal(LS_INFO, INITIAL_INFO_PELAYANAN);
  }
  if (!localStorage.getItem(LS_TIKET)) {
    setLocal(LS_TIKET, INITIAL_TIKET);
  }
}

// 1. PELANGGAN INDUSTRI
export async function getPelangganList(): Promise<PelangganIndustri[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('pelanggan_industri').select('*').order('id_pelanggan', { ascending: true });
      if (!error && data && data.length > 0) {
        setLocal(LS_PELANGGAN, data);
        return data as PelangganIndustri[];
      }
    } catch (e) {
      console.warn('Supabase fetch error, fallback to local', e);
    }
  }
  return getLocal<PelangganIndustri[]>(LS_PELANGGAN, INITIAL_PELANGGAN);
}

export async function savePelanggan(item: PelangganIndustri): Promise<PelangganIndustri> {
  const current = getLocal<PelangganIndustri[]>(LS_PELANGGAN, INITIAL_PELANGGAN);
  const exists = current.some(p => p.id_pelanggan === item.id_pelanggan);
  const updated = exists 
    ? current.map(p => p.id_pelanggan === item.id_pelanggan ? item : p)
    : [item, ...current];
  setLocal(LS_PELANGGAN, updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('pelanggan_industri').upsert(item);
    } catch (e) {
      console.error('Supabase upsert error', e);
    }
  }
  return item;
}

export async function deletePelanggan(id_pelanggan: string): Promise<boolean> {
  const current = getLocal<PelangganIndustri[]>(LS_PELANGGAN, INITIAL_PELANGGAN);
  const filtered = current.filter(p => p.id_pelanggan !== id_pelanggan);
  setLocal(LS_PELANGGAN, filtered);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('pelanggan_industri').delete().eq('id_pelanggan', id_pelanggan);
    } catch (e) {
      console.error('Supabase delete error', e);
    }
  }
  return true;
}

// 2. PEMAKAIAN AIR BULANAN
export async function getPemakaianList(idPelanggan?: string): Promise<PemakaianAir[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase.from('pemakaian_air').select('*').order('created_at', { ascending: false });
      if (idPelanggan) {
        query = query.eq('id_pelanggan', idPelanggan);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as PemakaianAir[];
      }
    } catch (e) {
      console.warn('Supabase fetch pemakaian error, fallback to local', e);
    }
  }

  const all = getLocal<PemakaianAir[]>(LS_PEMAKAIAN, INITIAL_PEMAKAIAN);
  if (idPelanggan) {
    return all.filter(p => p.id_pelanggan.toLowerCase() === idPelanggan.toLowerCase());
  }
  return all;
}

export async function savePemakaian(item: Omit<PemakaianAir, 'id'> & { id?: string }): Promise<PemakaianAir> {
  const current = getLocal<PemakaianAir[]>(LS_PEMAKAIAN, INITIAL_PEMAKAIAN);
  const record: PemakaianAir = {
    ...item,
    id: item.id || `pmk-${Date.now()}`,
    total_m3: item.meter_akhir - item.meter_awal,
    created_at: item.created_at || new Date().toISOString()
  };

  const exists = current.some(p => p.id === record.id);
  const updated = exists
    ? current.map(p => p.id === record.id ? record : p)
    : [record, ...current];
  setLocal(LS_PEMAKAIAN, updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('pemakaian_air').upsert(record);
    } catch (e) {
      console.error('Supabase upsert pemakaian error', e);
    }
  }
  return record;
}

export async function saveBatchPemakaian(items: (Omit<PemakaianAir, 'id'> & { id?: string })[]): Promise<PemakaianAir[]> {
  const current = getLocal<PemakaianAir[]>(LS_PEMAKAIAN, INITIAL_PEMAKAIAN);
  const newRecords: PemakaianAir[] = items.map((item, idx) => ({
    ...item,
    id: item.id || `pmk-batch-${Date.now()}-${idx}`,
    total_m3: Math.max(0, item.meter_akhir - item.meter_awal),
    created_at: item.created_at || new Date().toISOString()
  }));

  // Merge into current list
  let updated = [...current];
  newRecords.forEach(rec => {
    const idx = updated.findIndex(p =>
      (rec.id && p.id === rec.id) ||
      (p.id_pelanggan === rec.id_pelanggan && p.periode_bulan === rec.periode_bulan && p.periode_tahun === rec.periode_tahun)
    );
    if (idx >= 0) {
      updated[idx] = rec;
    } else {
      updated.unshift(rec);
    }
  });

  setLocal(LS_PEMAKAIAN, updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('pemakaian_air').upsert(newRecords);
    } catch (e) {
      console.error('Supabase batch upsert error', e);
    }
  }

  return newRecords;
}

export async function deletePemakaian(id: string): Promise<boolean> {
  const current = getLocal<PemakaianAir[]>(LS_PEMAKAIAN, INITIAL_PEMAKAIAN);
  const filtered = current.filter(p => p.id !== id);
  setLocal(LS_PEMAKAIAN, filtered);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('pemakaian_air').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete error', e);
    }
  }
  return true;
}

// 3. HASIL LAB HARIAN
export async function getLabResults(): Promise<HasilLabHarian[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('hasil_lab_harian').select('*').order('tanggal_uji', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocal(LS_LAB, data);
        return data as HasilLabHarian[];
      }
    } catch (e) {
      console.warn('Supabase fetch lab error, fallback to local', e);
    }
  }
  return getLocal<HasilLabHarian[]>(LS_LAB, INITIAL_LAB_RESULTS);
}

export async function saveLabResult(item: Omit<HasilLabHarian, 'id'> & { id?: string }): Promise<HasilLabHarian> {
  const current = getLocal<HasilLabHarian[]>(LS_LAB, INITIAL_LAB_RESULTS);
  const record: HasilLabHarian = {
    ...item,
    id: item.id || `lab-${Date.now()}`,
    created_at: item.created_at || new Date().toISOString()
  };

  const exists = current.some(l => l.id === record.id);
  const updated = exists 
    ? current.map(l => l.id === record.id ? record : l)
    : [record, ...current];
  setLocal(LS_LAB, updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('hasil_lab_harian').upsert(record);
    } catch (e) {
      console.error('Supabase upsert lab error', e);
    }
  }
  return record;
}

export async function deleteLabResult(id: string): Promise<boolean> {
  const current = getLocal<HasilLabHarian[]>(LS_LAB, INITIAL_LAB_RESULTS);
  const filtered = current.filter(l => l.id !== id);
  setLocal(LS_LAB, filtered);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('hasil_lab_harian').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete error', e);
    }
  }
  return true;
}

// 4. INFO PELAYANAN
export async function getInfoPelayanan(): Promise<InfoPelayanan[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('info_pelayanan').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocal(LS_INFO, data);
        return data as InfoPelayanan[];
      }
    } catch (e) {
      console.warn('Supabase fetch info error, fallback to local', e);
    }
  }
  return getLocal<InfoPelayanan[]>(LS_INFO, INITIAL_INFO_PELAYANAN);
}

export async function saveInfoPelayanan(item: Omit<InfoPelayanan, 'id'> & { id?: string }): Promise<InfoPelayanan> {
  const current = getLocal<InfoPelayanan[]>(LS_INFO, INITIAL_INFO_PELAYANAN);
  const record: InfoPelayanan = {
    ...item,
    id: item.id || `info-${Date.now()}`,
    created_at: item.created_at || new Date().toISOString()
  };

  const exists = current.some(i => i.id === record.id);
  const updated = exists 
    ? current.map(i => i.id === record.id ? record : i)
    : [record, ...current];
  setLocal(LS_INFO, updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('info_pelayanan').upsert(record);
    } catch (e) {
      console.error('Supabase upsert info error', e);
    }
  }
  return record;
}

export async function deleteInfoPelayanan(id: string): Promise<boolean> {
  const current = getLocal<InfoPelayanan[]>(LS_INFO, INITIAL_INFO_PELAYANAN);
  const filtered = current.filter(i => i.id !== id);
  setLocal(LS_INFO, filtered);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('info_pelayanan').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete error', e);
    }
  }
  return true;
}

// 5. TIKET LAYANAN
export async function getTiketLayanan(idPelanggan?: string): Promise<TiketLayanan[]> {
  const current = getLocal<TiketLayanan[]>(LS_TIKET, INITIAL_TIKET);
  if (idPelanggan) {
    return current.filter(t => t.id_pelanggan.toLowerCase() === idPelanggan.toLowerCase());
  }
  return current;
}

export async function createTiketLayanan(tiket: Omit<TiketLayanan, 'id' | 'created_at'>): Promise<TiketLayanan> {
  const current = getLocal<TiketLayanan[]>(LS_TIKET, INITIAL_TIKET);
  const newTiket: TiketLayanan = {
    ...tiket,
    id: `tkt-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  const updated = [newTiket, ...current];
  setLocal(LS_TIKET, updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('tiket_layanan').insert(newTiket);
    } catch (e) {
      console.error('Supabase insert tiket error', e);
    }
  }
  return newTiket;
}

export async function resetDemoData() {
  setLocal(LS_PELANGGAN, INITIAL_PELANGGAN);
  setLocal(LS_PEMAKAIAN, INITIAL_PEMAKAIAN);
  setLocal(LS_LAB, INITIAL_LAB_RESULTS);
  setLocal(LS_INFO, INITIAL_INFO_PELAYANAN);
  setLocal(LS_TIKET, INITIAL_TIKET);
}
