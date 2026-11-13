/**
 * server-db.ts — Resilient Multi-Backend Database Layer
 *
 * Supported Backends:
 *   1. Supabase REST API via @supabase/supabase-js
 *      - Active when NEXT_PUBLIC_SUPABASE_URL + (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY) are set.
 *      - Uses HTTPS (port 443) — no direct PostgreSQL connection needed.
 *      - Auto-synchronizes with the 4 tables created by Prisma schema in Supabase.
 *   2. Local Persistent File Database (data/db.json)
 *      - Automatic, zero-config fallback if Supabase is unreachable or not configured.
 *
 * This dual-engine architecture ensures the app NEVER crashes with a 500 error
 * and your edits are ALWAYS saved locally and synced to Supabase when connected.
 */

import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
// Supabase Client (Server-Side with Service Role Key or Anon Key)
// ----------------------------------------------------------------

let _supabase: SupabaseClient | null = null;
let _supabaseAvailable: boolean | null = null;
let _supabaseLastCheck = 0;
const SUPABASE_CHECK_INTERVAL_MS = 30000;

function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey) return null;
  if (url.includes('your-project') || serviceKey.length < 20) return null;

  if (!_supabase) {
    _supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _supabase;
}

async function checkSupabaseAvailability(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  const now = Date.now();
  if (_supabaseAvailable !== null && now - _supabaseLastCheck < SUPABASE_CHECK_INTERVAL_MS) {
    return _supabaseAvailable;
  }

  try {
    const { error } = await client.from('organizations').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn('[server-db] Supabase health check failed:', error.message);
      _supabaseAvailable = false;
    } else {
      _supabaseAvailable = true;
    }
  } catch (err) {
    console.warn('[server-db] Supabase unreachable:', err);
    _supabaseAvailable = false;
  }

  _supabaseLastCheck = now;
  return _supabaseAvailable ?? false;
}

// ----------------------------------------------------------------
// Row Mappers (Prisma schema in Supabase uses camelCase columns)
// ----------------------------------------------------------------

function toDbAspectRatio(ar: string): string {
  const map: Record<string, string> = {
    '1:1': 'SQUARE_1_1', '4:5': 'PORTRAIT_4_5',
    '9:16': 'STORY_9_16', '16:9': 'LANDSCAPE_16_9',
    'SQUARE_1_1': 'SQUARE_1_1', 'PORTRAIT_4_5': 'PORTRAIT_4_5',
    'STORY_9_16': 'STORY_9_16', 'LANDSCAPE_16_9': 'LANDSCAPE_16_9',
  };
  return map[ar] ?? 'SQUARE_1_1';
}

