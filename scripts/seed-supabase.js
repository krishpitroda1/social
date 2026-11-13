const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      const val = vals.join('=').replace(/^["']|["']$/g, '');
      process.env[key.trim()] = val;
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function seed() {
  console.log('--- SEEDING SUPABASE FROM LOCAL DB.JSON ---');
  const dbFile = path.join(__dirname, '..', 'data', 'db.json');
  if (!fs.existsSync(dbFile)) {
    console.error('db.json not found!');
    return;
  }

  const local = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

  // 1. Organization
  console.log('1. Upserting Organization:', local.organization.name);
  const { error: orgErr } = await supabase.from('organizations').upsert({
    id: local.organization.id,
    name: local.organization.name,
    slug: local.organization.slug,
    plan: local.organization.plan || 'ENTERPRISE',
    replicateApiKey: local.organization.replicateApiKey ?? null,
    openaiApiKey: local.organization.openaiApiKey ?? null,
    ayrshareApiKey: local.organization.ayrshareApiKey ?? null,
    bufferToken: local.organization.bufferToken ?? null,
    updatedAt: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (orgErr) console.error('  ❌ Org error:', orgErr.message);
  else console.log('  ✅ Organization synced!');

  // 2. Subsidiaries
  console.log(`2. Upserting ${local.subsidiaries.length} Subsidiaries...`);
  for (const sub of local.subsidiaries) {
    const { error: subErr } = await supabase.from('subsidiaries').upsert({
      id: sub.id,
      organizationId: local.organization.id,
      name: sub.name,
      slug: sub.slug,
      tagline: sub.tagline ?? null,
      brandTone: sub.brandTone,
      toneKeywords: sub.toneKeywords || [],
      primaryColor: sub.primaryColor,
      secondaryColor: sub.secondaryColor,
      accentColor: sub.accentColor ?? null,
      logoUrl: sub.logoUrl ?? '',
      websiteUrl: sub.websiteUrl ?? null,
      targetAudience: sub.targetAudience ?? null,
      updatedAt: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (subErr) console.error(`  ❌ Subsidiary [${sub.name}] error:`, subErr.message);
    else console.log(`  ✅ Subsidiary [${sub.name}] synced!`);
  }

  // 3. Social Accounts
  console.log(`3. Upserting ${local.socialAccounts.length} Social Accounts...`);
  for (const acc of local.socialAccounts) {
    const { error: accErr } = await supabase.from('social_accounts').upsert({
      id: acc.id,
      subsidiaryId: acc.subsidiaryId,
      platform: acc.platform,
      accountHandle: acc.accountHandle,
      accountName: acc.accountName,
      avatarUrl: acc.avatarUrl ?? null,
      followersCount: acc.followersCount || 0,
      connectionStatus: acc.connectionStatus || 'CONNECTED',
      lastSyncedAt: acc.lastSyncedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (accErr) console.error(`  ❌ Account error:`, accErr.message);
  }
  console.log('  ✅ Social accounts synced!');

  // 4. Scheduled Posts (if any)
  if (local.posts && local.posts.length > 0) {
    console.log(`4. Upserting ${local.posts.length} Posts...`);
    for (const p of local.posts) {
      const toDbAspectRatio = (ar) => {
        const m = { '1:1': 'SQUARE_1_1', '4:5': 'PORTRAIT_4_5', '9:16': 'STORY_9_16', '16:9': 'LANDSCAPE_16_9' };
        return m[ar] || 'SQUARE_1_1';
      };
      const { error: postErr } = await supabase.from('scheduled_posts').upsert({
        id: p.id,
        subsidiaryId: p.subsidiaryId,
        socialAccountId: p.socialAccountId ?? null,
        platform: p.platform,
        prompt: p.prompt,
        enhancedPrompt: p.enhancedPrompt ?? null,
        imageUrl: p.imageUrl,
        aspectRatio: toDbAspectRatio(p.aspectRatio),
        caption: p.caption,
        hashtags: p.hashtags || [],
        status: p.status || 'DRAFT',
        modelName: p.modelName || 'Flux.1-Pro',
        scheduledTime: p.scheduledTime ?? null,
        publishedTime: p.publishedTime ?? null,
        rejectionFeedback: p.rejectionFeedback ?? null,
        metricsLikes: p.metricsLikes || 0,
        metricsComments: p.metricsComments || 0,
        metricsShares: p.metricsShares || 0,
        metricsImpressions: p.metricsImpressions || 0,
        updatedAt: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (postErr) console.error('  ❌ Post error:', postErr.message);
    }
    console.log('  ✅ Posts synced!');
  }

  console.log('\n🌟 SUPABASE SEED COMPLETE! Verifying row counts:');
  const { count: orgCount } = await supabase.from('organizations').select('*', { count: 'exact', head: true });
  const { count: subCount } = await supabase.from('subsidiaries').select('*', { count: 'exact', head: true });
  const { count: accCount } = await supabase.from('social_accounts').select('*', { count: 'exact', head: true });
  const { count: postCount } = await supabase.from('scheduled_posts').select('*', { count: 'exact', head: true });
  console.log(`- Organizations: ${orgCount}`);
  console.log(`- Subsidiaries: ${subCount}`);
  console.log(`- Social Accounts: ${accCount}`);
  console.log(`- Scheduled Posts: ${postCount}`);
}

seed().catch(console.error);
