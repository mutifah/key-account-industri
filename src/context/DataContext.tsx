import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  PelangganIndustri,
  PemakaianAir,
  HasilLabHarian,
  InfoPelayanan,
  TiketLayanan,
  StaffUser,
  StatusProgressMeter
} from '../types';
import {
  initializeStorage,
  getPelangganList,
  savePelanggan,
  deletePelanggan,
  getPemakaianList,
  savePemakaian,
  saveBatchPemakaian,
  saveBatchPelanggan,
  deletePemakaian,
  getLabResults,
  saveLabResult,
  deleteLabResult,
  getInfoPelayanan,
  saveInfoPelayanan,
  deleteInfoPelayanan,
  getTiketLayanan,
  createTiketLayanan
} from '../lib/storage';
import { getCurrentStaff, logoutStaff as authLogoutStaff } from '../lib/auth';

interface DataContextType {
  loading: boolean;
  pelangganList: PelangganIndustri[];
  pemakaianList: PemakaianAir[];
  labResults: HasilLabHarian[];
  infoPelayanan: InfoPelayanan[];
  tiketList: TiketLayanan[];
  latestReadingsMap: Record<string, number>;
  currentStaff: StaffUser | null;
  setCurrentStaff: (staff: StaffUser | null) => void;
  refreshData: () => Promise<void>;
  logout: () => Promise<void>;

  // Handlers
  handleSavePemakaian: (data: Omit<PemakaianAir, 'id'> & { id?: string }) => Promise<void>;
  handleBatchSavePemakaian: (items: (Omit<PemakaianAir, 'id'> & { id?: string })[], customersToUpdate?: PelangganIndustri[]) => Promise<void>;
  handleDeletePemakaian: (id: string) => Promise<void>;
  handleVerifyPemakaian: (item: PemakaianAir) => Promise<void>;
  handleUpdateStatusProgress: (item: PemakaianAir, nextStatus: StatusProgressMeter) => Promise<void>;
  handleSaveLab: (data: Omit<HasilLabHarian, 'id'> & { id?: string }) => Promise<void>;
  handleDeleteLab: (id: string) => Promise<void>;
  handleSaveInfo: (data: Omit<InfoPelayanan, 'id'> & { id?: string }) => Promise<void>;
  handleDeleteInfo: (id: string) => Promise<void>;
  handleToggleInfoPublish: (info: InfoPelayanan) => Promise<void>;
  handleSaveCustomer: (data: PelangganIndustri) => Promise<void>;
  handleDeleteCustomer: (id: string) => Promise<void>;
  handleCreateTiket: (tiket: Omit<TiketLayanan, 'id' | 'created_at'>) => Promise<void>;

  // Modals
  isDeployModalOpen: boolean;
  setIsDeployModalOpen: (open: boolean) => void;
  isHotlineModalOpen: boolean;
  setIsHotlineModalOpen: (open: boolean) => void;

  isExcelModalOpen: boolean;
  setIsExcelModalOpen: (open: boolean) => void;

  isMeterModalOpen: boolean;
  setIsMeterModalOpen: (open: boolean) => void;
  editingPemakaian: PemakaianAir | null;
  setEditingPemakaian: (item: PemakaianAir | null) => void;
  openMeterModal: (item?: PemakaianAir | null) => void;

  isLabModalOpen: boolean;
  setIsLabModalOpen: (open: boolean) => void;
  editingLab: HasilLabHarian | null;
  setEditingLab: (item: HasilLabHarian | null) => void;
  openLabModal: (item?: HasilLabHarian | null) => void;

  isInfoModalOpen: boolean;
  setIsInfoModalOpen: (open: boolean) => void;
  editingInfo: InfoPelayanan | null;
  setEditingInfo: (item: InfoPelayanan | null) => void;
  openInfoModal: (item?: InfoPelayanan | null) => void;

  isCustomerModalOpen: boolean;
  setIsCustomerModalOpen: (open: boolean) => void;
  editingCustomer: PelangganIndustri | null;
  setEditingCustomer: (item: PelangganIndustri | null) => void;
  openCustomerModal: (item?: PelangganIndustri | null) => void;

