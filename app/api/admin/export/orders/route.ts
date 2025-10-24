// app/api/admin/export/orders/route.ts - Excel export for orders
import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { supabaseAdmin } from '@/lib/supabase/client';
import { decryptCustomerData } from '@/lib/encryption';
import {
  isSuperAdmin
} from '@/lib/admin/stores-config';
import {
  hasAnyAdminAccessWithDatabase,
  getUserStoresWithDatabase,
  isStoreAdminWithDatabase
} from '@/lib/admin/stores-server';

interface ExportRequest {
  adminWallet: string;
  orderIds: string[];
  storeId?: string;
  markAsProcessing?: boolean;
}

interface CustomerData {
  email: string;
  shippingAddress: {
    name: string;
    phone?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

interface ExportResponse {
  success: boolean;
  fileName?: string;
  validOrders?: number;
  invalidOrders?: number;
  errors?: string[];
  message?: string;
  error?: string;
}

async function validateAdminAccess(walletAddress: string, storeId?: string): Promise<boolean> {
  // Check if user has any admin access first
  if (!(await hasAnyAdminAccessWithDatabase(walletAddress))) {
    return false;
  }

  // If no specific store requested, any admin access is sufficient
  if (!storeId) {
    return true;
  }

  // For specific store access, check super admin or store admin permissions
  return isSuperAdmin(walletAddress) || (await isStoreAdminWithDatabase(walletAddress, storeId));
}

export async function POST(request: NextRequest): Promise<NextResponse<ExportResponse>> {
  try {
    const body: ExportRequest = await request.json();
    const { adminWallet, orderIds, storeId, markAsProcessing = false } = body;

    // Validate admin access
    if (!adminWallet || !(await validateAdminAccess(adminWallet, storeId))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    if (!orderIds || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No order IDs provided for export' },
        { status: 400 }
      );
    }

    console.log('Order export request:', {
      adminWallet: `${adminWallet.slice(0, 6)}...${adminWallet.slice(-4)}`,
      orderCount: orderIds.length,
      storeId: storeId || 'all',
      markAsProcessing
    });

    // Build query with store filtering
    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .in('id', orderIds);

    // Apply store filtering for security
    if (storeId && storeId !== 'unassigned') {
      query = query.eq('store_id', storeId);
    } else if (storeId === 'unassigned') {
      query = query.is('store_id', null);
    } else if (!isSuperAdmin(adminWallet)) {
      // If not super admin, only allow orders from their accessible stores
      const userStores = await getUserStoresWithDatabase(adminWallet);
      const storeIds = userStores.map(store => store.id);
      if (storeIds.length > 0) {
        query = query.in('store_id', storeIds);
      } else {
        return NextResponse.json(
          { success: false, error: 'No accessible stores found' },
          { status: 403 }
        );
      }
    }

    const { data: encryptedOrders, error: fetchError } = await query;

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    if (!encryptedOrders || encryptedOrders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No orders found for export' },
        { status: 404 }
      );
    }

    // Decrypt orders
    const decryptedOrders: Array<Record<string, unknown>> = [];
    const decryptionErrors: string[] = [];

    for (const encryptedOrder of encryptedOrders) {
      try {
        const customerData = decryptCustomerData(encryptedOrder.encrypted_customer_data);
        decryptedOrders.push({
          ...encryptedOrder,
          customerData
        });
      } catch (error) {
        console.error(`Failed to decrypt order ${encryptedOrder.order_reference}:`, error);
        decryptionErrors.push(encryptedOrder.order_reference);
      }
    }

    if (decryptedOrders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid orders for export',
          invalidOrders: decryptionErrors.length,
          errors: decryptionErrors
        },
        { status: 400 }
      );
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders Export');

    // Define headers
    const headers = [
      'Order Reference',
      'Order Date',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Shipping Address',
      'City',
      'State',
      'Country',
      'Zip Code',
      'Customer Wallet',
      'Total Amount',
      'Currency',
      'Payment Status',
      'Order Status',
      'Store ID',
      'Store Assignment',
      'Product Title',
      'Product SKU',
      'Quantity',
      'Unit Price',
      'Line Total',
      'Tracking Number',
      'Notes'
    ];

    // Add headers
    worksheet.addRow(headers);

    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows
    decryptedOrders.forEach((order) => {
      (order.order_items as Array<Record<string, unknown>>).forEach((item: Record<string, unknown>) => {
        const customerData = order.customerData as CustomerData;
        const row = [
          order.order_reference,
          new Date(order.created_at as string).toLocaleDateString(),
          customerData.shippingAddress.name,
          customerData.email,
          customerData.shippingAddress.phone || '',
          `${customerData.shippingAddress.address1} ${customerData.shippingAddress.address2 || ''}`.trim(),
          customerData.shippingAddress.city,
          customerData.shippingAddress.state,
          customerData.shippingAddress.country,
          customerData.shippingAddress.zipCode,
          order.customer_wallet,
          order.total_amount,
          order.currency,
          order.payment_status,
          order.order_status || 'confirmed',
          order.store_id || 'unassigned',
          order.store_id ? 'assigned' : 'UNASSIGNED',
          item.title,
          item.sku,
          item.quantity,
          item.price,
          (parseFloat(item.price as string) * (item.quantity as number)).toFixed(2),
          order.tracking_number || '',
          order.notes || ''
        ];

        const excelRow = worksheet.addRow(row);

        // Highlight unassigned orders
        if (!order.store_id) {
          excelRow.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFEAA7' } // Light orange for unassigned
            };
          });
        }

        // Add borders
        excelRow.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // Mark orders as processing if requested
    if (markAsProcessing) {
      try {
        await supabaseAdmin
          .from('orders')
          .update({ order_status: 'processing' })
          .in('id', orderIds)
          .eq('payment_status', 'confirmed');
      } catch (updateError) {
        console.warn('Failed to update order status:', updateError);
        // Don't fail the export, just log the error
      }
    }

    // Generate Excel buffer
    const excelBuffer = await workbook.xlsx.writeBuffer();
    const bufferArray = Buffer.from(excelBuffer);

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const storePrefix = storeId === 'unassigned' ? 'Unassigned' :
                      storeId ? storeId.replace(/-/g, '_') : 'AllStores';
    const fileName = `MarketBase_Orders_${storePrefix}_${timestamp}.xlsx`;

    // Log successful export
    console.log('Order export completed:', {
      fileName,
      validOrders: decryptedOrders.length,
      invalidOrders: decryptionErrors.length,
      totalItems: decryptedOrders.reduce((sum, order) => sum + (order.order_items as Array<unknown>).length, 0)
    });

    // Return Excel file
    return new NextResponse(bufferArray, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': bufferArray.length.toString(),
      },
    });

  } catch (error) {
    console.error('Order export API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}