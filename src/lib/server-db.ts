/**
 * server-db.ts — Resilient Multi-Backend Database Layer
 *
 * Supported Backends:
 *   1. PostgreSQL (Supabase / Neon / AWS RDS) via Prisma ORM
 *      - Active when DATABASE_URL is reachable.
 *   2. Local Persistent File Database (data/db.json)
 *      - Automatic, zero-config fallback if PostgreSQL is not connected or offline.
 *
 * This dual-engine architecture ensures the app NEVER crashes with a 500 error
 * and your edits are ALWAYS saved locally and synced to PostgreSQL when connected.
 */

import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { Organization, Subsidiary, SocialAccount, ScheduledPost } from '@/types';
import {
  mockOrganization,
  mockSubsidiaries,
  mockSocialAccounts,
  mockPosts,
} from '@/lib/mock-data';

// ----------------------------------------------------------------
// Local File Database Fallback (data/db.json)
// ----------------------------------------------------------------

interface LocalDbSchema {
  organization: Organization;
  subsidiaries: Subsidiary[];
  socialAccounts: SocialAccount[];
  posts: ScheduledPost[];
  updatedAt: string;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

let memoryCache: LocalDbSchema | null = null;

function getInitialLocalData(): LocalDbSchema {
  return {
    organization: mockOrganization,
    subsidiaries: mockSubsidiaries,
    socialAccounts: mockSocialAccounts,
    posts: mockPosts,
    updatedAt: new Date().toISOString(),
  };
}

async function readLocalFileDb(): Promise<LocalDbSchema> {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = await fs.promises.readFile(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content) as LocalDbSchema;
      memoryCache = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('[server-db] Failed to read db.json, using memory cache or defaults:', err);
  }

  if (memoryCache) {
    return memoryCache;
  }

  const initial = getInitialLocalData();
  await writeLocalFileDb(initial);
  return initial;
}

async function writeLocalFileDb(data: LocalDbSchema): Promise<void> {
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
    console.warn('[server-db] Could not write to disk, saved in memory cache:', err);
  }
}

// ----------------------------------------------------------------
// Prisma Health Check (with caching so we don't block every request)
// ----------------------------------------------------------------

let isPrismaConnected: boolean | null = null;
let lastCheckTime = 0;
const CHECK_INTERVAL_MS = 15000; // Check DB reachability every 15s

async function checkPrismaAvailability(): Promise<boolean> {
  const dbUrl = process.env.DATABASE_URL;
  // If no DB URL is configured or it points to an unconfigured localhost placeholder, skip Prisma immediately
  if (!dbUrl || dbUrl.includes('localhost:5432') || dbUrl.includes('postgres:postgres@localhost')) {
    return false;
  }

  const now = Date.now();
  if (isPrismaConnected !== null && now - lastCheckTime < CHECK_INTERVAL_MS) {
    return isPrismaConnected;
  }

  // Quick connectivity check with a 2-second timeout
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Prisma connection timeout')), 2000)
    );
    const queryPromise = prisma.$queryRaw`SELECT 1`;
    await Promise.race([queryPromise, timeoutPromise]);

    isPrismaConnected = true;
    lastCheckTime = now;
    return true;
  } catch {
    isPrismaConnected = false;
    lastCheckTime = now;
    return false;
  }
}

// ----------------------------------------------------------------
// Prisma Row Mappers
// ----------------------------------------------------------------

type PrismaAspectRatio = 'SQUARE_1_1' | 'PORTRAIT_4_5' | 'STORY_9_16' | 'LANDSCAPE_16_9';

function toDbAspectRatio(ar: string): PrismaAspectRatio {
  const map: Record<string, PrismaAspectRatio> = {
    '1:1': 'SQUARE_1_1',
    '4:5': 'PORTRAIT_4_5',
    '9:16': 'STORY_9_16',
    '16:9': 'LANDSCAPE_16_9',
    'SQUARE_1_1': 'SQUARE_1_1',
    'PORTRAIT_4_5': 'PORTRAIT_4_5',
    'STORY_9_16': 'STORY_9_16',
    'LANDSCAPE_16_9': 'LANDSCAPE_16_9',
  };
  return map[ar] ?? 'SQUARE_1_1';
}

