import React, { useState, useEffect } from 'react';
import { CustomerHeader } from '../components/CustomerHeader';
import { CustomerPortal } from '../components/CustomerPortal';
import { CustomerLogin } from '../components/CustomerLogin';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { Shield, Droplets } from 'lucide-react';
import { PelangganIndustri } from '../types';
import { getCurrentCustomer, logoutCustomer } from '../lib/auth';

export const CustomerPage: React.FC = () => {
  const {
    loading,
    pelangganList,
    pemakaianList,
    labResults,
    infoPelayanan,
    tiketList,
    openCertificateModal,
    handleCreateTiket,
    setIsDeployModalOpen,
    setIsHotlineModalOpen
  } = useData();

  const [customer, setCustomer] = useState<PelangganIndustri | null>(null);

  useEffect(() => {
    const savedCustomer = getCurrentCustomer();
    if (savedCustomer) {
      // Find latest object in pelangganList to keep in sync
      const matched = pelangganList.find(
        p => p.id_pelanggan.toLowerCase() === savedCustomer.id_pelanggan.toLowerCase()
      );
      setCustomer(matched || savedCustomer);
    }
  }, [pelangganList]);

  const handleLoginSuccess = (authenticatedCustomer: PelangganIndustri) => {
    setCustomer(authenticatedCustomer);
  };

  const handleLogout = () => {
    logoutCustomer();
    setCustomer(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Customer Header - Dedicated for industrial partners */}
      <CustomerHeader
        currentCustomer={customer}
        onLogoutCustomer={handleLogout}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenHotlineModal={() => setIsHotlineModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-slate-500 text-xs">
            <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mb-3" />
            <span>Memuat data layanan PT Aetra Air Tangerang...</span>
          </div>
        ) : customer ? (
          <CustomerPortal
            currentCustomer={customer}
            pemakaianList={pemakaianList}
            labResults={labResults}
            infoPelayanan={infoPelayanan}
            tiketList={tiketList}
            onOpenCertificate={openCertificateModal}
            onCreateTiket={handleCreateTiket}
            onOpenDeployModal={() => setIsDeployModalOpen(true)}
          />
        ) : (
          <CustomerLogin
            pelangganList={pelangganList}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </main>

      {/* Public Footer tailored for industrial partners */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-8 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-6 border-b border-slate-800/80">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-sm">PT AETRA AIR TANGERANG</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Penyedia layanan air minum perpipaan handal berstandar Permenkes No. 2 Tahun 2023 untuk kawasan industri dan komersial Kabupaten Tangerang.
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Layanan Pelanggan Industri
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>• Tracking Pembacaan Meter 3 Tahap</li>
                <li>• Verifikasi Stand Meter Bulanan</li>
                <li>• Unduh Sertifikat Mutu Lab (COA)</li>
                <li>• Status Jaringan & Pasokan Air</li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Kontak Key Account 24 Jam
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Emergency Hotline: <strong className="text-cyan-400">(021) 590-7777</strong><br />
                WhatsApp Priority: <strong className="text-emerald-400">+62 811-9988-7766</strong><br />
                Email: keyaccount@aetra-tangerang.co.id
              </p>
            </div>

            {/* Col 4: Staff Portal Gateway */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-300 font-bold text-xs mb-1">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Akses Internal Petugas</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  Khusus Staf Key Account, Tim Lab Kualitas Air, dan Petugas Distribusi Aetra.
                </p>
              </div>
              <Link
                to="/staff"
                className="inline-flex items-center justify-center gap-2 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-cyan-300 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-slate-600/80 cursor-pointer"
              >
                <span>Login ke Portal Staf</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} PT Aetra Air Tangerang. Hak Cipta Dilindungi Undang-Undang.
            </div>
            <div className="flex items-center gap-4">
              <span>Permenkes No. 2/2023 Compliant</span>
              <span>•</span>
              <span>ISO 9001:2015 & ISO 14001</span>
              <span>•</span>
              <button
                onClick={() => setIsDeployModalOpen(true)}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                Koneksi Supabase
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
