/**
 * server-db.ts — Prisma-backed database layer (Neon Postgres / any PostgreSQL)
 *
 * All data is stored in a real external database, so changes persist across
 * devices, deployments, and serverless cold-starts.
 *
 * Required env variable:
 *   DATABASE_URL = postgresql://user:pass@host/db?sslmode=require
 *
 * Quick start (Neon free tier):
 *   1. https://neon.tech → create project → copy connection string
 *   2. Paste into .env.local as DATABASE_URL
 *   3. npx prisma db push          (creates tables)
 *   4. npx prisma db seed          (seeds mock data)
 *   5. Add DATABASE_URL to Vercel environment variables → redeploy
 */

import { prisma } from '@/lib/prisma';
import { Organization, Subsidiary, SocialAccount, ScheduledPost } from '@/types';
import {
  mockOrganization,
  mockSubsidiaries,
  mockSocialAccounts,
  mockPosts,
} from '@/lib/mock-data';

// ----------------------------------------------------------------
// Helpers — convert Prisma rows → app types
// ----------------------------------------------------------------

type PrismaAspectRatio = 'SQUARE_1_1' | 'PORTRAIT_4_5' | 'STORY_9_16' | 'LANDSCAPE_16_9';

function toDbAspectRatio(ar: string): PrismaAspectRatio {
  const map: Record<string, PrismaAspectRatio> = {
    '1:1': 'SQUARE_1_1',
    '4:5': 'PORTRAIT_4_5',
    '9:16': 'STORY_9_16',
    '16:9': 'LANDSCAPE_16_9',
    // also handle if already in DB format
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
    // passthrough if already in app format
    '1:1': '1:1',
    '4:5': '4:5',
    '9:16': '9:16',
    '16:9': '16:9',
  };
  return map[ar] ?? '1:1';
}

function mapOrg(row: {
  id: string;
  name: string;
  slug: string;
  plan: string;
  replicateApiKey: string | null;
  openaiApiKey: string | null;
  ayrshareApiKey: string | null;
  bufferToken: string | null;
}): Organization {
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

function mapSub(row: {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  tagline: string | null;
  brandTone: string;
  toneKeywords: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string | null;
  logoUrl: string;
  websiteUrl: string | null;
  targetAudience: string | null;
  _count?: { socialAccounts: number };
}): Subsidiary {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline ?? '',
    brandTone: row.brandTone,
    toneKeywords: row.toneKeywords,
    primaryColor: row.primaryColor,
    secondaryColor: row.secondaryColor,
    accentColor: row.accentColor ?? '',
    logoUrl: row.logoUrl,
    websiteUrl: row.websiteUrl ?? '',
    targetAudience: row.targetAudience ?? '',
    activeAccountsCount: row._count?.socialAccounts ?? 0,
  };
}

function mapAccount(row: {
  id: string;
  subsidiaryId: string;
  platform: string;
  accountHandle: string;
  accountName: string;
  avatarUrl: string | null;
  followersCount: number;
  connectionStatus: string;
  lastSyncedAt: Date;
}): SocialAccount {
  return {
    id: row.id,
    subsidiaryId: row.subsidiaryId,
    platform: row.platform as SocialAccount['platform'],
    accountHandle: row.accountHandle,
    accountName: row.accountName,
    avatarUrl: row.avatarUrl ?? '',
    followersCount: row.followersCount,
    connectionStatus: row.connectionStatus as SocialAccount['connectionStatus'],
    lastSyncedAt: row.lastSyncedAt.toISOString(),
  };
}

function mapPost(row: {
  id: string;
  subsidiaryId: string;
  socialAccountId: string | null;
  platform: string;
  prompt: string;
  enhancedPrompt: string | null;
  imageUrl: string;
  aspectRatio: string;
  caption: string;
  hashtags: string[];
  status: string;
  modelName: string;
  scheduledTime: Date | null;
  publishedTime: Date | null;
  rejectionFeedback: string | null;
  metricsLikes: number;
  metricsComments: number;
  metricsShares: number;
  metricsImpressions: number;
  createdAt: Date;
  updatedAt?: Date;
}): ScheduledPost {
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
    hashtags: row.hashtags,
    status: row.status as ScheduledPost['status'],
    modelName: row.modelName as ScheduledPost['modelName'],
    scheduledTime: row.scheduledTime?.toISOString(),
    publishedTime: row.publishedTime?.toISOString(),
    rejectionFeedback: row.rejectionFeedback ?? undefined,
    metricsLikes: row.metricsLikes,
    metricsComments: row.metricsComments,
    metricsShares: row.metricsShares,
    metricsImpressions: row.metricsImpressions,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? row.createdAt.toISOString(),
  };
}

