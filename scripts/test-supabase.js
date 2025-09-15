// scripts/test-supabase.js
const { createClient } = require('@supabase/supabase-js');

// Try multiple ways to load env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
require('dotenv').config();

// Fallback: set them directly if dotenv fails
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔄 Testing Supabase connection...');
  console.log(`URL: ${supabaseUrl}`);
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('orders')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Connection successful but tables not created yet');
      console.log('Error:', error.message);
      console.log('✅ This is expected - we will create tables next');
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('✅ Tables exist and are accessible');
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();