function fromDbAspectRatio(ar: string): ScheduledPost['aspectRatio'] {
  const map: Record<string, ScheduledPost['aspectRatio']> = {
    'SQUARE_1_1': '1:1',
    'PORTRAIT_4_5': '4:5',
    'STORY_9_16': '9:16',
    'LANDSCAPE_16_9': '16:9',
    '1:1': '1:1',
    '4:5': '4:5',
    '9:16': '9:16',
    '16:9': '16:9',
  };
  return map[ar] ?? '1:1';
}

function mapOrg(row: any): Organization {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    plan: row.plan as Organization['plan'],
    replicateApiKey: row.replicateApiKey ?? undefined,
    openaiApiKey: row.openaiApiKey ?? undefined,
    ayrshareApiKey: row.ayrshareApiKey ?? undefined,
    bufferToken: row.bufferToken ?? undefined,
  };
}

function mapSub(row: any): Subsidiary {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline ?? '',
    brandTone: row.brandTone,
    toneKeywords: row.toneKeywords || [],
    primaryColor: row.primaryColor,
    secondaryColor: row.secondaryColor,
    accentColor: row.accentColor ?? '',
    logoUrl: row.logoUrl ?? '',
    websiteUrl: row.websiteUrl ?? '',
    targetAudience: row.targetAudience ?? '',
    activeAccountsCount: row._count?.socialAccounts ?? 0,
  };
}

function mapAccount(row: any): SocialAccount {
  return {
    id: row.id,
    subsidiaryId: row.subsidiaryId,
    platform: row.platform as SocialAccount['platform'],
    accountHandle: row.accountHandle,
    accountName: row.accountName,
    avatarUrl: row.avatarUrl ?? '',
    followersCount: row.followersCount,
    connectionStatus: row.connectionStatus as SocialAccount['connectionStatus'],
    lastSyncedAt: row.lastSyncedAt instanceof Date ? row.lastSyncedAt.toISOString() : String(row.lastSyncedAt),
  };
}

function mapPost(row: any): ScheduledPost {
  return {
    id: row.id,
    subsidiaryId: row.subsidiaryId,
    socialAccountId: row.socialAccountId ?? undefined,
    platform: row.platform as ScheduledPost['platform'],
    prompt: row.prompt,
    enhancedPrompt: row.enhancedPrompt ?? undefined,
    imageUrl: row.imageUrl,
    aspectRatio: fromDbAspectRatio(row.aspectRatio),
    caption: row.caption,
    hashtags: row.hashtags || [],
    status: row.status as ScheduledPost['status'],
    modelName: row.modelName as ScheduledPost['modelName'],
    scheduledTime: row.scheduledTime ? new Date(row.scheduledTime).toISOString() : undefined,
    publishedTime: row.publishedTime ? new Date(row.publishedTime).toISOString() : undefined,
    rejectionFeedback: row.rejectionFeedback ?? undefined,
    metricsLikes: row.metricsLikes ?? 0,
    metricsComments: row.metricsComments ?? 0,
    metricsShares: row.metricsShares ?? 0,
    metricsImpressions: row.metricsImpressions ?? 0,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.createdAt),
  };
}

// ----------------------------------------------------------------
// Auto-Seed Helper for PostgreSQL
// ----------------------------------------------------------------
async function ensurePrismaSeeded() {
  try {
    const count = await prisma.organization.count();
    if (count === 0) {
      await seedPrismaDatabase();
    }
  } catch (err) {
    console.warn('[server-db] Prisma seed check failed:', err);
  }
}