// ----------------------------------------------------------------
// DB health check — ensure at least one org exists (auto-seed if empty)
// ----------------------------------------------------------------
async function ensureSeeded() {
  const count = await prisma.organization.count();
  if (count === 0) {
    await seedDatabase();
  }
}

// ----------------------------------------------------------------
// Organization Operations
// ----------------------------------------------------------------
export async function getDbOrganization(): Promise<Organization> {
  await ensureSeeded();
  const row = await prisma.organization.findFirst();
  if (!row) throw new Error('No organization found');
  return mapOrg(row);
}

export async function updateDbOrganization(updates: Partial<Organization>): Promise<Organization> {
  await ensureSeeded();
  const existing = await prisma.organization.findFirst();
  if (!existing) throw new Error('No organization found');

  const updated = await prisma.organization.update({
    where: { id: existing.id },
    data: {
      name: updates.name ?? existing.name,
      slug: updates.slug ?? existing.slug,
      plan: (updates.plan ?? existing.plan) as 'STARTER' | 'PRO' | 'ENTERPRISE',
      replicateApiKey: updates.replicateApiKey ?? existing.replicateApiKey,
      openaiApiKey: updates.openaiApiKey ?? existing.openaiApiKey,
      ayrshareApiKey: updates.ayrshareApiKey ?? existing.ayrshareApiKey,
      bufferToken: updates.bufferToken ?? existing.bufferToken,
    },
  });
  return mapOrg(updated);
}

