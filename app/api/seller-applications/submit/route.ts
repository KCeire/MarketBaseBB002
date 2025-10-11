// app/api/seller-applications/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

interface SellerApplicationRequest {
  // Basic Information
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;

  // Business Details
  businessType: string;
  businessDescription: string;
  registrationNumber?: string;
  taxId?: string;
  businessAddress: string;

  // Products & Experience
  productCategories: string[];
  averageOrderValue: string;
  monthlyVolume: string;
  hasOnlineStore: boolean;
  onlineStoreUrl?: string;
  sellingExperience: string;

  // Technical Readiness
  cryptoExperience: string;
  hasWallet: boolean;
  walletAddress?: string;
  understands_basepay: boolean;

  // Terms & Compliance
  agreeToTerms: boolean;
  willingToComply: boolean;
  additionalInfo?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SellerApplicationRequest = await request.json();

    console.log('🚀 New seller application received:', {
      businessName: body.businessName,
      email: body.email,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    const requiredFields: (keyof SellerApplicationRequest)[] = [
      'businessName', 'contactName', 'email', 'phone',
      'businessType', 'businessDescription', 'businessAddress',
      'productCategories', 'averageOrderValue', 'monthlyVolume',
      'sellingExperience', 'cryptoExperience', 'agreeToTerms', 'willingToComply'
    ];

    for (const field of requiredFields) {
      const value = body[field];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Validate terms agreement
    if (!body.agreeToTerms || !body.willingToComply) {
      return NextResponse.json({
        success: false,
        error: 'You must agree to the terms and conditions'
      }, { status: 400 });
    }

    // Check for existing application with same email
    const { data: existingApplication, error: checkError } = await supabaseAdmin
      .from('seller_applications')
      .select('id, status')
      .eq('email', body.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking for existing application:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check existing applications'
      }, { status: 500 });
    }

    if (existingApplication) {
      return NextResponse.json({
        success: false,
        error: `An application already exists for this email address (Status: ${existingApplication.status})`
      }, { status: 409 });
    }

    // Insert the new application
    const { data: application, error: insertError } = await supabaseAdmin
      .from('seller_applications')
      .insert({
        business_name: body.businessName,
        contact_name: body.contactName,
        email: body.email,
        phone: body.phone,
        website: body.website || null,
        business_type: body.businessType,
        business_description: body.businessDescription,
        registration_number: body.registrationNumber || null,
        tax_id: body.taxId || null,
        business_address: body.businessAddress,
        product_categories: body.productCategories,
        average_order_value: body.averageOrderValue,
        monthly_volume: body.monthlyVolume,
        has_online_store: body.hasOnlineStore,
        online_store_url: body.onlineStoreUrl || null,
        selling_experience: body.sellingExperience,
        crypto_experience: body.cryptoExperience,
        has_wallet: body.hasWallet,
        wallet_address: body.walletAddress || null,
        understands_basepay: body.understands_basepay,
        agree_to_terms: body.agreeToTerms,
        willing_to_comply: body.willingToComply,
        additional_info: body.additionalInfo || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting seller application:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to submit application'
      }, { status: 500 });
    }

    console.log('✅ Seller application submitted successfully:', {
      applicationId: application.id,
      businessName: application.business_name,
      email: application.email
    });

    // TODO: Send email notification to admin team
    // TODO: Send confirmation email to applicant

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Seller application submission error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}