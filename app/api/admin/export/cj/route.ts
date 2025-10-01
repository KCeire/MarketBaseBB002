// app/api/admin/export/cj/route.ts - FINAL FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { supabaseAdmin } from '@/lib/supabase/client';
import { decryptOrderForAdmin, convertOrdersToCJFormat, validateOrdersForExport, DecryptedOrder } from '@/lib/admin/utils';

// Admin wallet addresses from environment variables
const ADMIN_ADDRESSES = process.env.ADMIN_WALLET_ADDRESSES?.split(',').map(addr => addr.trim()) || [];

if (!ADMIN_ADDRESSES.length) {
  throw new Error('Admin wallet addresses not configured');
}

// Validate address format
const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;
ADMIN_ADDRESSES.forEach(addr => {
  if (!WALLET_REGEX.test(addr)) {
    throw new Error(`Invalid admin wallet format: ${addr}`);
  }
});


interface CJExportRequest {
  adminWallet: string;
  orderIds: string[];
  markAsProcessing?: boolean;
}

interface CJExportResponse {
  success: boolean;
  fileName?: string;
  validOrders?: number;
  invalidOrders?: number;
  errors?: string[];
  message?: string;
  error?: string;
}

function validateAdminAccess(walletAddress: string): boolean {
  return ADMIN_ADDRESSES.some(
    adminAddr => adminAddr.toLowerCase() === walletAddress.toLowerCase()
  );
}

