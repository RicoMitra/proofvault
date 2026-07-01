import { validateEvidenceItem } from "./validation";
import type { EvidenceItem } from "./types";

const DATABASE_NAME = "evidence-os";
const DATABASE_VERSION = 1;
const ITEM_STORE = "evidence-items";

function getIndexedDb(): IDBFactory {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is not available in this environment.");
  }

  return indexedDB;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = getIndexedDb().open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ITEM_STORE)) {
        db.createObjectStore(ITEM_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open Evidence OS storage."));
  });
}

function withStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(ITEM_STORE, mode);
        const store = transaction.objectStore(ITEM_STORE);
        const request = action(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => {
          db.close();
          reject(transaction.error ?? new Error("IndexedDB transaction failed."));
        };
      })
  );
}

export async function listEvidenceItems(): Promise<EvidenceItem[]> {
  const items = await withStore<EvidenceItem[]>("readonly", (store) => store.getAll() as IDBRequest<EvidenceItem[]>);
  return items.filter((item) => validateEvidenceItem(item).ok);
}

export async function saveEvidenceItem(item: EvidenceItem): Promise<void> {
  const validation = validateEvidenceItem(item);
  if (!validation.ok) {
    throw new Error(validation.errors.join(" "));
  }

  await withStore<IDBValidKey>("readwrite", (store) => store.put(item));
}

export async function deleteEvidenceItem(id: string): Promise<void> {
  await withStore<undefined>("readwrite", (store) => store.delete(id) as IDBRequest<undefined>);
}

export async function replaceAllEvidenceItems(items: EvidenceItem[]): Promise<void> {
  const invalid = items.map(validateEvidenceItem).find((result) => !result.ok);
  if (invalid && !invalid.ok) {
    throw new Error(invalid.errors.join(" "));
  }

  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(ITEM_STORE, "readwrite");
    const store = transaction.objectStore(ITEM_STORE);
    store.clear();
    items.forEach((item) => store.put(item));
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error ?? new Error("Unable to replace Evidence OS items."));
    };
  });
}

export async function clearEvidenceItems(): Promise<void> {
  await withStore<undefined>("readwrite", (store) => store.clear() as IDBRequest<undefined>);
}
