// lib/affiliate-link-utils.ts - Shared affiliate linking utilities
import { supabaseAdmin } from '@/lib/supabase/client';

interface LinkFidResponse {
  success: boolean;
  linkedClicks?: number;
  message?: string;
  error?: string;
}

// Shared function to link anonymous clicks to a FID (can be called from multiple APIs)
export async function linkAnonymousClicksToFid(visitorFid: string): Promise<LinkFidResponse> {
  try {
    console.log('🔗 AFFILIATE LINK-FID: Starting link process for FID:', visitorFid);

    if (!visitorFid) {
      console.error('❌ AFFILIATE LINK-FID: Missing visitorFid');
      return {
        success: false,
        error: 'Missing visitorFid'
      };
    }

    // Find anonymous clicks that could be linked to this FID
    console.log('🔍 AFFILIATE LINK-FID: Searching for anonymous clicks to link...');
    const { data: anonymousClicks, error: fetchError } = await supabaseAdmin
      .from('affiliate_clicks')
      .select('click_id, referrer_fid, product_id, clicked_at')
      .is('visitor_fid', null)
      .gte('expires_at', new Date().toISOString())
      .eq('converted', false)
      .order('clicked_at', { ascending: false });

    if (fetchError) {
      console.error('❌ AFFILIATE LINK-FID: Database error:', fetchError);
      return {
        success: false,
        error: 'Database error while fetching anonymous clicks'
      };
    }

    console.log(`📋 AFFILIATE LINK-FID: Found ${anonymousClicks?.length || 0} anonymous clicks to potentially link`);

    if (!anonymousClicks || anonymousClicks.length === 0) {
      console.log('ℹ️ AFFILIATE LINK-FID: No anonymous clicks found to link');
      return {
        success: true,
        linkedClicks: 0,
        message: 'No anonymous clicks found to link'
      };
    }

    // Filter out self-referrals
    console.log('🔍 AFFILIATE LINK-FID: Filtering out self-referrals...');
    const clicksToUpdate = anonymousClicks.filter(click => click.referrer_fid !== visitorFid);

    console.log(`📋 AFFILIATE LINK-FID: Self-referral filtering results:`, {
      totalFound: anonymousClicks.length,
      afterFiltering: clicksToUpdate.length,
      selfReferralsExcluded: anonymousClicks.length - clicksToUpdate.length,
      visitorFid
    });

    if (clicksToUpdate.length === 0) {
      console.log('ℹ️ AFFILIATE LINK-FID: No valid clicks found to link (self-referrals excluded)');
      return {
        success: true,
        linkedClicks: 0,
        message: 'No valid clicks found to link (self-referrals excluded)'
      };
    }

    const clickIds = clicksToUpdate.map(click => click.click_id);
    console.log('💾 AFFILIATE LINK-FID: Updating clicks with visitor FID:', {
      clickIds,
      visitorFid,
      updateCount: clickIds.length
    });

    const { error: updateError } = await supabaseAdmin
      .from('affiliate_clicks')
      .update({
        visitor_fid: visitorFid,
        updated_at: new Date().toISOString()
      })
      .in('click_id', clickIds);

    if (updateError) {
      console.error('❌ AFFILIATE LINK-FID: Failed to update clicks:', updateError);
      return {
        success: false,
        error: 'Failed to link clicks to FID'
      };
    }

    console.log(`✅ AFFILIATE LINK-FID: Successfully linked ${clickIds.length} anonymous clicks to FID ${visitorFid}:`, {
      linkedClicks: clickIds.length,
      clickIds,
      visitorFid
    });

    return {
      success: true,
      linkedClicks: clickIds.length,
      message: `Successfully linked ${clickIds.length} clicks to FID ${visitorFid}`
    };

  } catch (error) {
    console.error('❌ AFFILIATE LINK-FID: Unexpected error:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}