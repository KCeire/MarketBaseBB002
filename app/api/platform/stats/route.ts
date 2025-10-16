import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin;

    // Get active stores count
    const { count: activeStoresCount, error: storesError } = await supabase
      .from('stores')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (storesError) {
      console.error('Error fetching stores count:', storesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch stores count' },
        { status: 500 }
      );
    }

    // Get total orders count
    const { count: ordersCount, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (ordersError) {
      console.error('Error fetching orders count:', ordersError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders count' },
        { status: 500 }
      );
    }

    // Include environment-based static stores (6 stores from stores-config.ts)
    const totalActiveStores = (activeStoresCount || 0) + 6;

    return NextResponse.json({
      success: true,
      stats: {
        activeStores: totalActiveStores,
        ordersProcessed: ordersCount || 0,
      }
    });

  } catch (error) {
    console.error('Error in platform stats API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}