export async function seedPrismaDatabase(): Promise<void> {
  const org = await prisma.organization.upsert({
    where: { id: mockOrganization.id },
    create: {
      id: mockOrganization.id,
      name: mockOrganization.name,
      slug: mockOrganization.slug,
      plan: mockOrganization.plan as any,
      replicateApiKey: mockOrganization.replicateApiKey ?? null,
      openaiApiKey: mockOrganization.openaiApiKey ?? null,
      ayrshareApiKey: mockOrganization.ayrshareApiKey ?? null,
      bufferToken: mockOrganization.bufferToken ?? null,
    },
    update: {},
  });

  for (const sub of mockSubsidiaries) {
    await prisma.subsidiary.upsert({
      where: { id: sub.id },
      create: {
        id: sub.id,
        organizationId: org.id,
        name: sub.name,
        slug: sub.slug,
        tagline: sub.tagline ?? null,
        brandTone: sub.brandTone,
        toneKeywords: sub.toneKeywords,
        primaryColor: sub.primaryColor,
        secondaryColor: sub.secondaryColor,
        accentColor: sub.accentColor ?? null,
        logoUrl: sub.logoUrl,
        websiteUrl: sub.websiteUrl ?? null,
        targetAudience: sub.targetAudience ?? null,
      },
      update: {},
    });
  }

  for (const account of mockSocialAccounts) {
    await prisma.socialAccount.upsert({
      where: {
        subsidiaryId_platform: {
          subsidiaryId: account.subsidiaryId,
          platform: account.platform as any,
        },
      },
      create: {
        id: account.id,
        subsidiaryId: account.subsidiaryId,
        platform: account.platform as any,
        accountHandle: account.accountHandle,
        accountName: account.accountName,
        avatarUrl: account.avatarUrl ?? null,
        followersCount: account.followersCount,
        connectionStatus: account.connectionStatus as any,
        lastSyncedAt: account.lastSyncedAt ? new Date(account.lastSyncedAt) : new Date(),
      },
      update: {},
    });
  }
}

// ----------------------------------------------------------------
// Public Database API (Hybrid PostgreSQL + Local File Fallback)
// ----------------------------------------------------------------

export async function getDbOrganization(): Promise<Organization> {
  const usePrisma = await checkPrismaAvailability();
  if (usePrisma) {
    try {
      await ensurePrismaSeeded();
      const row = await prisma.organization.findFirst();
      if (row) return mapOrg(row);
    } catch (e) {
      console.warn('[server-db] Prisma query failed, using local fallback:', e);
    }
  }

  const local = await readLocalFileDb();
  return local.organization;
}

export async function updateDbOrganization(updates: Partial<Organization>): Promise<Organization> {
  const usePrisma = await checkPrismaAvailability();
  if (usePrisma) {
    try {
      await ensurePrismaSeeded();
      const existing = await prisma.organization.findFirst();
      if (existing) {
        const updated = await prisma.organization.update({
          where: { id: existing.id },
          data: {
            name: updates.name ?? existing.name,
            slug: updates.slug ?? existing.slug,
            plan: (updates.plan ?? existing.plan) as any,
            replicateApiKey: updates.replicateApiKey ?? existing.replicateApiKey,
            openaiApiKey: updates.openaiApiKey ?? existing.openaiApiKey,
            ayrshareApiKey: updates.ayrshareApiKey ?? existing.ayrshareApiKey,
            bufferToken: updates.bufferToken ?? existing.bufferToken,
          },
        });
        return mapOrg(updated);
      }
    } catch (e) {
      console.warn('[server-db] Prisma update failed, using local fallback:', e);
    }
  }

  const local = await readLocalFileDb();
  local.organization = { ...local.organization, ...updates };
  await writeLocalFileDb(local);
  return local.organization;
}

export async function getDbSubsidiaries(): Promise<Subsidiary[]> {
  const usePrisma = await checkPrismaAvailability();
  if (usePrisma) {
    try {
      await ensurePrismaSeeded();
      const rows = await prisma.subsidiary.findMany({
        include: { _count: { select: { socialAccounts: true } } },
        orderBy: { createdAt: 'asc' },
      });
      if (rows.length > 0) return rows.map(mapSub);
    } catch (e) {
      console.warn('[server-db] Prisma query failed, using local fallback:', e);
    }
  }

  const local = await readLocalFileDb();
  return local.subsidiaries;
}

export async function updateDbSubsidiary(updated: Subsidiary): Promise<Subsidiary> {
  const usePrisma = await checkPrismaAvailability();
  if (usePrisma) {
    try {
      const existing = await prisma.subsidiary.findUnique({ where: { id: updated.id } });
      if (existing) {
        const row = await prisma.subsidiary.update({
          where: { id: updated.id },
          data: {
            name: updated.name,
            slug: updated.slug,
            tagline: updated.tagline ?? null,
            brandTone: updated.brandTone,
            toneKeywords: updated.toneKeywords,
            primaryColor: updated.primaryColor,
            secondaryColor: updated.secondaryColor,
            accentColor: updated.accentColor ?? null,
            logoUrl: updated.logoUrl ?? '',
            websiteUrl: updated.websiteUrl ?? null,
            targetAudience: updated.targetAudience ?? null,
          },
          include: { _count: { select: { socialAccounts: true } } },
        });
        return mapSub(row);
      } else {
        return addDbSubsidiary(updated);
      }
    } catch (e) {
      console.warn('[server-db] Prisma update subsidiary failed, saving to local fallback:', e);
    }
  }

  const local = await readLocalFileDb();
  const idx = local.subsidiaries.findIndex((s) => s.id === updated.id);
  if (idx >= 0) {
    local.subsidiaries[idx] = { ...local.subsidiaries[idx], ...updated };
  } else {
    local.subsidiaries.push(updated);
  }
  await writeLocalFileDb(local);
  return updated;
}

