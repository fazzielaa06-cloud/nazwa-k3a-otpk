import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Vessel, 
  GateTransaction, 
  StevedoringJob, 
  CustomerEMKL, 
  User, 
  AuditLog, 
  TerminalKPIs 
} from './types/terminal';
import { TerminalService } from './services/terminalService';
import { ToastProvider, useToast } from './components/Toast';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { YardMap } from './components/yard/YardMap';
import { MasterContainersView } from './components/views/MasterContainersView';
import { MasterVesselsView } from './components/views/MasterVesselsView';
import { GateTransactionsView } from './components/views/GateTransactionsView';
import { StevedoringView } from './components/views/StevedoringView';
import { CustomersView } from './components/views/CustomersView';
import { ReportsView } from './components/views/ReportsView';

// Modals
import { ContainerModal } from './components/modals/ContainerModal';
import { VesselModal } from './components/modals/VesselModal';
import { GateTransactionModal } from './components/modals/GateTransactionModal';
import { EirSlipModal } from './components/modals/EirSlipModal';
import { StevedoringModal } from './components/modals/StevedoringModal';
import { CustomerModal } from './components/modals/CustomerModal';
import { ConfirmDeleteModal } from './components/modals/ConfirmDeleteModal';

function MainApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core Data Collections
  const [containers, setContainers] = useState<Container[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [gateTransactions, setGateTransactions] = useState<GateTransaction[]>([]);
  const [stevedoringJobs, setStevedoringJobs] = useState<StevedoringJob[]>([]);
  const [customers, setCustomers] = useState<CustomerEMKL[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [kpis, setKpis] = useState<TerminalKPIs>({
    totalContainers: 0,
    totalTEU: 0,
    yardCapacityTEU: 3500,
    yardOccupancyRate: 0,
    activeVessels: 0,
    vesselsInQueue: 0,
    todayGateInCount: 0,
    todayGateOutCount: 0,
    avgDwellingDays: 0,
    averageGMPH: 0,
  });

  // Modal States
  const [containerModalOpen, setContainerModalOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<Container | null>(null);

  const [vesselModalOpen, setVesselModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);

  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<GateTransaction | null>(null);

  const [eirSlipOpen, setEirSlipOpen] = useState(false);
  const [selectedEir, setSelectedEir] = useState<GateTransaction | null>(null);

  const [stevedoringModalOpen, setStevedoringModalOpen] = useState(false);
  const [editingStevedoring, setEditingStevedoring] = useState<StevedoringJob | null>(null);

  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerEMKL | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{
    title: string;
    itemName: string;
    itemType: string;
    action: () => Promise<void>;
  } | null>(null);

  const { showToast } = useToast();

  // Reload all collections from persistent database
  const loadData = useCallback(async () => {
    try {
      const [cnt, vsl, gate, stv, cst, logs, kpi] = await Promise.all([
        TerminalService.getContainers(),
        TerminalService.getVessels(),
        TerminalService.getGateTransactions(),
        TerminalService.getStevedoringJobs(),
        TerminalService.getCustomers(),
        TerminalService.getAuditLogs(),
        TerminalService.getKPIs(),
      ]);

      setContainers(cnt);
      setVessels(vsl);
      setGateTransactions(gate);
      setStevedoringJobs(stv);
      setCustomers(cst);
      setAuditLogs(logs);
      setKpis(kpi);
    } catch (err: unknown) {
      console.error('Failed to load database:', err);
    }
  }, []);

  // Initialization: ensure database is ready and show Login Form as default view
  useEffect(() => {
    async function boot() {
      try {
        await TerminalService.init();
        // As requested: "harus ada form login sebagai tampilan default"
        // Always present the login form as the default entry view
        setCurrentUser(null);
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setLoadingInitial(false);
      }
    }
    boot();
  }, []);

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    await loadData();
  };

  const handleLogout = async () => {
    await TerminalService.logout();
    setCurrentUser(null);
    showToast('Logout Berhasil', 'Anda telah keluar dari sistem.', 'info');
  };

  const handleResetData = async () => {
    if (window.confirm('Reset seluruh data ke konfigurasi standar awal pelabuhan?')) {
      await TerminalService.resetToSeed();
      await loadData();
      showToast('Database Direset', 'Seluruh data operasional dikembalikan ke data awal terverifikasi.', 'success');
    }
  };

  // Container CRUD handlers
  const handleSaveContainer = async (data: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => {
    await TerminalService.saveContainer(data, existingId, currentUser);
    await loadData();
    showToast(
      existingId ? 'Kontainer Diperbarui' : 'Kontainer Didaftarkan',
      `Nomor ${data.containerNumber} tersimpan di Blok ${data.yardLocation.block}.`,
      'success'
    );
  };

  const handleDeleteContainer = (c: Container) => {
    setDeleteConfig({
      title: 'Hapus Data Petikemas',
      itemName: c.containerNumber,
      itemType: 'kontainer',
      action: async () => {
        await TerminalService.deleteContainer(c.id, currentUser);
        await loadData();
        showToast('Kontainer Dihapus', `Data ${c.containerNumber} telah dihapus dari sistem.`, 'info');
      },
    });
    setDeleteModalOpen(true);
  };

  // Vessel CRUD handlers
  const handleSaveVessel = async (data: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => {
    await TerminalService.saveVessel(data, existingId, currentUser);
    await loadData();
    showToast(
      existingId ? 'Jadwal Kapal Diperbarui' : 'Kapal Didaftarkan',
      `${data.vesselName} dialokasikan di ${data.berthSlot}.`,
      'success'
    );
  };

  const handleDeleteVessel = (v: Vessel) => {
    setDeleteConfig({
      title: 'Hapus Jadwal Kapal',
      itemName: v.vesselName,
      itemType: 'jadwal kapal',
      action: async () => {
        await TerminalService.deleteVessel(v.id, currentUser);
        await loadData();
        showToast('Kapal Dihapus', `Kapal ${v.vesselName} telah dihapus dari daftar tambatan.`, 'info');
      },
    });
    setDeleteModalOpen(true);
  };

  // Gate Transaction CRUD handlers
  const handleSaveGate = async (data: Omit<GateTransaction, 'id' | 'eirNumber' | 'timestamp'>, existingId?: string) => {
    if (existingId) {
      await TerminalService.updateGateTransaction(existingId, data, currentUser);
      showToast('Transaksi Gate Diperbarui', 'Data EIR berhasil diperbarui.', 'success');
    } else {
      const created = await TerminalService.createGateTransaction(data, currentUser);
      showToast('EIR Diterbitkan', `No. ${created.eirNumber} untuk kontainer ${created.containerNumber}.`, 'success');
      setSelectedEir(created);
      setEirSlipOpen(true);
    }
    await loadData();
  };

  const handleDeleteGate = (tx: GateTransaction) => {
    setDeleteConfig({
      title: 'Hapus Transaksi Gerbang',
      itemName: tx.eirNumber,
      itemType: 'transaksi EIR',
      action: async () => {
        await TerminalService.deleteGateTransaction(tx.id, currentUser);
        await loadData();
        showToast('EIR Dihapus', `Transaksi ${tx.eirNumber} telah dihapus.`, 'info');
      },
    });
    setDeleteModalOpen(true);
  };

  // Stevedoring CRUD handlers
  const handleSaveStevedoring = async (data: Omit<StevedoringJob, 'id' | 'createdAt'>, existingId?: string) => {
    await TerminalService.saveStevedoringJob(data, existingId, currentUser);
    await loadData();
    showToast(
      existingId ? 'Tugas Diperbarui' : 'Tugas Dimulai',
      `Operasi ${data.jobType} untuk box ${data.containerNumber} (${data.quayCraneId}).`,
      'success'
    );
  };

  const handleQuickCompleteStevedoring = async (job: StevedoringJob) => {
    await TerminalService.saveStevedoringJob({ ...job, status: 'Completed' }, job.id, currentUser);
    await loadData();
    showToast('Tugas Selesai', `Job ${job.jobType} box ${job.containerNumber} selesai.`, 'success');
  };

  const handleDeleteStevedoring = (job: StevedoringJob) => {
    setDeleteConfig({
      title: 'Hapus Tugas Stevedoring',
      itemName: `${job.jobType} - ${job.containerNumber}`,
      itemType: 'tugas bongkar muat',
      action: async () => {
        await TerminalService.deleteStevedoringJob(job.id, currentUser);
        await loadData();
        showToast('Tugas Dihapus', `Instruksi kerja ${job.containerNumber} telah dibatalkan.`, 'info');
      },
    });
    setDeleteModalOpen(true);
  };

  // Customers CRUD handlers
  const handleSaveCustomer = async (data: Omit<CustomerEMKL, 'id' | 'createdAt'>, existingId?: string) => {
    await TerminalService.saveCustomer(data, existingId, currentUser);
    await loadData();
    showToast(
      existingId ? 'Mitra Diperbarui' : 'Mitra Didaftarkan',
      `${data.name} (${data.code}) berhasil disimpan.`,
      'success'
    );
  };

  const handleDeleteCustomer = (cst: CustomerEMKL) => {
    setDeleteConfig({
      title: 'Hapus Data Mitra EMKL',
      itemName: cst.name,
      itemType: 'mitra EMKL',
      action: async () => {
        await TerminalService.deleteCustomer(cst.id, currentUser);
        await loadData();
        showToast('Mitra Dihapus', `Perusahaan ${cst.name} telah dihapus dari sistem.`, 'info');
      },
    });
    setDeleteModalOpen(true);
  };

  // View Container in Yard shortcut
  const handleViewContainerInYard = (c: Container) => {
    setCurrentTab('yard');
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center text-slate-700">
        <div className="w-12 h-12 border-4 border-sky-600/30 border-t-sky-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-sky-950 uppercase tracking-wider font-mono">
          Memuat Sistem Operasional Terminal Petikemas...
        </p>
      </div>
    );
  }

  // DEFAULT VIEW: Show Login View if not logged in (Prompt Requirement)
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-sky-50/40 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onResetData={handleResetData}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          userRole={currentUser.role}
          counts={{
            containers: containers.length,
            vessels: vessels.length,
            gate: gateTransactions.length,
            stevedoring: stevedoringJobs.filter(j => j.status !== 'Completed').length,
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {currentTab === 'dashboard' && (
              <AnalyticsDashboard
                kpis={kpis}
                containers={containers}
                vessels={vessels}
                gateTransactions={gateTransactions}
                auditLogs={auditLogs}
                onNavigateTab={(tab) => setCurrentTab(tab as NavTab)}
              />
            )}

            {currentTab === 'yard' && (
              <YardMap
                containers={containers}
                onSelectContainer={(c) => {
                  setEditingContainer(c);
                  setContainerModalOpen(true);
                }}
              />
            )}

            {currentTab === 'containers' && (
              <MasterContainersView
                containers={containers}
                onAddNew={() => {
                  setEditingContainer(null);
                  setContainerModalOpen(true);
                }}
                onEdit={(c) => {
                  setEditingContainer(c);
                  setContainerModalOpen(true);
                }}
                onDelete={handleDeleteContainer}
                onViewYard={handleViewContainerInYard}
              />
            )}

            {currentTab === 'vessels' && (
              <MasterVesselsView
                vessels={vessels}
                onAddNew={() => {
                  setEditingVessel(null);
                  setVesselModalOpen(true);
                }}
                onEdit={(v) => {
                  setEditingVessel(v);
                  setVesselModalOpen(true);
                }}
                onDelete={handleDeleteVessel}
              />
            )}

            {currentTab === 'gate' && (
              <GateTransactionsView
                transactions={gateTransactions}
                onAddNew={() => {
                  setEditingGate(null);
                  setGateModalOpen(true);
                }}
                onEdit={(tx) => {
                  setEditingGate(tx);
                  setGateModalOpen(true);
                }}
                onDelete={handleDeleteGate}
                onPrintEir={(tx) => {
                  setSelectedEir(tx);
                  setEirSlipOpen(true);
                }}
              />
            )}

            {currentTab === 'stevedoring' && (
              <StevedoringView
                jobs={stevedoringJobs}
                onAddNew={() => {
                  setEditingStevedoring(null);
                  setStevedoringModalOpen(true);
                }}
                onEdit={(j) => {
                  setEditingStevedoring(j);
                  setStevedoringModalOpen(true);
                }}
                onDelete={handleDeleteStevedoring}
                onQuickComplete={handleQuickCompleteStevedoring}
              />
            )}

            {currentTab === 'customers' && (
              <CustomersView
                customers={customers}
                onAddNew={() => {
                  setEditingCustomer(null);
                  setCustomerModalOpen(true);
                }}
                onEdit={(c) => {
                  setEditingCustomer(c);
                  setCustomerModalOpen(true);
                }}
                onDelete={handleDeleteCustomer}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                containers={containers}
                vessels={vessels}
                gateTransactions={gateTransactions}
                kpis={kpis}
              />
            )}
          </div>
        </main>
      </div>

      {/* CRUD Modals */}
      <ContainerModal
        isOpen={containerModalOpen}
        onClose={() => setContainerModalOpen(false)}
        onSave={handleSaveContainer}
        editData={editingContainer}
        vesselsList={vessels.map(v => ({ id: v.id, vesselName: v.vesselName }))}
        customersList={customers.map(c => ({ id: c.id, name: c.name }))}
      />

      <VesselModal
        isOpen={vesselModalOpen}
        onClose={() => setVesselModalOpen(false)}
        onSave={handleSaveVessel}
        editData={editingVessel}
      />

      <GateTransactionModal
        isOpen={gateModalOpen}
        onClose={() => setGateModalOpen(false)}
        onSave={handleSaveGate}
        editData={editingGate}
        containersList={containers.map(c => ({ id: c.id, containerNumber: c.containerNumber, size: c.size, status: c.status }))}
        customersList={customers.map(c => ({ id: c.id, name: c.name }))}
      />

      <EirSlipModal
        isOpen={eirSlipOpen}
        onClose={() => setEirSlipOpen(false)}
        transaction={selectedEir}
      />

      <StevedoringModal
        isOpen={stevedoringModalOpen}
        onClose={() => setStevedoringModalOpen(false)}
        onSave={handleSaveStevedoring}
        editData={editingStevedoring}
        containersList={containers.map(c => ({ id: c.id, containerNumber: c.containerNumber }))}
        vesselsList={vessels.map(v => ({ id: v.id, vesselName: v.vesselName }))}
      />

      <CustomerModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        editData={editingCustomer}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteConfig?.action || (async () => {})}
        title={deleteConfig?.title || 'Konfirmasi Hapus'}
        itemName={deleteConfig?.itemName || ''}
        itemType={deleteConfig?.itemType || 'data'}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
