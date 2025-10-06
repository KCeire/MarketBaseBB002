// scripts/test-affiliate-earnings.js
// Test script to debug affiliate earnings calculation

const { createClient } = require('@supabase/supabase-js');

// Use environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAffiliateEarnings(referrerFid) {
  console.log(`\n🔍 Testing affiliate earnings for FID: ${referrerFid}`);
  console.log('=' .repeat(60));

  try {
    // 1. Get raw affiliate_clicks data
    console.log('\n1️⃣ Fetching raw affiliate clicks...');
    const { data: clicks, error: clicksError } = await supabase
      .from('affiliate_clicks')
      .select('*')
      .eq('referrer_fid', referrerFid);

    if (clicksError) {
      console.error('❌ Error fetching clicks:', clicksError);
      return;
    }

    console.log(`📊 Found ${clicks?.length || 0} clicks for FID ${referrerFid}`);

    if (clicks && clicks.length > 0) {
      const convertedClicks = clicks.filter(click => click.converted);
      const totalCommission = clicks.reduce((sum, click) => {
        const amount = parseFloat(click.commission_amount || 0);
        return sum + amount;
      }, 0);

      console.log(`   📈 Converted clicks: ${convertedClicks.length}`);
      console.log(`   💰 Manual commission sum: $${totalCommission.toFixed(2)}`);

      console.log('\n   📋 Click details:');
      clicks.forEach((click, index) => {
        console.log(`   ${index + 1}. Click ${click.click_id.substring(0, 8)}...`);
        console.log(`      Converted: ${click.converted ? '✅' : '❌'}`);
        console.log(`      Commission: $${click.commission_amount || 0}`);
        console.log(`      Earned at: ${click.commission_earned_at || 'N/A'}`);
      });
    }

    // 2. Get affiliate_earnings view data
    console.log('\n2️⃣ Fetching affiliate earnings view...');
    const { data: earnings, error: earningsError } = await supabase
      .from('affiliate_earnings')
      .select('*')
      .eq('referrer_fid', referrerFid)
      .single();

    if (earningsError && earningsError.code !== 'PGRST116') {
      console.error('❌ Error fetching earnings view:', earningsError);
      return;
    }

    if (earnings) {
      console.log(`📊 Earnings view data:`, {
        total_clicks: earnings.total_clicks,
        conversions: earnings.conversions,
        total_earned: earnings.total_earned,
        avg_commission: earnings.avg_commission,
        last_earning_date: earnings.last_earning_date
      });
    } else {
      console.log('❌ No earnings data found in view');
    }

    // 3. Compare manual calculation vs view
    if (clicks && earnings) {
      const manualTotal = clicks.reduce((sum, click) => sum + parseFloat(click.commission_amount || 0), 0);
      const viewTotal = parseFloat(earnings.total_earned || 0);

      console.log('\n3️⃣ Comparison:');
      console.log(`   Manual calculation: $${manualTotal.toFixed(2)}`);
      console.log(`   View calculation:   $${viewTotal.toFixed(2)}`);
      console.log(`   Match: ${Math.abs(manualTotal - viewTotal) < 0.01 ? '✅' : '❌'}`);

      if (Math.abs(manualTotal - viewTotal) >= 0.01) {
        console.log('   ⚠️  DISCREPANCY DETECTED!');
        console.log(`   Difference: $${Math.abs(manualTotal - viewTotal).toFixed(2)}`);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Test with the FID provided as command line argument
const testFid = process.argv[2];

if (!testFid) {
  console.log('Usage: node test-affiliate-earnings.js <referrer_fid>');
  console.log('Example: node test-affiliate-earnings.js "12345"');
  process.exit(1);
}

testAffiliateEarnings(testFid);