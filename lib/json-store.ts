import fs from 'fs/promises';
import path from 'path';

const IS_PROD = process.env.NODE_ENV === 'production';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const TMP_PATH = STORE_PATH + '.tmp';
const KV_STORE_KEY = 'gym-store';

let kvClient: any = null;

// Initialize KV client only in production
async function getKvClient() {
  if (!IS_PROD) return null;
  
  if (!kvClient) {
    try {
      const { kv } = await import('@vercel/kv');
      kvClient = kv;
    } catch (err) {
      console.warn('Vercel KV not available, falling back to memory store');
      return null;
    }
  }
  return kvClient;
}

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
 * Read entire store from JSON file (dev) or KV (prod)
 */
export async function readStore<T = any>(): Promise<T | null> {
  if (IS_PROD) {
    const kv = await getKvClient();
    if (kv) {
      try {
        const data = await kv.get(KV_STORE_KEY);
        return data as T;
      } catch (err) {
        console.error('Failed to read from KV:', err);
        return null;
      }
    }
    return null;
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
 * Write entire store to JSON file (dev) or KV (prod)
 */
export async function writeStore<T = any>(data: T): Promise<void> {
  if (IS_PROD) {
    const kv = await getKvClient();
    if (kv) {
      try {
        await kv.set(KV_STORE_KEY, data);
        return;
      } catch (err) {
        console.error('Failed to write to KV:', err);
        throw err;
      }
    }
    throw new Error('Vercel KV not configured in production');
  }
  
  // Development: use file storage
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
  if (IS_PROD) {
    const kv = await getKvClient();
    if (kv) {
      try {
        await kv.del(KV_STORE_KEY);
        return;
      } catch (err) {
        console.error('Failed to clear KV:', err);
        throw err;
      }
    }
    throw new Error('Vercel KV not configured in production');
  }
  
  // Development: use file storage
  await writeStore({});
}
