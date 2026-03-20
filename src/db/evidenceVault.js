/**
 * EvidenceVault - Dexie wrapper for our offline document fingerprint store.
 * Everything stays in IndexedDB. Nothing syncs to the cloud. Ever.
 */
import Dexie from 'dexie';

export const db = new Dexie('EvidenceVault');

// ++id gives us auto-increment. We index hash for fast lookup during verification.
db.version(1).stores({
  documents: '++id, fileName, hash, timestamp, officerId',
});

export default db;