  isCertModalOpen: boolean;
  setIsCertModalOpen: (open: boolean) => void;
  selectedCertLab: HasilLabHarian | null;
  openCertificateModal: (lab: HasilLabHarian) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentStaff, setCurrentStaff] = useState<StaffUser | null>(null);

  // Data states
  const [pelangganList, setPelangganList] = useState<PelangganIndustri[]>([]);
  const [pemakaianList, setPemakaianList] = useState<PemakaianAir[]>([]);
  const [labResults, setLabResults] = useState<HasilLabHarian[]>([]);
  const [infoPelayanan, setInfoPelayanan] = useState<InfoPelayanan[]>([]);
  const [tiketList, setTiketList] = useState<TiketLayanan[]>([]);

  // Modals state
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isHotlineModalOpen, setIsHotlineModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Meter modal
  const [isMeterModalOpen, setIsMeterModalOpen] = useState(false);
  const [editingPemakaian, setEditingPemakaian] = useState<PemakaianAir | null>(null);

  // Lab modal
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<HasilLabHarian | null>(null);

  // Info modal
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<InfoPelayanan | null>(null);

  // Customer modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<PelangganIndustri | null>(null);

  // Certificate modal
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [selectedCertLab, setSelectedCertLab] = useState<HasilLabHarian | null>(null);

  // Load staff session on mount
  useEffect(() => {
    const staff = getCurrentStaff();
    if (staff) {
      setCurrentStaff(staff);
    }
  }, []);

  // Load all data
  const loadData = useCallback(async () => {
    initializeStorage();
    try {
      const [pelanggan, pemakaian, lab, info, tiket] = await Promise.all([
        getPelangganList(),
        getPemakaianList(),
        getLabResults(),
        getInfoPelayanan(),
        getTiketLayanan()
      ]);
      setPelangganList(pelanggan);
      setPemakaianList(pemakaian);
      setLabResults(lab);
      setInfoPelayanan(info);
      setTiketList(tiket);
    } catch (err) {
      console.error('Error loading data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const logout = async () => {
    await authLogoutStaff();
    setCurrentStaff(null);
  };

  // Map of latest meter readings for each customer to pre-fill meter_awal
  const latestReadingsMap = useMemo(() => {
    const map: Record<string, number> = {};
    pemakaianList.forEach(p => {
      if (!map[p.id_pelanggan] || p.meter_akhir > map[p.id_pelanggan]) {
        map[p.id_pelanggan] = p.meter_akhir;
      }
    });
    return map;
  }, [pemakaianList]);

  // Handlers
  const handleSavePemakaian = async (data: Omit<PemakaianAir, 'id'> & { id?: string }) => {
    await savePemakaian(data);
    await loadData();
  };

  const handleBatchSavePemakaian = async (
    items: (Omit<PemakaianAir, 'id'> & { id?: string })[],
    customersToUpdate?: PelangganIndustri[]
  ) => {
    if (customersToUpdate && customersToUpdate.length > 0) {
      await saveBatchPelanggan(customersToUpdate);
    }
    if (items.length > 0) {
      await saveBatchPemakaian(items);
    }
    await loadData();

    // Sync localStorage customer session if logged in customer's company name was updated
    try {
      const stored = localStorage.getItem('aetra_customer_session');
      if (stored && customersToUpdate && customersToUpdate.length > 0) {
        const sessionCust = JSON.parse(stored);
        const match = customersToUpdate.find(
          c => c.id_pelanggan.toLowerCase() === sessionCust.id_pelanggan?.toLowerCase()
        );
        if (match) {
          localStorage.setItem('aetra_customer_session', JSON.stringify({
            ...sessionCust,
            nama_perusahaan: match.nama_perusahaan
          }));
        }
      }
    } catch (e) {
      console.warn('Customer session sync error', e);
    }
  };

  const handleDeletePemakaian = async (id: string) => {
    await deletePemakaian(id);
    await loadData();
  };

  const handleVerifyPemakaian = async (item: PemakaianAir) => {
    const isNowVerified = item.status_progress === 'Terverifikasi';
    const nextStatus: StatusProgressMeter = isNowVerified ? 'Pembacaan Meter' : 'Terverifikasi';
    await savePemakaian({
      ...item,
      status_progress: nextStatus,
      tanggal_verifikasi: !isNowVerified ? new Date().toISOString().split('T')[0] : undefined
    });
    await loadData();
  };

  const handleUpdateStatusProgress = async (item: PemakaianAir, nextStatus: StatusProgressMeter) => {
    await savePemakaian({
      ...item,
      status_progress: nextStatus,
      tanggal_verifikasi: nextStatus === 'Terverifikasi' ? new Date().toISOString().split('T')[0] : undefined
    });
    await loadData();
  };

  const handleSaveLab = async (data: Omit<HasilLabHarian, 'id'> & { id?: string }) => {
    await saveLabResult(data);
    await loadData();
  };

  const handleDeleteLab = async (id: string) => {
    await deleteLabResult(id);
    await loadData();
  };

  const handleSaveInfo = async (data: Omit<InfoPelayanan, 'id'> & { id?: string }) => {
    await saveInfoPelayanan(data);
    await loadData();
  };

  const handleDeleteInfo = async (id: string) => {
    await deleteInfoPelayanan(id);
    await loadData();
  };

  const handleToggleInfoPublish = async (info: InfoPelayanan) => {
    await saveInfoPelayanan({
      ...info,
      status_publikasi: !info.status_publikasi
    });
    await loadData();
  };

  const handleSaveCustomer = async (data: PelangganIndustri) => {
    await savePelanggan(data);
    await loadData();
  };

  const handleDeleteCustomer = async (id: string) => {
    await deletePelanggan(id);
    await loadData();
  };

  const handleCreateTiket = async (tiket: Omit<TiketLayanan, 'id' | 'created_at'>) => {
    await createTiketLayanan(tiket);
    await loadData();
  };

  // Modal Triggers
  const openMeterModal = (item?: PemakaianAir | null) => {
    setEditingPemakaian(item || null);
    setIsMeterModalOpen(true);
  };

  const openLabModal = (item?: HasilLabHarian | null) => {
    setEditingLab(item || null);
    setIsLabModalOpen(true);
  };

  const openInfoModal = (item?: InfoPelayanan | null) => {
    setEditingInfo(item || null);
    setIsInfoModalOpen(true);
  };

  const openCustomerModal = (item?: PelangganIndustri | null) => {
    setEditingCustomer(item || null);
    setIsCustomerModalOpen(true);
  };

  const openCertificateModal = (lab: HasilLabHarian) => {
    setSelectedCertLab(lab);
    setIsCertModalOpen(true);
  };

  const value: DataContextType = {
    loading,
    pelangganList,
    pemakaianList,
    labResults,
    infoPelayanan,
    tiketList,
    latestReadingsMap,
    currentStaff,
    setCurrentStaff,
    refreshData: loadData,
    logout,

    handleSavePemakaian,
    handleBatchSavePemakaian,
    handleDeletePemakaian,
    handleVerifyPemakaian,
    handleUpdateStatusProgress,
    handleSaveLab,
    handleDeleteLab,
    handleSaveInfo,
    handleDeleteInfo,
    handleToggleInfoPublish,
    handleSaveCustomer,
    handleDeleteCustomer,
    handleCreateTiket,

    isDeployModalOpen,
    setIsDeployModalOpen,
    isHotlineModalOpen,
    setIsHotlineModalOpen,

    isExcelModalOpen,
    setIsExcelModalOpen,

    isMeterModalOpen,
    setIsMeterModalOpen,
    editingPemakaian,
    setEditingPemakaian,
    openMeterModal,

    isLabModalOpen,
    setIsLabModalOpen,
    editingLab,
    setEditingLab,
    openLabModal,

    isInfoModalOpen,
    setIsInfoModalOpen,
    editingInfo,
    setEditingInfo,
    openInfoModal,

    isCustomerModalOpen,
    setIsCustomerModalOpen,
    editingCustomer,
    setEditingCustomer,
    openCustomerModal,

    isCertModalOpen,
    setIsCertModalOpen,
    selectedCertLab,
    openCertificateModal
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
