import fs from 'fs/promises';
import path from 'path';

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
 * Read entire store from JSON file
 */
export async function readStore<T = any>(): Promise<T | null> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw) as T;
  } catch (err: any) {
    if (err.code === 'ENOENT') return null; // file doesn't exist yet
    throw err;
  }
}

/**
 * Write entire store to JSON file (atomic with temp file + rename)
 */
export async function writeStore<T = any>(data: T): Promise<void> {
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
