import React from 'react';
import { Droplets, Database, GitBranch, PhoneCall, LogIn, LogOut, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PelangganIndustri } from '../types';
import { getSavedSupabaseConfig } from '../lib/supabase';

interface CustomerHeaderProps {
  currentCustomer?: PelangganIndustri | null;
  onLogoutCustomer?: () => void;
  onOpenDeployModal: () => void;
  onOpenHotlineModal: () => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  currentCustomer,
  onLogoutCustomer,
  onOpenDeployModal,
  onOpenHotlineModal
}) => {
  const { url } = getSavedSupabaseConfig();
  const isSupabaseConfigured = Boolean(url && url.startsWith('http'));

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Lockup */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  AETRA AIR TANGERANG
                </span>
                <span className="hidden sm:inline-flex items-center text-[10px] uppercase font-bold tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                  Portal Pelanggan Industri
                </span>
              </div>
              <span className="text-xs text-slate-400 hidden sm:block">
                Layanan Mandiri Rekap Meter, Tracking BPM & Mutu Lab Air Minum
              </span>
            </div>
          </Link>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Supabase Status */}
            <button
              onClick={onOpenDeployModal}
              title="Status Database Supabase"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden md:inline">
                {isSupabaseConfigured ? 'Database Online' : 'Database Setup'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Hotline Emergency */}
            <button
              onClick={onOpenHotlineModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hotline 24 Jam</span>
            </button>

            {/* If Customer Logged In: Show Customer Info & Logout */}
            {currentCustomer ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-white truncate max-w-[180px]">
                    {currentCustomer.nama_perusahaan}
                  </span>
                  <span className="text-[10px] text-cyan-300 font-mono">
                    {currentCustomer.id_pelanggan}
                  </span>
                </div>
                {onLogoutCustomer && (
                  <button
                    onClick={onLogoutCustomer}
                    title="Keluar dari akun pelanggan"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-slate-800 hover:bg-rose-950/80 hover:text-rose-200 text-slate-300 border border-slate-700 hover:border-rose-800 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                )}
              </div>
            ) : (
              /* Link to Staff Portal */
              <Link
                to="/staff"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 border border-slate-700 transition-all ml-1 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Portal Staf</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
