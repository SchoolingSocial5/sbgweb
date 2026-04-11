import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'SBG_Offline_DB';
const DB_VERSION = 1;
const STORE_NAME = 'pending_records';

export interface PendingRecord {
  id?: number;
  uniqueId: string;
  type: 'sale' | 'purchase' | 'production' | 'consumption' | 'mortality';
  url: string;
  body: any;
  status: 'pending' | 'syncing' | 'failed';
  createdAt: string;
  error?: string;
}

class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('uniqueId', 'uniqueId', { unique: true });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve(this.db!);
      };

      request.onerror = (event: any) => {
        reject('IndexedDB error: ' + event.target.errorCode);
      };
    });
  }

  async saveRecord(record: Omit<PendingRecord, 'uniqueId' | 'status' | 'createdAt'>): Promise<number> {
    const db = await this.init();
    const newRecord: PendingRecord = {
      ...record,
      uniqueId: uuidv4(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(newRecord);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject('Failed to save record');
    });
  }

  async getPendingRecords(): Promise<PendingRecord[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result as PendingRecord[]);
      request.onerror = () => reject('Failed to fetch pending records');
    });
  }

  async deleteRecord(id: number): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Failed to delete record');
    });
  }

  async updateRecordStatus(id: number, status: PendingRecord['status'], error?: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.status = status;
          if (error) data.error = error;
          store.put(data);
          resolve();
        } else {
          reject('Record not found');
        }
      };
      getRequest.onerror = () => reject('Failed to update record');
    });
  }
}

export const offlineDb = new OfflineDB();
