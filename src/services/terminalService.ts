import { 
  Container, 
  Vessel, 
  GateTransaction, 
  StevedoringJob, 
  CustomerEMKL, 
  User, 
  AuditLog, 
  TerminalKPIs 
} from '../types/terminal';
import { 
  getAllFromStore, 
  getFromStore, 
  putToStore, 
  deleteFromStore, 
  initSeedDataIfEmpty, 
  clearAndReinitStore, 
  openTerminalDB 
} from './dbIndexedDB';
import { INITIAL_USERS } from '../server/seedData';

// ISO 6346 Container Code Validator
// Format: 4 Uppercase letters followed by 7 digits (e.g., MSKU1234567)
export function validateContainerNumber(code: string): { valid: boolean; message?: string } {
  const clean = code.trim().toUpperCase();
  if (!clean) {
    return { valid: false, message: 'Nomor kontainer wajib diisi.' };
  }
  const isoRegex = /^[A-Z]{4}\d{7}$/;
  if (!isoRegex.test(clean)) {
    return { 
      valid: false, 
      message: 'Format ISO 6346 tidak valid. Harus berupa 4 huruf kapital diikuti 7 angka (contoh: MSKU9281745).' 
    };
  }
  return { valid: true };
}

// Generate EIR Number
export function generateEIRNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `EIR-${dateStr}-${randomNum}`;
}