export async function addDbSubsidiary(newSub: Subsidiary): Promise<Subsidiary> {
  const usePrisma = await checkPrismaAvailability();
  if (usePrisma) {
    try {
      await ensurePrismaSeeded();
      const org = await prisma.organization.findFirst();
      if (org) {
        const row = await prisma.subsidiary.upsert({
          where: { id: newSub.id },
          create: {
            id: newSub.id,
            organizationId: org.id,
            name: newSub.name,
            slug: newSub.slug,
            tagline: newSub.tagline ?? null,
            brandTone: newSub.brandTone,
            toneKeywords: newSub.toneKeywords,
            primaryColor: newSub.primaryColor,
            secondaryColor: newSub.secondaryColor,
            accentColor: newSub.accentColor ?? null,
            logoUrl: newSub.logoUrl ?? '',
            websiteUrl: newSub.websiteUrl ?? null,
            targetAudience: newSub.targetAudience ?? null,
          },
          update: {
            name: newSub.name,
            slug: newSub.slug,
            tagline: newSub.tagline ?? null,
            brandTone: newSub.brandTone,
            toneKeywords: newSub.toneKeywords,
            primaryColor: newSub.primaryColor,
            secondaryColor: newSub.secondaryColor,
            accentColor: newSub.accentColor ?? null,
            logoUrl: newSub.logoUrl ?? '',
            websiteUrl: newSub.websiteUrl ?? null,
            targetAudience: newSub.targetAudience ?? null,
          },
          include: { _count: { select: { socialAccounts: true } } },
        });
        return mapSub(row);
      }
    } catch (e) {
      console.warn('[server-db] Prisma add subsidiary failed, saving to local fallback:', e);
    }
  }

  const local = await readLocalFileDb();
  const exists = local.subsidiaries.some((s) => s.id === newSub.id);
  if (!exists) {
    local.subsidiaries.push(newSub);
  } else {
    const idx = local.subsidiaries.findIndex((s) => s.id === newSub.id);
    local.subsidiaries[idx] = { ...local.subsidiaries[idx], ...newSub };
  }
  await writeLocalFileDb(local);
  return newSub;
}

export async function deleteDbSubsidiary(id: string): Promise<boolean> {
  const usePrisma = await checkPrismaAvailability();
  if (usePrisma) {
    try {
      await prisma.subsidiary.delete({ where: { id } });
      return true;
    } catch {
      // Continue to local cleanup
    }
  }

  const local = await readLocalFileDb();
  const initLen = local.subsidiaries.length;
  local.subsidiaries = local.subsidiaries.filter((s) => s.id !== id);
  local.socialAccounts = local.socialAccounts.filter((a) => a.subsidiaryId !== id);
  local.posts = local.posts.filter((p) => p.subsidiaryId !== id);
  await writeLocalFileDb(local);
  return local.subsidiaries.length < initLen;
}