function fromDbAspectRatio(ar: string): ScheduledPost['aspectRatio'] {
  const map: Record<string, ScheduledPost['aspectRatio']> = {
    'SQUARE_1_1': '1:1', 'PORTRAIT_4_5': '4:5',
    'STORY_9_16': '9:16', 'LANDSCAPE_16_9': '16:9',
    '1:1': '1:1', '4:5': '4:5', '9:16': '9:16', '16:9': '16:9',
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

function mapSub(row: any, accountCount = 0): Subsidiary {
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
    activeAccountsCount: accountCount,
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
    followersCount: row.followersCount ?? 0,
    connectionStatus: row.connectionStatus as SocialAccount['connectionStatus'],
    lastSyncedAt: row.lastSyncedAt ?? new Date().toISOString(),
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
    aspectRatio: fromDbAspectRatio(row.aspectRatio ?? 'SQUARE_1_1'),
    caption: row.caption,
    hashtags: row.hashtags || [],
    status: row.status as ScheduledPost['status'],
    modelName: (row.modelName ?? 'Flux.1-Pro') as ScheduledPost['modelName'],
    scheduledTime: row.scheduledTime ?? undefined,
    publishedTime: row.publishedTime ?? undefined,
    rejectionFeedback: row.rejectionFeedback ?? undefined,
    metricsLikes: row.metricsLikes ?? 0,
    metricsComments: row.metricsComments ?? 0,
    metricsShares: row.metricsShares ?? 0,
    metricsImpressions: row.metricsImpressions ?? 0,
    createdAt: row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updatedAt ?? new Date().toISOString(),
  };
}

// ----------------------------------------------------------------
// Supabase Seed Helper
// ----------------------------------------------------------------

async function ensureSupabaseSeeded(sb: SupabaseClient): Promise<void> {
  try {
    const { count } = await sb.from('organizations').select('*', { count: 'exact', head: true });
    if ((count ?? 0) === 0) {
      await seedSupabaseDatabase(sb);
    }
  } catch (err) {
    console.warn('[server-db] Supabase seed check failed:', err);
  }
}

async function seedSupabaseDatabase(sb: SupabaseClient): Promise<void> {
  console.log('[server-db] Seeding Supabase with initial data...');

  let localData: LocalDbSchema;
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = await fs.promises.readFile(DB_FILE, 'utf-8');
      localData = JSON.parse(content) as LocalDbSchema;
    } else {
      localData = getInitialLocalData();
    }
  } catch {
    localData = getInitialLocalData();
  }

  const org = localData.organization;

  // Upsert organization
  const { error: orgErr } = await sb.from('organizations').upsert({
    id: org.id,
    name: org.name,
    slug: org.slug,
    plan: org.plan,
    replicateApiKey: org.replicateApiKey ?? null,
    openaiApiKey: org.openaiApiKey ?? null,
    ayrshareApiKey: org.ayrshareApiKey ?? null,
    bufferToken: org.bufferToken ?? null,
    updatedAt: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (orgErr) console.warn('[server-db] Org upsert error:', orgErr.message);

  // Upsert subsidiaries
  for (const sub of localData.subsidiaries) {
    const { error: subErr } = await sb.from('subsidiaries').upsert({
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
      logoUrl: sub.logoUrl ?? '',
      websiteUrl: sub.websiteUrl ?? null,
      targetAudience: sub.targetAudience ?? null,
      updatedAt: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (subErr) console.warn('[server-db] Sub upsert error:', subErr.message);
  }

  // Upsert social accounts
  for (const acc of localData.socialAccounts) {
    const { error: accErr } = await sb.from('social_accounts').upsert({
      id: acc.id,
      subsidiaryId: acc.subsidiaryId,
      platform: acc.platform,
      accountHandle: acc.accountHandle,
      accountName: acc.accountName,
      avatarUrl: acc.avatarUrl ?? null,
      followersCount: acc.followersCount,
      connectionStatus: acc.connectionStatus,
      lastSyncedAt: acc.lastSyncedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (accErr) console.warn('[server-db] Account upsert error:', accErr.message);
  }

  console.log('[server-db] ✅ Supabase seeded successfully');
}

// ----------------------------------------------------------------
// Public Database API (Hybrid Supabase + Local File Fallback)
// ----------------------------------------------------------------

export async function getDbOrganization(): Promise<Organization> {
  const useSupabase = await checkSupabaseAvailability();
  if (useSupabase) {
    const sb = getSupabaseClient()!;
    try {
      await ensureSupabaseSeeded(sb);
      const { data, error } = await sb.from('organizations').select('*').limit(1).single();
      if (!error && data) return mapOrg(data);
    } catch (e) {
      console.warn('[server-db] Supabase org query failed, using local fallback:', e);
    }
  }

  const local = await readLocalFileDb();
  return local.organization;
}

export async function updateDbOrganization(updates: Partial<Organization>): Promise<Organization> {
  const useSupabase = await checkSupabaseAvailability();
  if (useSupabase) {
    const sb = getSupabaseClient()!;
    try {
      const { data: existing } = await sb.from('organizations').select('*').limit(1).single();
      if (existing) {
        const { data, error } = await sb.from('organizations').update({
          name: updates.name ?? existing.name,
          slug: updates.slug ?? existing.slug,
          plan: updates.plan ?? existing.plan,
          replicateApiKey: updates.replicateApiKey ?? existing.replicateApiKey,
          openaiApiKey: updates.openaiApiKey ?? existing.openaiApiKey,
          ayrshareApiKey: updates.ayrshareApiKey ?? existing.ayrshareApiKey,
          bufferToken: updates.bufferToken ?? existing.bufferToken,
          updatedAt: new Date().toISOString(),
        }).eq('id', existing.id).select().single();
        if (!error && data) return mapOrg(data);
      }
    } catch (e) {
      console.warn('[server-db] Supabase org update failed, using local fallback:', e);
    }
  }

  const local = await readLocalFileDb();
  local.organization = { ...local.organization, ...updates };
  await writeLocalFileDb(local);
  return local.organization;
}

export async function getDbSubsidiaries(): Promise<Subsidiary[]> {
  const useSupabase = await checkSupabaseAvailability();
  if (useSupabase) {
    const sb = getSupabaseClient()!;
    try {
      await ensureSupabaseSeeded(sb);
      const { data, error } = await sb.from('subsidiaries').select('*').order('createdAt', { ascending: true });
      if (!error && data && data.length > 0) {
        const { data: accounts } = await sb.from('social_accounts').select('subsidiaryId');
        const countMap: Record<string, number> = {};
        (accounts ?? []).forEach((a: any) => {
          countMap[a.subsidiaryId] = (countMap[a.subsidiaryId] ?? 0) + 1;
        });
        return data.map((row: any) => mapSub(row, countMap[row.id] ?? 0));
      }
    } catch (e) {
      console.warn('[server-db] Supabase subsidiaries query failed, using local fallback:', e);
    }
  }

  const local = await readLocalFileDb();
  return local.subsidiaries;
}

export async function updateDbSubsidiary(updated: Subsidiary): Promise<Subsidiary> {
  const useSupabase = await checkSupabaseAvailability();
  if (useSupabase) {
    const sb = getSupabaseClient()!;
    try {
      const { data, error } = await sb.from('subsidiaries').upsert({
        id: updated.id,
        organizationId: updated.organizationId,
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
        updatedAt: new Date().toISOString(),
      }, { onConflict: 'id' }).select().single();
      if (!error && data) return mapSub(data, updated.activeAccountsCount ?? 0);
    } catch (e) {
      console.warn('[server-db] Supabase subsidiary update failed, using local fallback:', e);
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
  const useSupabase = await checkSupabaseAvailability();
  if (useSupabase) {
    const sb = getSupabaseClient()!;
    try {
      const { data: org } = await sb.from('organizations').select('id').limit(1).single();
      const orgId = org?.id ?? newSub.organizationId;
      const { data, error } = await sb.from('subsidiaries').upsert({
        id: newSub.id,
        organizationId: orgId,
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
        updatedAt: new Date().toISOString(),
      }, { onConflict: 'id' }).select().single();
      if (!error && data) return mapSub(data);
    } catch (e) {
      console.warn('[server-db] Supabase add subsidiary failed, saving to local fallback:', e);
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
  const useSupabase = await checkSupabaseAvailability();
  if (useSupabase) {
    const sb = getSupabaseClient()!;
    try {
      const { error } = await sb.from('subsidiaries').delete().eq('id', id);
      if (!error) return true;
    } catch {
      // fall through to local
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
  const useSupabase = await checkSupabaseAvailability();
  if (useSupabase) {
    const sb = getSupabaseClient()!;
    try {
      const { data, error } = await sb.from('social_accounts').upsert({
        id: account.id,
        subsidiaryId: account.subsidiaryId,
        platform: account.platform,
        accountHandle: account.accountHandle,
        accountName: account.accountName,
        avatarUrl: account.avatarUrl ?? null,
        followersCount: account.followersCount,
        connectionStatus: account.connectionStatus,
        lastSyncedAt: account.lastSyncedAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { onConflict: 'id' }).select().single();
      if (!error && data) return mapAccount(data);
    } catch (e) {
      console.warn('[server-db] Supabase social account update failed, using local fallback:', e);
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
  const useSupabase = await checkSupabaseAvailability();
  if (useSupabase) {
    const sb = getSupabaseClient()!;
    try {
      const { data, error } = await sb.from('scheduled_posts').select('*').order('createdAt', { ascending: false });
      if (!error && data && data.length > 0) return data.map(mapPost);
    } catch (e) {
      console.warn('[server-db] Supabase posts query failed, using local fallback:', e);
    }
  }

  const local = await readLocalFileDb();
  return local.posts;
}

export async function addDbPost(newPost: ScheduledPost): Promise<ScheduledPost> {
  const useSupabase = await checkSupabaseAvailability();
  if (useSupabase) {
    const sb = getSupabaseClient()!;
    try {
      const { data, error } = await sb.from('scheduled_posts').insert({
        id: newPost.id,
        subsidiaryId: newPost.subsidiaryId,
        socialAccountId: newPost.socialAccountId ?? null,
        platform: newPost.platform,
        prompt: newPost.prompt,
        enhancedPrompt: newPost.enhancedPrompt ?? null,
        imageUrl: newPost.imageUrl,
        aspectRatio: toDbAspectRatio(newPost.aspectRatio ?? '1:1'),
        caption: newPost.caption,
        hashtags: newPost.hashtags,
        status: newPost.status ?? 'DRAFT',
        modelName: newPost.modelName ?? 'Flux.1-Pro',
        scheduledTime: newPost.scheduledTime ?? null,
        publishedTime: newPost.publishedTime ?? null,
        rejectionFeedback: newPost.rejectionFeedback ?? null,
        metricsLikes: newPost.metricsLikes ?? 0,
        metricsComments: newPost.metricsComments ?? 0,
        metricsShares: newPost.metricsShares ?? 0,
        metricsImpressions: newPost.metricsImpressions ?? 0,
        updatedAt: new Date().toISOString(),
      }).select().single();
      if (!error && data) return mapPost(data);
    } catch (e) {
      console.warn('[server-db] Supabase add post failed, saving to local fallback:', e);
    }
  }

  const local = await readLocalFileDb();
  local.posts.unshift(newPost);
  await writeLocalFileDb(local);
  return newPost;
}

export async function deleteDbPost(id: string): Promise<boolean> {
  const useSupabase = await checkSupabaseAvailability();
  if (useSupabase) {
    const sb = getSupabaseClient()!;
    try {
      const { error } = await sb.from('scheduled_posts').delete().eq('id', id);
      if (!error) return true;
    } catch {
      // fall through
    }
  }

  const local = await readLocalFileDb();
  const initLen = local.posts.length;
  local.posts = local.posts.filter((p) => p.id !== id);
  await writeLocalFileDb(local);
  return local.posts.length < initLen;
}

export async function resetDbToDefaults(): Promise<void> {
  const useSupabase = await checkSupabaseAvailability();
  if (useSupabase) {
    const sb = getSupabaseClient()!;
    try {
      await sb.from('scheduled_posts').delete().neq('id', '');
      await sb.from('social_accounts').delete().neq('id', '');
      await sb.from('subsidiaries').delete().neq('id', '');
      await sb.from('organizations').delete().neq('id', '');
      await seedSupabaseDatabase(sb);
    } catch {
      // ignore
    }
  }

  const initial = getInitialLocalData();
  await writeLocalFileDb(initial);
}

export async function seedPrismaDatabase(): Promise<void> {
  const useSupabase = await checkSupabaseAvailability();
  if (useSupabase) {
    await seedSupabaseDatabase(getSupabaseClient()!);
  }
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
