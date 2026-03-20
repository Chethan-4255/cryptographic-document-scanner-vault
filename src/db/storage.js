/**
 * Storage abstraction: IndexedDB → localStorage → in-memory fallback.
 * When IndexedDB is blocked (e.g. by extensions), localStorage gives persistence.
 */
import { db } from './evidenceVault';

const LS_KEY = 'EvidenceVault_documents';
const LS_NEXT_ID = 'EvidenceVault_nextId';

let mode = 'memory';
let reopenPromise = null;

const memoryStore = [];
let nextId = 1;

function getNextId() {
  if (mode === 'localStorage') {
    const docs = getLocalStorageDocs();
    const maxId = docs.length ? Math.max(...docs.map((d) => d.id ?? 0)) : 0;
    const stored = parseInt(localStorage.getItem(LS_NEXT_ID) || '1', 10);
    const n = Math.max(stored, maxId + 1);
    localStorage.setItem(LS_NEXT_ID, String(n + 1));
    return n;
  }
  return nextId++;
}

function getLocalStorageDocs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalStorageDocs(arr) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  } catch (e) {
    console.warn('localStorage quota exceeded:', e?.message);
  }
}

const memoryDocuments = {
  add: (obj) => {
    const id = getNextId();
    memoryStore.push({ ...obj, id });
    return Promise.resolve(id);
  },
  toArray: () => Promise.resolve([...memoryStore]),
  orderBy: (key) => ({
    reverse: () => ({
      toArray: () =>
        Promise.resolve([...memoryStore].sort((a, b) => (b[key] || 0) - (a[key] || 0))),
    }),
  }),
  bulkAdd: (arr) => {
    arr.forEach((o) => {
      memoryStore.push({ ...o, id: getNextId() });
    });
    return Promise.resolve();
  },
};

const localStorageDocuments = {
  add: (obj) => {
    const id = getNextId();
    const docs = getLocalStorageDocs();
    docs.push({ ...obj, id });
    setLocalStorageDocs(docs);
    return Promise.resolve(id);
  },
  toArray: () => Promise.resolve(getLocalStorageDocs()),
  orderBy: (key) => ({
    reverse: () => ({
      toArray: () =>
        Promise.resolve(
          [...getLocalStorageDocs()].sort((a, b) => (b[key] || 0) - (a[key] || 0))
        ),
    }),
  }),
  bulkAdd: (arr) => {
    const docs = getLocalStorageDocs();
    arr.forEach((o) => {
      docs.push({ ...o, id: getNextId() });
    });
    setLocalStorageDocs(docs);
    return Promise.resolve();
  },
};

function getFallbackStore() {
  return mode === 'localStorage' ? localStorageDocuments : memoryDocuments;
}

async function reopenDb() {
  if (!reopenPromise) {
    reopenPromise = (async () => {
      try {
        db.close();
      } catch (_) {}
      await db.open();
    })().finally(() => {
      reopenPromise = null;
    });
  }
  return reopenPromise;
}

async function withRecovery(operation) {
  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const inner = error?.inner;
      const isRecoverable =
        error?.name === 'DatabaseClosedError' ||
        error?.name === 'UnknownError' ||
        (inner && (inner.name === 'UnknownError' || inner.message?.includes('Internal error')));
      if (!isRecoverable || attempt === maxRetries) throw error;

      await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
      await reopenDb();
    }
  }
}

function tryLocalStorage() {
  try {
    const key = '__EvidenceVault_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export async function initStorage() {
  try {
    await db.open();
    mode = 'indexeddb';
    return true;
  } catch (_e) {
    if (tryLocalStorage()) {
      mode = 'localStorage';
      return true;
    }
    mode = 'memory';
    return false;
  }
}

export function getStorageMode() {
  return mode;
}

export async function retryIndexedDB() {
  try {
    db.close();
  } catch (_) {}
  return initStorage();
}

export const storage = {
  get mode() {
    return mode;
  },
  get isPersistent() {
    return mode === 'indexeddb' || mode === 'localStorage';
  },
  documents: {
    add: (obj) => {
      if (mode !== 'indexeddb') return getFallbackStore().add(obj);
      return withRecovery(() => db.documents.add(obj));
    },
    toArray: () => {
      if (mode !== 'indexeddb') return getFallbackStore().toArray();
      return withRecovery(() => db.documents.toArray());
    },
    orderBy: (key) => ({
      reverse: () => ({
        toArray: () => {
          if (mode !== 'indexeddb') return getFallbackStore().orderBy(key).reverse().toArray();
          return withRecovery(() => db.documents.orderBy(key).reverse().toArray());
        },
      }),
    }),
    bulkAdd: (arr) => {
      if (mode !== 'indexeddb') return getFallbackStore().bulkAdd(arr);
      return withRecovery(() => db.documents.bulkAdd(arr));
    },
  },
};
