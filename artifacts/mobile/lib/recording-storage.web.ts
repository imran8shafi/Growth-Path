function openRecordings(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('jack-of-all-recordings', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('takes');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Recording storage is blocked by another tab'));
  });
}
async function transact(id: string, mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest): Promise<unknown> {
  if (!/^take-[a-z0-9-]+$/.test(id)) throw new Error('Invalid recording');
  const db = await openRecordings();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('takes', mode); const request = operation(tx.objectStore('takes'));
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error ?? request.error); };
  });
}
export async function saveRecording(id: string, uri: string) {
  if (!uri.startsWith('blob:')) throw new Error('Expected a local microphone recording');
  const blob = await (await fetch(uri)).blob();
  if (!blob.size || blob.size > 12 * 1024 * 1024) throw new Error('Recording was empty or too large');
  await transact(id, 'readwrite', (store) => store.put(blob, id));
}
export async function loadRecording(id: string): Promise<string> {
  const blob = await transact(id, 'readonly', (store) => store.get(id));
  if (!(blob instanceof Blob)) throw new Error('This recording is no longer in this browser');
  return URL.createObjectURL(blob);
}
export async function removeRecording(id: string) { await transact(id, 'readwrite', (store) => store.delete(id)); }
export function releaseRecording(uri: string) { URL.revokeObjectURL(uri); }
