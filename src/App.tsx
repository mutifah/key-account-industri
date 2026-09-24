import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { CustomerPage } from './pages/CustomerPage';
import { StaffPage } from './pages/StaffPage';

import { DeploymentModal } from './components/DeploymentModal';
import { MeterReadingModal } from './components/MeterReadingModal';
import { LabResultModal } from './components/LabResultModal';
import { ServiceInfoModal } from './components/ServiceInfoModal';
import { CustomerModal } from './components/CustomerModal';
import { CertificateModal } from './components/CertificateModal';
import { HotlineModal } from './components/HotlineModal';
import { ExcelUploadModal } from './components/ExcelUploadModal';

// Component to handle hash / query routing fallbacks if needed
function RouteSyncer() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user accessed with hash e.g. #staff or #/staff
    const hash = window.location.hash.replace('#', '').replace('/', '');
    const search = new URLSearchParams(window.location.search);
    const portalParam = search.get('portal');

    if ((hash === 'staff' || portalParam === 'staff') && !location.pathname.startsWith('/staff')) {
      navigate('/staff', { replace: true });
    } else if ((hash === 'customer' || hash === 'pelanggan' || portalParam === 'customer') && location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}

function MainApp() {
  const {
    refreshData,
    pelangganList,
    latestReadingsMap,
    // Modals
    isDeployModalOpen,
    setIsDeployModalOpen,
    isHotlineModalOpen,
    setIsHotlineModalOpen,
    // Excel Modal
    isExcelModalOpen,
    setIsExcelModalOpen,
    handleBatchSavePemakaian,
    // Meter modal
    isMeterModalOpen,
    setIsMeterModalOpen,
    editingPemakaian,
    handleSavePemakaian,
    // Lab modal
    isLabModalOpen,
    setIsLabModalOpen,
    editingLab,
    handleSaveLab,
    // Info modal
    isInfoModalOpen,
    setIsInfoModalOpen,
    editingInfo,
    handleSaveInfo,
    // Customer modal
    isCustomerModalOpen,
    setIsCustomerModalOpen,
    editingCustomer,
    handleSaveCustomer,
    // Cert modal
    isCertModalOpen,
    setIsCertModalOpen,
    selectedCertLab
  } = useData();

  return (
    <>
      <RouteSyncer />
      
      {/* Total Route Separation: Customer route vs Staff route */}
      <Routes>
        {/* Route 1: Portal Pelanggan Industri (Public & Customer-facing) */}
        <Route path="/" element={<CustomerPage />} />
        <Route path="/pelanggan" element={<CustomerPage />} />
        
        {/* Route 2: Portal Staf Key Account (Internal & Authenticated) */}
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/staff/login" element={<StaffPage />} />
        <Route path="/staff/dashboard" element={<StaffPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Modals for both Customer & Staff workflows */}
      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onConfigSaved={() => {
          refreshData();
        }}
      />

      <HotlineModal
        isOpen={isHotlineModalOpen}
        onClose={() => setIsHotlineModalOpen(false)}
      />

      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        pelangganList={pelangganList}
        latestReadingsMap={latestReadingsMap}
        onBatchSave={handleBatchSavePemakaian}
      />

      <MeterReadingModal
        isOpen={isMeterModalOpen}
        onClose={() => setIsMeterModalOpen(false)}
        onSave={handleSavePemakaian}
        pelangganList={pelangganList}
        initialData={editingPemakaian}
        latestReadingsMap={latestReadingsMap}
      />

      <LabResultModal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        onSave={handleSaveLab}
        initialData={editingLab}
      />

      <ServiceInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        onSave={handleSaveInfo}
        initialData={editingInfo}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        initialData={editingCustomer}
        existingIds={pelangganList.map((p) => p.id_pelanggan)}
      />

      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        data={selectedCertLab}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </BrowserRouter>
  );
}