// ----------------------------------------------------------------
// Subsidiary Operations
// ----------------------------------------------------------------
export async function getDbSubsidiaries(): Promise<Subsidiary[]> {
  await ensureSeeded();
  const rows = await prisma.subsidiary.findMany({
    include: { _count: { select: { socialAccounts: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map(mapSub);
}

export async function updateDbSubsidiary(updated: Subsidiary): Promise<Subsidiary> {
  const existing = await prisma.subsidiary.findUnique({ where: { id: updated.id } });

  if (!existing) {
    return addDbSubsidiary(updated);
  }

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
}

export async function addDbSubsidiary(newSub: Subsidiary): Promise<Subsidiary> {
  // Ensure the parent org exists
  await ensureSeeded();
  const org = await prisma.organization.findFirst();
  if (!org) throw new Error('No organization found');

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
      logoUrl: newSub.logoUrl,
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

export async function deleteDbSubsidiary(id: string): Promise<boolean> {
  try {
    await prisma.subsidiary.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------
// Social Account Operations
// ----------------------------------------------------------------
export async function updateDbSocialAccount(account: SocialAccount): Promise<SocialAccount> {
  const row = await prisma.socialAccount.upsert({
    where: {
      subsidiaryId_platform: {
        subsidiaryId: account.subsidiaryId,
        platform: account.platform as 'INSTAGRAM' | 'LINKEDIN' | 'TWITTER_X' | 'FACEBOOK' | 'PINTEREST',
      },
    },
    create: {
      id: account.id,
      subsidiaryId: account.subsidiaryId,
      platform: account.platform as 'INSTAGRAM' | 'LINKEDIN' | 'TWITTER_X' | 'FACEBOOK' | 'PINTEREST',
      accountHandle: account.accountHandle,
      accountName: account.accountName,
      avatarUrl: account.avatarUrl ?? null,
      followersCount: account.followersCount,
      connectionStatus: account.connectionStatus as 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED',
      lastSyncedAt: account.lastSyncedAt ? new Date(account.lastSyncedAt) : new Date(),
    },
    update: {
      accountHandle: account.accountHandle,
      accountName: account.accountName,
      avatarUrl: account.avatarUrl ?? null,
      followersCount: account.followersCount,
      connectionStatus: account.connectionStatus as 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED',
      lastSyncedAt: account.lastSyncedAt ? new Date(account.lastSyncedAt) : new Date(),
    },
  });
  return mapAccount(row);
}

// ----------------------------------------------------------------
// Scheduled Post Operations
// ----------------------------------------------------------------
export async function getDbPosts(): Promise<ScheduledPost[]> {
  const rows = await prisma.scheduledPost.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapPost);
}

export async function addDbPost(newPost: ScheduledPost): Promise<ScheduledPost> {
  const row = await prisma.scheduledPost.create({
    data: {
      id: newPost.id,
      subsidiaryId: newPost.subsidiaryId,
      socialAccountId: newPost.socialAccountId ?? null,
      platform: newPost.platform as 'INSTAGRAM' | 'LINKEDIN' | 'TWITTER_X' | 'FACEBOOK' | 'PINTEREST',
      prompt: newPost.prompt,
      enhancedPrompt: newPost.enhancedPrompt ?? null,
      imageUrl: newPost.imageUrl,
      aspectRatio: toDbAspectRatio(newPost.aspectRatio ?? '1:1'),
      caption: newPost.caption,
      hashtags: newPost.hashtags,
      status: (newPost.status ?? 'DRAFT') as 'DRAFT' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED',
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
}

export async function deleteDbPost(id: string): Promise<boolean> {
  try {
    await prisma.scheduledPost.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------
// Reset to Defaults (Factory Reset)
// ----------------------------------------------------------------
export async function resetDbToDefaults(): Promise<void> {
  // Clear all data
  await prisma.scheduledPost.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.subsidiary.deleteMany();
  await prisma.organization.deleteMany();
  // Re-seed
  await seedDatabase();
}

// ----------------------------------------------------------------
// Seed database with mock data
// ----------------------------------------------------------------
export async function seedDatabase(): Promise<void> {
  // Create organization
  const org = await prisma.organization.upsert({
    where: { id: mockOrganization.id },
    create: {
      id: mockOrganization.id,
      name: mockOrganization.name,
      slug: mockOrganization.slug,
      plan: mockOrganization.plan as 'STARTER' | 'PRO' | 'ENTERPRISE',
      replicateApiKey: mockOrganization.replicateApiKey ?? null,
      openaiApiKey: mockOrganization.openaiApiKey ?? null,
      ayrshareApiKey: mockOrganization.ayrshareApiKey ?? null,
      bufferToken: mockOrganization.bufferToken ?? null,
    },
    update: {},
  });

  // Create subsidiaries
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

  // Create social accounts
  for (const account of mockSocialAccounts) {
    await prisma.socialAccount.upsert({
      where: { id: account.id },
      create: {
        id: account.id,
        subsidiaryId: account.subsidiaryId,
        platform: account.platform as 'INSTAGRAM' | 'LINKEDIN' | 'TWITTER_X' | 'FACEBOOK' | 'PINTEREST',
        accountHandle: account.accountHandle,
        accountName: account.accountName,
        avatarUrl: account.avatarUrl ?? null,
        followersCount: account.followersCount,
        connectionStatus: account.connectionStatus as 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED',
        lastSyncedAt: account.lastSyncedAt ? new Date(account.lastSyncedAt) : new Date(),
      },
      update: {},
    });
  }

  // Create posts (skip if they have invalid subsidiaryIds)
  for (const post of mockPosts) {
    const subExists = await prisma.subsidiary.findUnique({ where: { id: post.subsidiaryId } });
    if (!subExists) continue;

    await prisma.scheduledPost.upsert({
      where: { id: post.id },
      create: {
        id: post.id,
        subsidiaryId: post.subsidiaryId,
        socialAccountId: post.socialAccountId ?? null,
        platform: post.platform as 'INSTAGRAM' | 'LINKEDIN' | 'TWITTER_X' | 'FACEBOOK' | 'PINTEREST',
        prompt: post.prompt,
        enhancedPrompt: post.enhancedPrompt ?? null,
        imageUrl: post.imageUrl,
        aspectRatio: toDbAspectRatio(post.aspectRatio ?? '1:1'),
        caption: post.caption,
        hashtags: post.hashtags,
        status: (post.status ?? 'DRAFT') as 'DRAFT' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED',
        modelName: post.modelName ?? 'Flux.1-Pro',
        scheduledTime: post.scheduledTime ? new Date(post.scheduledTime) : null,
        publishedTime: post.publishedTime ? new Date(post.publishedTime) : null,
        rejectionFeedback: post.rejectionFeedback ?? null,
        metricsLikes: post.metricsLikes ?? 0,
        metricsComments: post.metricsComments ?? 0,
        metricsShares: post.metricsShares ?? 0,
        metricsImpressions: post.metricsImpressions ?? 0,
      },
      update: {},
    });
  }
}

// Legacy compatibility: keep readDatabase / writeDatabase for any routes that call them directly
export async function readDatabase() {
  const organization = await getDbOrganization();
  const subsidiaries = await getDbSubsidiaries();
  const posts = await getDbPosts();
  return { organization, subsidiaries, posts, updatedAt: new Date().toISOString() };
}

// writeDatabase is now a no-op — all mutations go through individual functions above
export async function writeDatabase(_data: unknown): Promise<void> {
  // no-op: Prisma handles persistence
}
