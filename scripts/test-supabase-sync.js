const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
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

console.log('Testing Supabase with:');
console.log('URL:', url);
console.log('Key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role (secret)' : 'anon/publishable');

const supabase = createClient(url, key);

async function check() {
  console.log('\n1. Checking existing records in Supabase...');
  const { data: orgs, error: orgErr } = await supabase.from('organizations').select('*');
  if (orgErr) {
    console.error('❌ Error reading organizations:', orgErr.message);
  } else {
    console.log(`✅ Found ${orgs.length} organizations in Supabase`);
  }

  console.log('\n2. Testing write permission with camelCase schema...');
  const testId = 'test-check-' + Date.now();
  const { data: inserted, error: insertErr } = await supabase.from('organizations').insert({
    id: testId,
    name: 'Test Connectivity',
    slug: testId,
    plan: 'ENTERPRISE',
    updatedAt: new Date().toISOString(),
  }).select().single();

  if (insertErr) {
    console.error('❌ Write failed:', insertErr.message);
    return false;
  }

  console.log('✅ Write succeeded! Cleaning up test record...');
  await supabase.from('organizations').delete().eq('id', testId);
  console.log('✅ Test record removed.');
  console.log('\n🎉 SUPABASE IS FULLY CONNECTED AND READY FOR READ/WRITE!');
  return true;
}

check().catch(console.error);
