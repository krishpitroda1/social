import fs from 'fs';
import path from 'path';
import { Organization, Subsidiary, SocialAccount, ScheduledPost } from '@/types';
import {
  mockOrganization,
  mockSubsidiaries,
  mockSocialAccounts,
  mockPosts,
} from '@/lib/mock-data';

interface DatabaseSchema {
  organization: Organization;
  subsidiaries: Subsidiary[];
  socialAccounts: SocialAccount[];
  posts: ScheduledPost[];
  updatedAt: string;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Memory cache for serverless runtimes
let memoryCache: DatabaseSchema | null = null;

function getInitialData(): DatabaseSchema {
  return {
    organization: mockOrganization,
    subsidiaries: mockSubsidiaries,
    socialAccounts: mockSocialAccounts,
    posts: mockPosts,
    updatedAt: new Date().toISOString(),
  };
}

export async function readDatabase(): Promise<DatabaseSchema> {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = await fs.promises.readFile(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content) as DatabaseSchema;
      memoryCache = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('[server-db] Failed to read db.json, checking memory cache or initializing:', err);
  }

  if (memoryCache) {
    return memoryCache;
  }

  const initial = getInitialData();
  await writeDatabase(initial);
  return initial;
}

export async function writeDatabase(data: DatabaseSchema): Promise<void> {
  memoryCache = data;
  data.updatedAt = new Date().toISOString();

  try {
    if (!fs.existsSync(DB_DIR)) {
      await fs.promises.mkdir(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    await fs.promises.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    await fs.promises.rename(tempFile, DB_FILE);
  } catch (err) {
    console.error('[server-db] Failed to write db.json to disk (falling back to memory):', err);
  }
}

// -------------------------------------------------------------
// Organization Operations
// -------------------------------------------------------------
export async function getDbOrganization(): Promise<Organization> {
  const db = await readDatabase();
  return db.organization;
}

export async function updateDbOrganization(updates: Partial<Organization>): Promise<Organization> {
  const db = await readDatabase();
  db.organization = {
    ...db.organization,
    ...updates,
  };
  await writeDatabase(db);
  return db.organization;
}

// -------------------------------------------------------------
// Subsidiary Operations
// -------------------------------------------------------------
export async function getDbSubsidiaries(): Promise<Subsidiary[]> {
  const db = await readDatabase();
  return db.subsidiaries;
}

export async function updateDbSubsidiary(updated: Subsidiary): Promise<Subsidiary> {
  const db = await readDatabase();
  const index = db.subsidiaries.findIndex((s) => s.id === updated.id);

  if (index >= 0) {
    db.subsidiaries[index] = { ...db.subsidiaries[index], ...updated };
  } else {
    db.subsidiaries.push(updated);
  }

  await writeDatabase(db);
  return updated;
}

export async function addDbSubsidiary(newSub: Subsidiary): Promise<Subsidiary> {
  const db = await readDatabase();
  const exists = db.subsidiaries.some((s) => s.id === newSub.id);
  if (!exists) {
    db.subsidiaries.push(newSub);
  }
  await writeDatabase(db);
  return newSub;
}

export async function deleteDbSubsidiary(id: string): Promise<boolean> {
  const db = await readDatabase();
  const initialLength = db.subsidiaries.length;
  db.subsidiaries = db.subsidiaries.filter((s) => s.id !== id);
  db.socialAccounts = db.socialAccounts.filter((a) => a.subsidiaryId !== id);
  db.posts = db.posts.filter((p) => p.subsidiaryId !== id);

  await writeDatabase(db);
  return db.subsidiaries.length < initialLength;
}

// -------------------------------------------------------------
// Social Account Operations
// -------------------------------------------------------------
export async function updateDbSocialAccount(account: SocialAccount): Promise<SocialAccount> {
  const db = await readDatabase();
  const index = db.socialAccounts.findIndex(
    (a) => a.subsidiaryId === account.subsidiaryId && a.platform === account.platform
  );

  if (index >= 0) {
    db.socialAccounts[index] = { ...db.socialAccounts[index], ...account };
  } else {
    db.socialAccounts.push(account);
  }

  // Update activeAccountsCount on subsidiary
  const activeCount = db.socialAccounts.filter(
    (a) => a.subsidiaryId === account.subsidiaryId && a.connectionStatus === 'CONNECTED'
  ).length;

  const subIndex = db.subsidiaries.findIndex((s) => s.id === account.subsidiaryId);
  if (subIndex >= 0) {
    db.subsidiaries[subIndex].activeAccountsCount = activeCount;
  }

  await writeDatabase(db);
  return account;
}

// -------------------------------------------------------------
// Scheduled Post Operations
// -------------------------------------------------------------
export async function getDbPosts(): Promise<ScheduledPost[]> {
  const db = await readDatabase();
  return db.posts;
}

export async function addDbPost(newPost: ScheduledPost): Promise<ScheduledPost> {
  const db = await readDatabase();
  db.posts.unshift(newPost);
  await writeDatabase(db);
  return newPost;
}

export async function deleteDbPost(id: string): Promise<boolean> {
  const db = await readDatabase();
  const initialLength = db.posts.length;
  db.posts = db.posts.filter((p) => p.id !== id);
  await writeDatabase(db);
  return db.posts.length < initialLength;
}

// -------------------------------------------------------------
// Reset to Defaults (Factory Reset)
// -------------------------------------------------------------
export async function resetDbToDefaults(): Promise<DatabaseSchema> {
  const initial = getInitialData();
  await writeDatabase(initial);
  return initial;
}
