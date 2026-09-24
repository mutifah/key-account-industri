import React from 'react';
import { StaffHeader } from '../components/StaffHeader';
import { StaffPortal } from '../components/StaffPortal';
import { StaffLogin } from '../components/StaffLogin';
import { useData } from '../context/DataContext';

export const StaffPage: React.FC = () => {
  const {
    loading,
    currentStaff,
    setCurrentStaff,
    logout,
    pelangganList,
    pemakaianList,
    labResults,
    infoPelayanan,
    tiketList,
    openMeterModal,
    openLabModal,
    openInfoModal,
    openCustomerModal,
    setIsExcelModalOpen,
    handleDeletePemakaian,
    handleDeleteLab,
    handleDeleteInfo,
    handleDeleteCustomer,
    openCertificateModal,
    handleToggleInfoPublish,
    handleVerifyPemakaian,
    handleUpdateStatusProgress,
    setIsDeployModalOpen
  } = useData();

  // If not authenticated, render the dedicated Staff Login page
  if (!currentStaff) {
    return <StaffLogin onLoginSuccess={(user) => setCurrentStaff(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Dedicated Enterprise Staff Header */}
      <StaffHeader
        staffUser={currentStaff}
        onLogout={logout}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
      />

      {/* Main Staff Operations Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-slate-500 text-xs">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-transparent rounded-full animate-spin mb-3" />
            <span>Memuat pangkalan data internal Key Account...</span>
          </div>
        ) : (
          <StaffPortal
            currentStaff={currentStaff}
            pelangganList={pelangganList}
            pemakaianList={pemakaianList}
            labResults={labResults}
            infoPelayanan={infoPelayanan}
            tiketList={tiketList}
            onOpenMeterModal={openMeterModal}
            onOpenLabModal={openLabModal}
            onOpenInfoModal={openInfoModal}
            onOpenCustomerModal={openCustomerModal}
            onOpenExcelModal={() => setIsExcelModalOpen(true)}
            onDeletePemakaian={handleDeletePemakaian}
            onDeleteLab={handleDeleteLab}
            onDeleteInfo={handleDeleteInfo}
            onDeleteCustomer={handleDeleteCustomer}
            onOpenCertificate={openCertificateModal}
            onToggleInfoPublish={handleToggleInfoPublish}
            onVerifyPemakaian={handleVerifyPemakaian}
            onUpdateStatusProgress={handleUpdateStatusProgress}
          />
        )}
      </main>

      {/* Staff Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 py-5 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">PT AETRA AIR TANGERANG</span>
            <span className="text-slate-600">·</span>
            <span>Key Account Industrial Operations & Lab Portal</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Audit Trail Enabled</span>
            <span>•</span>
            <span>Permenkes No. 2/2023 Standard</span>
            <span>•</span>
            <span>Session NIK: {currentStaff.nik}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
