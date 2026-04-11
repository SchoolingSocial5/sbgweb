import { offlineDb, PendingRecord } from './offlineDb';
import apiRequest from './axios';
import { MessageStore } from '@/src/zustand/notification/Message';

class SyncService {
  private isSyncing = false;

  async startSync() {
    if (this.isSyncing) return;
    
    const pending = await offlineDb.getPendingRecords();
    if (pending.length === 0) return;

    console.log(`Starting sync for ${pending.length} records...`);
    this.isSyncing = true;

    for (const record of pending) {
      try {
        await this.syncRecord(record);
        console.log(`Successfully synced record ${record.uniqueId}`);
      } catch (error) {
        console.error(`Failed to sync record ${record.uniqueId}:`, error);
        await offlineDb.updateRecordStatus(record.id!, 'failed', String(error));
      }
    }

    this.isSyncing = false;
    
    // If more records were added during sync, run again
    const remaining = await offlineDb.getPendingRecords();
    if (remaining.length > 0) {
      this.startSync();
    }
  }

  private async syncRecord(record: PendingRecord) {
    const { setMessage } = MessageStore.getState();
    
    // Inject required fields for sync
    const body = record.body;
    
    // apiRequest handles FormData if needed, but for sync we usually send JSON or already converted data
    // Note: if the record was originally FormData, it was serialized to JSON in IndexedDB.
    // We might need to reconstruct it if the API strictly requires multipart.
    // However, most of these endpoints accept JSON except when images are involved.
    
    const response = await apiRequest(record.url, {
      method: 'POST',
      body: body,
      // We don't want the sync request to show loading spinners on the UI
      setLoading: undefined,
      setMessage: undefined, 
    });

    if (response.status === 200 || response.status === 201) {
      await offlineDb.deleteRecord(record.id!);
      return response.data;
    } else {
      throw new Error(`Server returned status ${response.status}`);
    }
  }

  init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('Network is back online. Triggering sync...');
      this.startSync();
    });

    // Check on init in case we started online
    if (navigator.onLine) {
      this.startSync();
    }
    
    // Periodic check every 5 minutes as a safety net
    setInterval(() => {
      if (navigator.onLine) this.startSync();
    }, 5 * 60 * 1000);
  }
}

export const syncService = new SyncService();
