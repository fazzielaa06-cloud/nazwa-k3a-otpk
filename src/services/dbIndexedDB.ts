import { 
  Container, 
  Vessel, 
  GateTransaction, 
  StevedoringJob, 
  CustomerEMKL, 
  User, 
  AuditLog 
} from '../types/terminal';
import { 
  INITIAL_CONTAINERS, 
  INITIAL_VESSELS, 
  INITIAL_GATE_TRANSACTIONS, 
  INITIAL_STEVEDORING_JOBS, 
  INITIAL_CUSTOMERS, 
  INITIAL_USERS, 
  INITIAL_AUDIT_LOGS 
} from '../server/seedData';

const DB_NAME = 'PortVessel_Terminal_DB';
const DB_VERSION = 2;

export interface DBStores {
  containers: Container;
  vessels: Vessel;
  gateTransactions: GateTransaction;
  stevedoringJobs: StevedoringJob;
  customers: CustomerEMKL;
  users: User & { passwordHash: string };
  auditLogs: AuditLog;
  session: { id: string; user: User; token: string; expiresAt: number };
}

let dbInstance: IDBDatabase | null = null;

export function openTerminalDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('containers')) {
        const store = db.createObjectStore('containers', { keyPath: 'id' });
        store.createIndex('containerNumber', 'containerNumber', { unique: true });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('shippingLine', 'shippingLine', { unique: false });
      }

      if (!db.objectStoreNames.contains('vessels')) {
        const store = db.createObjectStore('vessels', { keyPath: 'id' });
        store.createIndex('vesselName', 'vesselName', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('berthSlot', 'berthSlot', { unique: false });
      }

      if (!db.objectStoreNames.contains('gateTransactions')) {
        const store = db.createObjectStore('gateTransactions', { keyPath: 'id' });
        store.createIndex('eirNumber', 'eirNumber', { unique: true });
        store.createIndex('containerNumber', 'containerNumber', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains('stevedoringJobs')) {
        const store = db.createObjectStore('stevedoringJobs', { keyPath: 'id' });
        store.createIndex('containerNumber', 'containerNumber', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains('customers')) {
        const store = db.createObjectStore('customers', { keyPath: 'id' });
        store.createIndex('code', 'code', { unique: true });
      }

      if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', { keyPath: 'id' });
        store.createIndex('username', 'username', { unique: true });
        store.createIndex('email', 'email', { unique: true });
      }

      if (!db.objectStoreNames.contains('auditLogs')) {
        const store = db.createObjectStore('auditLogs', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('session')) {
        db.createObjectStore('session', { keyPath: 'id' });
      }
    };
  });
}

// Ensure database has initial seed data
export async function initSeedDataIfEmpty(): Promise<void> {
  const db = await openTerminalDB();
  const tx = db.transaction(['containers', 'vessels', 'gateTransactions', 'stevedoringJobs', 'customers', 'users', 'auditLogs'], 'readwrite');

  const containersCountReq = tx.objectStore('containers').count();

  return new Promise((resolve, reject) => {
    containersCountReq.onsuccess = () => {
      if (containersCountReq.result === 0) {
        // Seed initial collections
        const cntStore = tx.objectStore('containers');
        INITIAL_CONTAINERS.forEach(item => cntStore.put(item));

        const vslStore = tx.objectStore('vessels');
        INITIAL_VESSELS.forEach(item => vslStore.put(item));

        const eirStore = tx.objectStore('gateTransactions');
        INITIAL_GATE_TRANSACTIONS.forEach(item => eirStore.put(item));

        const stvStore = tx.objectStore('stevedoringJobs');
        INITIAL_STEVEDORING_JOBS.forEach(item => stvStore.put(item));

        const cstStore = tx.objectStore('customers');
        INITIAL_CUSTOMERS.forEach(item => cstStore.put(item));

        const usrStore = tx.objectStore('users');
        INITIAL_USERS.forEach(item => usrStore.put(item));

        const logStore = tx.objectStore('auditLogs');
        INITIAL_AUDIT_LOGS.forEach(item => logStore.put(item));
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Generic CRUD operations on IndexedDB
export async function getAllFromStore<K extends keyof DBStores>(storeName: K): Promise<DBStores[K][]> {
  const db = await openTerminalDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getFromStore<K extends keyof DBStores>(storeName: K, id: string): Promise<DBStores[K] | undefined> {
  const db = await openTerminalDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function putToStore<K extends keyof DBStores>(storeName: K, item: DBStores[K]): Promise<DBStores[K]> {
  const db = await openTerminalDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFromStore<K extends keyof DBStores>(storeName: K, id: string): Promise<void> {
  const db = await openTerminalDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAndReinitStore(): Promise<void> {
  const db = await openTerminalDB();
  return new Promise((resolve, reject) => {
    const stores: (keyof DBStores)[] = [
      'containers', 
      'vessels', 
      'gateTransactions', 
      'stevedoringJobs', 
      'customers', 
      'users', 
      'auditLogs'
    ];
    const tx = db.transaction(stores, 'readwrite');

    stores.forEach(s => {
      tx.objectStore(s).clear();
    });

    const cntStore = tx.objectStore('containers');
    INITIAL_CONTAINERS.forEach(item => cntStore.put(item));

    const vslStore = tx.objectStore('vessels');
    INITIAL_VESSELS.forEach(item => vslStore.put(item));

    const eirStore = tx.objectStore('gateTransactions');
    INITIAL_GATE_TRANSACTIONS.forEach(item => eirStore.put(item));

    const stvStore = tx.objectStore('stevedoringJobs');
    INITIAL_STEVEDORING_JOBS.forEach(item => stvStore.put(item));

    const cstStore = tx.objectStore('customers');
    INITIAL_CUSTOMERS.forEach(item => cstStore.put(item));

    const usrStore = tx.objectStore('users');
    INITIAL_USERS.forEach(item => usrStore.put(item));

    const logStore = tx.objectStore('auditLogs');
    INITIAL_AUDIT_LOGS.forEach(item => logStore.put(item));

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
