import fs from 'fs/promises';
import path from 'path';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const BLOB_STORE_NAME = 'gym-management-store.json';

// Local development paths
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const TMP_PATH = STORE_PATH + '.tmp';

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err: any) {
    // directory may already exist, ignore
    if (err.code !== 'EEXIST') throw err;
  }
}

/**
 * Read from Vercel Blob Storage
 */
async function readFromBlob<T = any>(): Promise<T | null> {
  try {
    const { list, download } = await import('@vercel/blob');
    
    // Check if the blob exists
    const blobs = await list();
    const blobExists = blobs.blobs.some(b => b.pathname === BLOB_STORE_NAME);
    
    if (!blobExists) {
      return null;
    }

    const blob = await download(BLOB_STORE_NAME);
    const raw = await blob.text();
    return JSON.parse(raw) as T;
  } catch (err: any) {
    console.error('Error reading from Vercel Blob:', err);
    // Return null if blob doesn't exist
    if (err.message?.includes('not found')) {
      return null;
    }
    throw err;
  }
}

/**
 * Write to Vercel Blob Storage
 */
async function writeToBlob<T = any>(data: T): Promise<void> {
  try {
    const { put } = await import('@vercel/blob');
    const payload = JSON.stringify(data, null, 2);
    await put(BLOB_STORE_NAME, payload, {
      contentType: 'application/json',
      access: 'private',
    });
  } catch (err: any) {
    console.error('Error writing to Vercel Blob:', err);
    throw err;
  }
}

/**
 * Read entire store from JSON file (local) or Vercel Blob (production)
 */
export async function readStore<T = any>(): Promise<T | null> {
  if (IS_PRODUCTION) {
    return readFromBlob<T>();
  }

  // Local development
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw) as T;
  } catch (err: any) {
    if (err.code === 'ENOENT') return null; // file doesn't exist yet
    throw err;
  }
}

/**
 * Write entire store to JSON file (local) or Vercel Blob (production)
 */
export async function writeStore<T = any>(data: T): Promise<void> {
  if (IS_PRODUCTION) {
    return writeToBlob(data);
  }

  // Local development
  await ensureDir();
  const payload = JSON.stringify(data, null, 2);
  // write to temp file first, then rename for atomicity
  await fs.writeFile(TMP_PATH, payload, 'utf8');
  await fs.rename(TMP_PATH, STORE_PATH);
}

/**
 * Get a single key-value pair from store
 */
export async function getItem(key: string): Promise<string | null> {
  const store = (await readStore<Record<string, string>>()) || {};
  return store[key] || null;
}

/**
 * Set a key-value pair in store
 */
export async function setItem(key: string, value: string): Promise<void> {
  const store = (await readStore<Record<string, string>>()) || {};
  store[key] = value;
  await writeStore(store);
}

/**
 * Clear all data from store
 */
export async function clearStore(): Promise<void> {
  await writeStore({});
}
