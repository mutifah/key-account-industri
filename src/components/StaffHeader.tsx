import React from 'react';
import { Droplets, Database, LogOut, ExternalLink, ShieldCheck, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StaffUser } from '../types';
import { getSavedSupabaseConfig } from '../lib/supabase';

interface StaffHeaderProps {
  staffUser: StaffUser | null;
  onLogout: () => void;
  onOpenDeployModal: () => void;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({
  staffUser,
  onLogout,
  onOpenDeployModal
}) => {
  const { url } = getSavedSupabaseConfig();
  const isSupabaseConfigured = Boolean(url && url.startsWith('http'));

  return (
    <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Lockup Internal */}
          <div className="flex items-center gap-3">
            <div className="h-10 px-2 py-1 bg-white rounded-xl shadow-md flex items-center justify-center shrink-0">
              <img src="/aetra-logo.png" alt="Aetra Air Tangerang" className="h-8 w-auto object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  AETRA AIR TANGERANG
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  Internal Staf
                </span>
              </div>
              <span className="text-xs text-slate-400 hidden sm:block">
                Sistem Administrasi Meter Industri, Mutu Lab & Jaringan Terpadu
              </span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Supabase Status */}
            <button
              onClick={onOpenDeployModal}
              title="Status Supabase & Deployment"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden md:inline">
                {isSupabaseConfigured ? 'Database Connected' : 'DB Config'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </button>

            {/* Switch to Customer Portal (External view) */}
            <Link
              to="/"
              title="Buka Halaman Portal Pelanggan Industri"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <ExternalLink className="w-3 h-3 text-cyan-400" />
              <span>Halaman Pelanggan</span>
            </Link>

            {/* Staff Profile Pill */}
            {staffUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-xs">
                  {staffUser.avatar_initials || 'ST'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-200 leading-tight">
                    {staffUser.nama}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {staffUser.nik} · {staffUser.role}
                  </span>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Keluar dari sesi Staf Key Account"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-800/60 transition-colors ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