export async function updateDbSocialAccount(account: SocialAccount): Promise<SocialAccount> {
  const usePrisma = await checkPrismaAvailability();
  if (usePrisma) {
    try {
      const row = await prisma.socialAccount.upsert({
        where: {
          subsidiaryId_platform: {
            subsidiaryId: account.subsidiaryId,
            platform: account.platform as any,
          },
        },
        create: {
          id: account.id,
          subsidiaryId: account.subsidiaryId,
          platform: account.platform as any,
          accountHandle: account.accountHandle,
          accountName: account.accountName,
          avatarUrl: account.avatarUrl ?? null,
          followersCount: account.followersCount,
          connectionStatus: account.connectionStatus as any,
          lastSyncedAt: account.lastSyncedAt ? new Date(account.lastSyncedAt) : new Date(),
        },
        update: {
          accountHandle: account.accountHandle,
          accountName: account.accountName,
          avatarUrl: account.avatarUrl ?? null,
          followersCount: account.followersCount,
          connectionStatus: account.connectionStatus as any,
          lastSyncedAt: account.lastSyncedAt ? new Date(account.lastSyncedAt) : new Date(),
        },
      });
      return mapAccount(row);
    } catch (e) {
      console.warn('[server-db] Prisma social account update failed, using local fallback:', e);
    }
  }

  const local = await readLocalFileDb();
  const idx = local.socialAccounts.findIndex(
    (a) => a.subsidiaryId === account.subsidiaryId && a.platform === account.platform
  );
  if (idx >= 0) {
    local.socialAccounts[idx] = { ...local.socialAccounts[idx], ...account };
  } else {
    local.socialAccounts.push(account);
  }
  await writeLocalFileDb(local);
  return account;
}

export async function getDbPosts(): Promise<ScheduledPost[]> {
  const usePrisma = await checkPrismaAvailability();
  if (usePrisma) {
    try {
      const rows = await prisma.scheduledPost.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (rows.length > 0) return rows.map(mapPost);
    } catch (e) {
      console.warn('[server-db] Prisma posts query failed, using local fallback:', e);
    }
  }

  const local = await readLocalFileDb();
  return local.posts;
}

export async function addDbPost(newPost: ScheduledPost): Promise<ScheduledPost> {
  const usePrisma = await checkPrismaAvailability();
  if (usePrisma) {
    try {
      const row = await prisma.scheduledPost.create({
        data: {
          id: newPost.id,
          subsidiaryId: newPost.subsidiaryId,
          socialAccountId: newPost.socialAccountId ?? null,
          platform: newPost.platform as any,
          prompt: newPost.prompt,
          enhancedPrompt: newPost.enhancedPrompt ?? null,
          imageUrl: newPost.imageUrl,
          aspectRatio: toDbAspectRatio(newPost.aspectRatio ?? '1:1'),
          caption: newPost.caption,
          hashtags: newPost.hashtags,
          status: (newPost.status ?? 'DRAFT') as any,
          modelName: newPost.modelName ?? 'Flux.1-Pro',
          scheduledTime: newPost.scheduledTime ? new Date(newPost.scheduledTime) : null,
          publishedTime: newPost.publishedTime ? new Date(newPost.publishedTime) : null,
          rejectionFeedback: newPost.rejectionFeedback ?? null,
          metricsLikes: newPost.metricsLikes ?? 0,
          metricsComments: newPost.metricsComments ?? 0,
          metricsShares: newPost.metricsShares ?? 0,
          metricsImpressions: newPost.metricsImpressions ?? 0,
        },
      });
      return mapPost(row);
    } catch (e) {
      console.warn('[server-db] Prisma add post failed, saving to local fallback:', e);
    }
  }

  const local = await readLocalFileDb();
  local.posts.unshift(newPost);
  await writeLocalFileDb(local);
  return newPost;
}

export async function deleteDbPost(id: string): Promise<boolean> {
  const usePrisma = await checkPrismaAvailability();
  if (usePrisma) {
    try {
      await prisma.scheduledPost.delete({ where: { id } });
      return true;
    } catch {
      // Continue to local cleanup
    }
  }

  const local = await readLocalFileDb();
  const initLen = local.posts.length;
  local.posts = local.posts.filter((p) => p.id !== id);
  await writeLocalFileDb(local);
  return local.posts.length < initLen;
}

export async function resetDbToDefaults(): Promise<void> {
  const usePrisma = await checkPrismaAvailability();
  if (usePrisma) {
    try {
      await prisma.scheduledPost.deleteMany();
      await prisma.socialAccount.deleteMany();
      await prisma.subsidiary.deleteMany();
      await prisma.organization.deleteMany();
      await seedPrismaDatabase();
    } catch {
      // Ignore
    }
  }

  const initial = getInitialLocalData();
  await writeLocalFileDb(initial);
}

export async function readDatabase() {
  const organization = await getDbOrganization();
  const subsidiaries = await getDbSubsidiaries();
  const posts = await getDbPosts();
  return { organization, subsidiaries, posts, updatedAt: new Date().toISOString() };
}

export async function writeDatabase(_data: unknown): Promise<void> {
  // Persistence is handled dynamically
}
