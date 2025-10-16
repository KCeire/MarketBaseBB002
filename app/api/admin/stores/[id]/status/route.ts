// app/api/admin/stores/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

interface StatusUpdateRequest {
  isActive: boolean;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isActive }: StatusUpdateRequest = await request.json();
    const resolvedParams = await params;
    const storeId = resolvedParams.id;

    // Validate store ID
    if (!storeId) {
      return NextResponse.json({
        success: false,
        error: 'Store ID is required'
      }, { status: 400 });
    }

    // Validate isActive parameter
    if (typeof isActive !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'isActive must be a boolean value'
      }, { status: 400 });
    }

    // Check if store exists
    const { data: existingStore, error: checkError } = await supabaseAdmin
      .from('stores')
      .select('id, name, is_active')
      .eq('id', storeId)
      .single();

    if (checkError || !existingStore) {
      return NextResponse.json({
        success: false,
        error: 'Store not found'
      }, { status: 404 });
    }

    // Update store status
    const { data: updatedStore, error: updateError } = await supabaseAdmin
      .from('stores')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating store status:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update store status'
      }, { status: 500 });
    }

    // Log the status change for auditing
    console.log(`Store ${storeId} (${existingStore.name}) status changed: ${existingStore.is_active} → ${isActive}`);

    return NextResponse.json({
      success: true,
      store: {
        id: updatedStore.id,
        name: updatedStore.name,
        isActive: updatedStore.is_active,
        updatedAt: updatedStore.updated_at
      },
      message: `Store ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Store status update error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}