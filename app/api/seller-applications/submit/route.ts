// app/api/seller-applications/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Application received - logging removed for production performance

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

    // Application submitted successfully - logging removed for production performance

    // Send email notification to admin team
    try {
      await resend.emails.send({
        from: 'Base Shop <noreply@your-domain.com>', // Replace with your verified domain
        to: ['lk@lkforge.xyz'], // Replace with your admin email
        subject: `New Seller Application: ${application.business_name}`,
        html: `
          <h2>New Seller Application Submitted!</h2>

          <h3>Business Information</h3>
          <p><strong>Business Name:</strong> ${application.business_name}</p>
          <p><strong>Contact Name:</strong> ${application.contact_name}</p>
          <p><strong>Email:</strong> ${application.email}</p>
          <p><strong>Phone:</strong> ${application.phone}</p>
          <p><strong>Business Type:</strong> ${application.business_type}</p>
          <p><strong>Website:</strong> ${application.website || 'Not provided'}</p>
          <p><strong>Address:</strong> ${application.business_address}</p>

          <h3>Business Details</h3>
          <p><strong>Description:</strong> ${application.business_description}</p>
          <p><strong>Product Categories:</strong> ${application.product_categories.join(', ')}</p>
          <p><strong>Average Order Value:</strong> ${application.average_order_value}</p>
          <p><strong>Monthly Volume:</strong> ${application.monthly_volume}</p>
          <p><strong>Selling Experience:</strong> ${application.selling_experience}</p>

          <h3>Technical Readiness</h3>
          <p><strong>Crypto Experience:</strong> ${application.crypto_experience}</p>
          <p><strong>Has Wallet:</strong> ${application.has_wallet ? 'Yes' : 'No'}</p>
          <p><strong>Understands Base/USDC:</strong> ${application.understands_basepay ? 'Yes' : 'No'}</p>

          <h3>Compliance</h3>
          <p><strong>Agrees to Terms:</strong> ${application.agree_to_terms ? 'Yes' : 'No'}</p>
          <p><strong>Willing to Comply:</strong> ${application.willing_to_comply ? 'Yes' : 'No'}</p>

          ${application.additional_info ? `<h3>Additional Information</h3><p>${application.additional_info}</p>` : ''}

          <hr>
          <p><strong>Application ID:</strong> ${application.id}</p>
          <p><strong>Submitted:</strong> ${new Date(application.created_at).toLocaleString()}</p>

          <p>Review this application in your <a href="https://supabase.com">Supabase dashboard</a>.</p>
        `
      });

      // Admin notification email sent successfully
    } catch (emailError) {
      console.error('❌ Failed to send admin notification email:', emailError);
      // Don't fail the entire request if email fails
    }

    // Send confirmation email to applicant
    try {
      await resend.emails.send({
        from: 'Base Shop <noreply@your-domain.com>', // Replace with your verified domain
        to: [application.email],
        subject: 'Application Received - Base Shop',
        html: `
          <h2>Thank you for your seller application!</h2>

          <p>Dear ${application.contact_name},</p>

          <p>We've received your application to become a seller on Base Shop. Here are the details we have on file:</p>

          <ul>
            <li><strong>Business Name:</strong> ${application.business_name}</li>
            <li><strong>Application ID:</strong> ${application.id}</li>
            <li><strong>Submitted:</strong> ${new Date(application.created_at).toLocaleString()}</li>
          </ul>

          <h3>What's Next?</h3>
          <ul>
            <li>We'll review your application within 2-3 business days</li>
            <li>You'll receive an email with our decision</li>
            <li>If approved, we'll guide you through store setup</li>
            <li>We may request additional information if needed</li>
          </ul>

          <p>If you have any questions, please contact us at <a href="mailto:lk@lkforge.xyz">lk@lkforge.xyz</a>.</p>

          <p>Best regards,<br>The Base Shop Team</p>
        `
      });

      // Confirmation email sent to applicant successfully
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email to applicant:', emailError);
      // Don't fail the entire request if email fails
    }

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