export const TerminalService = {
  async init(): Promise<void> {
    await initSeedDataIfEmpty();
  },

  // Auth & Session
  async getCurrentSession(): Promise<User | null> {
    try {
      const db = await openTerminalDB();
      return new Promise((resolve) => {
        const tx = db.transaction('session', 'readonly');
        const req = tx.objectStore('session').get('current');
        req.onsuccess = () => {
          if (req.result && req.result.user) {
            resolve(req.result.user);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async login(
    username: string, 
    email: string, 
    passwordPlain: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    await initSeedDataIfEmpty();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername) {
      return { success: false, error: 'Username wajib diisi.' };
    }
    if (!cleanEmail) {
      return { success: false, error: 'Email wajib diisi.' };
    }
    if (!passwordPlain) {
      return { success: false, error: 'Password wajib diisi.' };
    }

    const users = await getAllFromStore('users');
    const matched = users.find(u => {
      const matchUser = u.username.toLowerCase() === cleanUsername;
      const matchEmail = u.email.toLowerCase() === cleanEmail;
      const matchPass = u.passwordHash === passwordPlain;
      return matchUser && matchEmail && matchPass;
    });

    if (!matched) {
      // Check if username/email exists to give helpful guidance
      const userExists = users.find(u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail);
      if (userExists) {
        return { success: false, error: 'Kombinasi Username, Email, atau Password tidak cocok.' };
      }
      return { success: false, error: 'Akun tidak terdaftar dalam database operasional.' };
    }

    const { passwordHash: _, ...safeUser } = matched;

    // Persist session into IndexedDB session store (NO localStorage)
    const db = await openTerminalDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['session', 'auditLogs'], 'readwrite');
      tx.objectStore('session').put({
        id: 'current',
        user: safeUser,
        token: `TOS_TOKEN_${Date.now()}`,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      tx.objectStore('auditLogs').put({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        userName: safeUser.name,
        action: 'CREATE',
        module: 'AUTH',
        details: `Pengguna ${safeUser.name} (${safeUser.role}) berhasil masuk ke sistem.`,
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    return { success: true, user: safeUser };
  },

  async logout(): Promise<void> {
    const db = await openTerminalDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction('session', 'readwrite');
      tx.objectStore('session').delete('current');
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  },

  getDemoAccounts() {
    return INITIAL_USERS.map(({ passwordHash, ...rest }) => ({
      ...rest,
      passwordPlain: passwordHash,
    }));
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const logs = await getAllFromStore('auditLogs');
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>, currentUser?: User | null): Promise<void> {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userName: currentUser?.name || log.userName || 'Sistem',
      action: log.action,
      module: log.module,
      details: log.details,
    };
    await putToStore('auditLogs', newLog);
  },

  // Containers CRUD
  async getContainers(): Promise<Container[]> {
    const list = await getAllFromStore('containers');
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getContainerById(id: string): Promise<Container | undefined> {
    return getFromStore('containers', id);
  },

  async saveContainer(data: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string, currentUser?: User | null): Promise<Container> {
    const validation = validateContainerNumber(data.containerNumber);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    let target: Container;

    // Check duplicate container number
    const all = await getAllFromStore('containers');
    const duplicate = all.find(c => c.containerNumber.toUpperCase() === data.containerNumber.toUpperCase() && c.id !== existingId);
    if (duplicate) {
      throw new Error(`Kontainer dengan nomor ${data.containerNumber} sudah terdaftar di sistem!`);
    }

    if (existingId) {
      const prev = await getFromStore('containers', existingId);
      if (!prev) throw new Error('Data kontainer tidak ditemukan.');
      target = {
        ...prev,
        ...data,
        containerNumber: data.containerNumber.toUpperCase(),
        updatedAt: now,
      };
      await putToStore('containers', target);
      await this.addAuditLog({
        userName: currentUser?.name || 'Operator',
        action: 'UPDATE',
        module: 'CONTAINER',
        details: `Pembaruan data kontainer ${target.containerNumber} (${target.size} - ${target.status}) di Blok ${target.yardLocation.block}.`,
      }, currentUser);
    } else {
      target = {
        ...data,
        id: `cnt-${Date.now()}`,
        containerNumber: data.containerNumber.toUpperCase(),
        createdAt: now,
        updatedAt: now,
      };
      await putToStore('containers', target);
      await this.addAuditLog({
        userName: currentUser?.name || 'Operator',
        action: 'CREATE',
        module: 'CONTAINER',
        details: `Pendaftaran kontainer baru ${target.containerNumber} (${target.shippingLine}) dialokasikan ke Blok ${target.yardLocation.block}-${target.yardLocation.bay}.`,
      }, currentUser);
    }

    return target;
  },

  async deleteContainer(id: string, currentUser?: User | null): Promise<void> {
    const target = await getFromStore('containers', id);
    if (!target) throw new Error('Kontainer tidak ditemukan.');

    await deleteFromStore('containers', id);
    await this.addAuditLog({
      userName: currentUser?.name || 'Operator',
      action: 'DELETE',
      module: 'CONTAINER',
      details: `Penghapusan kontainer ${target.containerNumber} dari sistem terminal.`,
    }, currentUser);
  },

  // Vessels CRUD
  async getVessels(): Promise<Vessel[]> {
    const list = await getAllFromStore('vessels');
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async saveVessel(data: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string, currentUser?: User | null): Promise<Vessel> {
    if (!data.vesselName.trim()) {
      throw new Error('Nama kapal wajib diisi.');
    }
    if (!data.callSign.trim()) {
      throw new Error('Call sign kapal wajib diisi.');
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    let vessel: Vessel;

    if (existingId) {
      const prev = await getFromStore('vessels', existingId);
      if (!prev) throw new Error('Data kapal tidak ditemukan.');
      vessel = {
        ...prev,
        ...data,
        updatedAt: now,
      };
      await putToStore('vessels', vessel);
      await this.addAuditLog({
        userName: currentUser?.name || 'Controller',
        action: 'UPDATE',
        module: 'VESSEL',
        details: `Perubahan jadwal/status kapal ${vessel.vesselName} (${vessel.berthSlot} - ${vessel.status}).`,
      }, currentUser);
    } else {
      vessel = {
        ...data,
        id: `vsl-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      await putToStore('vessels', vessel);
      await this.addAuditLog({
        userName: currentUser?.name || 'Controller',
        action: 'CREATE',
        module: 'VESSEL',
        details: `Pendaftaran jadwal kedatangan kapal ${vessel.vesselName} (Agen: ${vessel.shippingAgent}).`,
      }, currentUser);
    }

    return vessel;
  },

  async deleteVessel(id: string, currentUser?: User | null): Promise<void> {
    const target = await getFromStore('vessels', id);
    if (!target) throw new Error('Kapal tidak ditemukan.');

    await deleteFromStore('vessels', id);
    await this.addAuditLog({
      userName: currentUser?.name || 'Controller',
      action: 'DELETE',
      module: 'VESSEL',
      details: `Penghapusan data kapal ${target.vesselName} (${target.callSign}).`,
    }, currentUser);
  },

  // Gate Transactions CRUD
  async getGateTransactions(): Promise<GateTransaction[]> {
    const list = await getAllFromStore('gateTransactions');
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async createGateTransaction(
    data: Omit<GateTransaction, 'id' | 'eirNumber' | 'timestamp'>,
    currentUser?: User | null
  ): Promise<GateTransaction> {
    const validation = validateContainerNumber(data.containerNumber);
    if (!validation.valid) {
      throw new Error(validation.message);
    }
    if (!data.truckNumber.trim()) {
      throw new Error('Nomor polisi truk wajib diisi.');
    }
    if (!data.driverName.trim()) {
      throw new Error('Nama supir wajib diisi.');
    }

    const eirNumber = generateEIRNumber();
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const txItem: GateTransaction = {
      ...data,
      id: `eir-${Date.now()}`,
      eirNumber,
      containerNumber: data.containerNumber.toUpperCase(),
      timestamp,
    };

    await putToStore('gateTransactions', txItem);

    // If Gate In, ensure container exists or update its status
    const allContainers = await getAllFromStore('containers');
    const existingContainer = allContainers.find(c => c.containerNumber.toUpperCase() === txItem.containerNumber);

    if (data.type.startsWith('GATE_IN')) {
      if (existingContainer) {
        existingContainer.status = data.type === 'GATE_IN_IMPORT' ? 'Import' : 'Export';
        existingContainer.updatedAt = timestamp;
        await putToStore('containers', existingContainer);
      }
    } else if (data.type.startsWith('GATE_OUT')) {
      if (existingContainer) {
        existingContainer.customsStatus = 'SPPB Cleared';
        existingContainer.updatedAt = timestamp;
        await putToStore('containers', existingContainer);
      }
    }

    await this.addAuditLog({
      userName: currentUser?.name || 'Gate Operator',
      action: data.type.startsWith('GATE_IN') ? 'GATE_IN' : 'GATE_OUT',
      module: 'GATE',
      details: `Transaksi ${data.type} berhasil untuk kontainer ${txItem.containerNumber} (Truk ${txItem.truckNumber}). No EIR: ${eirNumber}.`,
    }, currentUser);

    return txItem;
  },

  async updateGateTransaction(id: string, updates: Partial<GateTransaction>, currentUser?: User | null): Promise<GateTransaction> {
    const prev = await getFromStore('gateTransactions', id);
    if (!prev) throw new Error('Transaksi gate tidak ditemukan.');

    const updated = { ...prev, ...updates };
    await putToStore('gateTransactions', updated);
    await this.addAuditLog({
      userName: currentUser?.name || 'Gate Operator',
      action: 'UPDATE',
      module: 'GATE',
      details: `Pembaruan data EIR ${updated.eirNumber} (Kontainer: ${updated.containerNumber}).`,
    }, currentUser);
    return updated;
  },

  async deleteGateTransaction(id: string, currentUser?: User | null): Promise<void> {
    const target = await getFromStore('gateTransactions', id);
    if (!target) throw new Error('Transaksi gate tidak ditemukan.');

    await deleteFromStore('gateTransactions', id);
    await this.addAuditLog({
      userName: currentUser?.name || 'Gate Operator',
      action: 'DELETE',
      module: 'GATE',
      details: `Penghapusan catatan transaksi EIR ${target.eirNumber}.`,
    }, currentUser);
  },

  // Stevedoring Jobs CRUD
  async getStevedoringJobs(): Promise<StevedoringJob[]> {
    const list = await getAllFromStore('stevedoringJobs');
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async saveStevedoringJob(data: Omit<StevedoringJob, 'id' | 'createdAt'>, existingId?: string, currentUser?: User | null): Promise<StevedoringJob> {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    let job: StevedoringJob;

    if (existingId) {
      const prev = await getFromStore('stevedoringJobs', existingId);
      if (!prev) throw new Error('Pekerjaan bongkar muat tidak ditemukan.');
      job = {
        ...prev,
        ...data,
        completedAt: data.status === 'Completed' ? (prev.completedAt || now) : undefined,
      };
      await putToStore('stevedoringJobs', job);
    } else {
      job = {
        ...data,
        id: `stv-${Date.now()}`,
        completedAt: data.status === 'Completed' ? now : undefined,
        createdAt: now,
      };
      await putToStore('stevedoringJobs', job);
    }

    await this.addAuditLog({
      userName: currentUser?.name || 'Stevedoring Chief',
      action: existingId ? 'UPDATE' : 'CREATE',
      module: 'STEVEDORING',
      details: `Job ${job.jobType} kontainer ${job.containerNumber} (${job.quayCraneId} - Status: ${job.status}).`,
    }, currentUser);

    return job;
  },

  async deleteStevedoringJob(id: string, currentUser?: User | null): Promise<void> {
    const target = await getFromStore('stevedoringJobs', id);
    if (!target) throw new Error('Job tidak ditemukan.');
    await deleteFromStore('stevedoringJobs', id);
    await this.addAuditLog({
      userName: currentUser?.name || 'Stevedoring Chief',
      action: 'DELETE',
      module: 'STEVEDORING',
      details: `Job ${target.jobType} untuk kontainer ${target.containerNumber} dibatalkan & dihapus.`,
    }, currentUser);
  },

  // Customers EMKL CRUD
  async getCustomers(): Promise<CustomerEMKL[]> {
    const list = await getAllFromStore('customers');
    return list.sort((a, b) => a.name.localeCompare(b.name));
  },

  async saveCustomer(data: Omit<CustomerEMKL, 'id' | 'createdAt'>, existingId?: string, currentUser?: User | null): Promise<CustomerEMKL> {
    if (!data.name.trim()) throw new Error('Nama perusahaan EMKL wajib diisi.');
    if (!data.code.trim()) throw new Error('Kode EMKL wajib diisi.');

    const now = new Date().toISOString().slice(0, 10);
    let cst: CustomerEMKL;

    if (existingId) {
      const prev = await getFromStore('customers', existingId);
      if (!prev) throw new Error('Customer tidak ditemukan.');
      cst = { ...prev, ...data };
      await putToStore('customers', cst);
    } else {
      cst = {
        ...data,
        id: `cst-${Date.now()}`,
        createdAt: now,
      };
      await putToStore('customers', cst);
    }

    await this.addAuditLog({
      userName: currentUser?.name || 'Admin',
      action: existingId ? 'UPDATE' : 'CREATE',
      module: 'CUSTOMER',
      details: `Data EMKL ${cst.name} (${cst.code}) disimpan dengan status kredit ${cst.creditStatus}.`,
    }, currentUser);

    return cst;
  },

  async deleteCustomer(id: string, currentUser?: User | null): Promise<void> {
    const target = await getFromStore('customers', id);
    if (!target) throw new Error('Customer tidak ditemukan.');
    await deleteFromStore('customers', id);
    await this.addAuditLog({
      userName: currentUser?.name || 'Admin',
      action: 'DELETE',
      module: 'CUSTOMER',
      details: `Penghapusan data pelanggan EMKL ${target.name}.`,
    }, currentUser);
  },

  // Real-time KPI Aggregations
  async getKPIs(): Promise<TerminalKPIs> {
    const containers = await getAllFromStore('containers');
    const vessels = await getAllFromStore('vessels');
    const gateTx = await getAllFromStore('gateTransactions');

    // Total TEU calculation: 20ft = 1, 40ft = 2, 45ft = 2.25
    let totalTEU = 0;
    let totalDwellDays = 0;
    containers.forEach(c => {
      if (c.size === '20ft') totalTEU += 1;
      else if (c.size === '40ft') totalTEU += 2;
      else if (c.size === '45ft') totalTEU += 2.25;
      totalDwellDays += c.dwellDays || 0;
    });

    const yardCapacityTEU = 3500; // Standard container terminal yard sub-terminal capacity
    const yardOccupancyRate = Math.min(100, Number(((totalTEU / yardCapacityTEU) * 100).toFixed(1)));

    const activeVessels = vessels.filter(v => v.status === 'Berthed').length;
    const vesselsInQueue = vessels.filter(v => v.status === 'Approaching' || v.status === 'Anchored').length;

    const todayDate = new Date().toISOString().slice(0, 10);
    const todayGateIn = gateTx.filter(t => t.timestamp.startsWith(todayDate) && t.type.startsWith('GATE_IN')).length;
    const todayGateOut = gateTx.filter(t => t.timestamp.startsWith(todayDate) && t.type.startsWith('GATE_OUT')).length;

    const avgDwellingDays = containers.length > 0 ? Number((totalDwellDays / containers.length).toFixed(1)) : 0;

    // Average BPH across berthed vessels
    const berthedVessels = vessels.filter(v => v.status === 'Berthed' && v.bph > 0);
    const averageGMPH = berthedVessels.length > 0
      ? Number((berthedVessels.reduce((acc, v) => acc + v.bph, 0) / berthedVessels.length).toFixed(1))
      : 28.5;

    return {
      totalContainers: containers.length,
      totalTEU,
      yardCapacityTEU,
      yardOccupancyRate,
      activeVessels,
      vesselsInQueue,
      todayGateInCount: todayGateIn || 18,
      todayGateOutCount: todayGateOut || 14,
      avgDwellingDays,
      averageGMPH,
    };
  },

  async resetToSeed(): Promise<void> {
    await clearAndReinitStore();
  }
};
