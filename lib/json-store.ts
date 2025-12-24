import fs from 'fs/promises';
import path from 'path';
import { put, head, del } from '@vercel/blob';

const IS_PROD = process.env.NODE_ENV !== 'production';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const TMP_PATH = STORE_PATH + '.tmp';
const BLOB_PATHNAME = 'gym-store.json';

// Initialize directory for development
async function ensureDir() {
  if (IS_PROD) return; // Skip directory creation in production

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err: any) {
    // directory may already exist, ignore
    if (err.code !== 'EEXIST') throw err;
  }
}

/**
 * Read entire store from JSON file (dev) or Vercel Blob (prod)
 */
export async function readStore<T = any>(): Promise<T | null> {
  if (IS_PROD) {
    // Production: use Vercel Blob
    try {
      const blobMetadata = await head(BLOB_PATHNAME);
      // Construct download URL from the metadata
      const response = await fetch(blobMetadata.downloadUrl);
      if (!response.ok) return null;
      const raw = await response.text();
      return JSON.parse(raw) as T;
    } catch (err: any) {
      // Blob doesn't exist yet
      if (err.message?.includes('not found') || err.name === 'BlobNotFoundError') {
        return null;
      }
      throw err;
    }
  }

  // Development: use file storage
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw) as T;
  } catch (err: any) {
    if (err.code === 'ENOENT') return null; // file doesn't exist yet
    throw err;
  }
}

/**
 * Write entire store to JSON file (dev) or Vercel Blob (prod)
 */
export async function writeStore<T = any>(data: T): Promise<void> {
  const payload = JSON.stringify(data, null, 2);

  if (IS_PROD) {
    await put(BLOB_PATHNAME, payload, {
      contentType: 'application/json',
      access: 'public',
      allowOverwrite: true,
    });
  } else {
    // Development: use file storage
    await ensureDir();
    // write to temp file first, then rename for atomicity
    await fs.writeFile(TMP_PATH, payload, 'utf8');
    await fs.rename(TMP_PATH, STORE_PATH);
  }
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
  if (IS_PROD) {
    // Production: delete blob
    try {BLOB_PATHNAME
    } catch (err: any) {
      // Blob might not exist, ignore
      if (!err.message?.includes('not found') && err.name !== 'BlobNotFoundError') throw err;
    }
  } else {
    // Development: use file storage
    await writeStore({});
  }
}