export async function POST(request: NextRequest): Promise<NextResponse<CJExportResponse>> {
  try {
    const body: CJExportRequest = await request.json();
    const { adminWallet, orderIds, markAsProcessing = false } = body;

    // Validate admin access
    if (!adminWallet || !validateAdminAccess(adminWallet)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Validate request
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No order IDs provided for export' },
        { status: 400 }
      );
    }

    console.log('CJ Export request:', {
      adminWallet: `${adminWallet.slice(0, 6)}...${adminWallet.slice(-4)}`,
      orderCount: orderIds.length,
      markAsProcessing
    });

    // Fetch selected orders from database
    const { data: encryptedOrders, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .in('id', orderIds);

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    if (!encryptedOrders || encryptedOrders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No orders found with provided IDs' },
        { status: 404 }
      );
    }

    // Decrypt orders
    const decryptedOrders: DecryptedOrder[] = [];
    const decryptionErrors: string[] = [];

    for (const encryptedOrder of encryptedOrders) {
      try {
        const decryptedOrder = decryptOrderForAdmin(encryptedOrder);
        decryptedOrders.push(decryptedOrder);
      } catch (error) {
        console.error(`Failed to decrypt order ${encryptedOrder.order_reference}:`, error);
        decryptionErrors.push(encryptedOrder.order_reference);
      }
    }

    if (decryptionErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to decrypt orders: ${decryptionErrors.join(', ')}` 
        },
        { status: 500 }
      );
    }

    // Validate orders for export
    const { valid, invalid, errors } = validateOrdersForExport(decryptedOrders);

    if (valid.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No valid orders for export',
          errors,
          invalidOrders: invalid.length
        },
        { status: 400 }
      );
    }

    // Convert to CJ format
    const cjData = convertOrdersToCJFormat(valid);

    // Create Excel workbook using ExcelJS (secure alternative to xlsx)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('CJ Orders');

    // Define headers matching CJ format with Farcaster data
    const headers = [
      'Order Number',
      'SKU',
      'Quantity',
      'Product Title',
      'Customer Name',
      'Address1',
      'Address2',
      'City',
      'Province',
      'ZIP',
      'Country',
      'Email',
      'Shipping Phone Number',
      'Customer Wallet',
      'Farcaster FID',
      'Farcaster Username',
      'Payment Hash',
      'Order Status'
    ];

    // Add headers to worksheet
    worksheet.addRow(headers);

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows - Updated with Farcaster data
    cjData.forEach((row: {
      'Order Number': string;
      'SKU': string;
      'Quantity': number;
      'Product Title': string;
      'Customer Name': string;
      'Address1': string;
      'Address2': string;
      'City': string;
      'Province': string;
      'ZIP': string;
      'Country': string;
      'Email': string;
      'Shipping Phone Number': string;
      'Customer Wallet': string;
      'Farcaster FID': string;
      'Farcaster Username': string;
      'Payment Hash': string;
      'Order Status': string;
    }) => {
      worksheet.addRow([
        row['Order Number'],
        row['SKU'],
        row['Quantity'],
        row['Product Title'],
        row['Customer Name'],
        row['Address1'],
        row['Address2'],
        row['City'],
        row['Province'],
        row['ZIP'],
        row['Country'],
        row['Email'],
        row['Shipping Phone Number'],
        row['Customer Wallet'],
        row['Farcaster FID'],
        row['Farcaster Username'],
        row['Payment Hash'],
        row['Order Status']
      ]);
    });

    // Set column widths for better readability
    worksheet.columns = [
      { width: 15 }, // Order Number
      { width: 15 }, // SKU
      { width: 8 },  // Quantity
      { width: 30 }, // Product Title
      { width: 20 }, // Customer Name
      { width: 25 }, // Address1
      { width: 15 }, // Address2
      { width: 15 }, // City
      { width: 10 }, // Province
      { width: 10 }, // ZIP
      { width: 10 }, // Country
      { width: 25 }, // Email
      { width: 15 }, // Shipping Phone Number
      { width: 20 }, // Customer Wallet
      { width: 12 }, // Farcaster FID
      { width: 18 }, // Farcaster Username
      { width: 20 }, // Payment Hash
      { width: 12 }  // Order Status
    ];

    // Generate Excel buffer - FIXED: Use Buffer.from() instead of .length
    const excelBuffer = await workbook.xlsx.writeBuffer();
    const bufferArray = Buffer.from(excelBuffer);

    // Update order status if requested
    if (markAsProcessing) {
      const validOrderIds = valid.map((order: DecryptedOrder) => order.id);
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ 
          order_status: 'processing',
          updated_at: new Date().toISOString()
        })
        .in('id', validOrderIds);

      if (updateError) {
        console.error('Failed to update order status:', updateError);
        // Don't fail the export, just log the error
      } else {
        console.log(`Updated ${validOrderIds.length} orders to processing status`);
      }
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `BaseShop_CJ_Export_${timestamp}.xlsx`;

    // Log successful export
    console.log('CJ export completed:', {
      validOrders: valid.length,
      invalidOrders: invalid.length,
      totalItems: cjData.length,
      fileName
    });

    // Return Excel file
    return new NextResponse(bufferArray, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': bufferArray.length.toString(),
      }
    });

  } catch (error) {
    console.error('CJ export API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for export validation (check which orders are valid before export)
export async function GET(request: NextRequest): Promise<NextResponse<{
  success: boolean;
  validOrders?: string[];
  invalidOrders?: string[];
  errors?: string[];
  error?: string;
}>> {
  try {
    const { searchParams } = new URL(request.url);
    const adminWallet = searchParams.get('adminWallet');
    const orderIdsParam = searchParams.get('orderIds');

    if (!adminWallet || !validateAdminAccess(adminWallet)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    if (!orderIdsParam) {
      return NextResponse.json(
        { success: false, error: 'Missing orderIds parameter' },
        { status: 400 }
      );
    }

    const orderIds = orderIdsParam.split(',');

    // Fetch and validate orders
    const { data: encryptedOrders, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .in('id', orderIds);

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    if (!encryptedOrders) {
      return NextResponse.json({
        success: true,
        validOrders: [],
        invalidOrders: [],
        errors: []
      });
    }

    // Decrypt and validate orders
    const decryptedOrders: DecryptedOrder[] = [];
    for (const encryptedOrder of encryptedOrders) {
      try {
        const decryptedOrder = decryptOrderForAdmin(encryptedOrder);
        decryptedOrders.push(decryptedOrder);
      } catch {
        // Skip orders that can't be decrypted
        console.error(`Failed to decrypt order ${encryptedOrder.order_reference}`);
      }
    }

    const { valid, invalid, errors } = validateOrdersForExport(decryptedOrders);

    return NextResponse.json({
      success: true,
      validOrders: valid.map((order: DecryptedOrder) => order.id),
      invalidOrders: invalid.map((order: DecryptedOrder) => order.id),
      errors
    });

  } catch (exportError) {
      console.error('CJ export validation error:', exportError);
      
      return NextResponse.json(
        { 
          success: false, 
          error: exportError instanceof Error ? exportError.message : 'Internal server error' 
        },
        { status: 500 }
      );
    }
}
