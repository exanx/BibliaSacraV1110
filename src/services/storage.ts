export const localDB = {
  db: null as IDBDatabase | null,

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('SanctaBibliaDB', 2);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('store')) {
          db.createObjectStore('store');
        }
      };
      req.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };
      req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
    });
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const req = db.transaction('store', 'readonly').objectStore('store').get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`LocalDB get error for ${key}:`, e);
      return null;
    }
  },

  async set<T>(key: string, val: T): Promise<void> {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const req = db.transaction('store', 'readwrite').objectStore('store').put(val, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`LocalDB set error for ${key}:`, e);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const req = db.transaction('store', 'readwrite').objectStore('store').delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`LocalDB remove error for ${key}:`, e);
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const req = db.transaction('store', 'readonly').objectStore('store').getAllKeys();
        req.onsuccess = () => resolve((req.result as string[]) || []);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('LocalDB getAllKeys error:', e);
      return [];
    }
  },

  async deletePrefix(prefix: string): Promise<number> {
    try {
      const db = await this.init();
      const keys = await this.getAllKeys();
      const matchingKeys = keys.filter(k => typeof k === 'string' && k.startsWith(prefix));
      if (matchingKeys.length === 0) return 0;

      return new Promise((resolve, reject) => {
        const tx = db.transaction('store', 'readwrite');
        const store = tx.objectStore('store');
        matchingKeys.forEach(k => store.delete(k));
        tx.oncomplete = () => resolve(matchingKeys.length);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('LocalDB deletePrefix error:', e);
      return 0;
    }
  }
};
