// app/api/products/categorize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { categorizeProductByKeywords, getStoreInfo, initializeStorePatterns } from '@/lib/store-assignment';

interface CategorizeRequest {
  products: {
    id?: number | string;
    title: string;
    description: string;
    productType: string;
    tags: string[];
  }[];
}

interface CategorizeResponse {
  success: boolean;
  results: {
    product: {
      id?: number | string;
      title: string;
    };
    storeId: string | null;
    storeInfo: {
      name: string;
      category: string;
    } | null;
    confidence: 'high' | 'medium' | 'low' | 'none';
  }[];
  summary: {
    categorized: number;
    unassigned: number;
    byStore: Record<string, number>;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<CategorizeResponse>> {
  try {
    const body: CategorizeRequest = await request.json();

    if (!body.products || !Array.isArray(body.products)) {
      return NextResponse.json({
        success: false,
        results: [],
        summary: { categorized: 0, unassigned: 0, byStore: {} },
        error: 'Invalid request: products array required'
      }, { status: 400 });
    }

    console.log(`Categorizing ${body.products.length} products...`);

    // Initialize store patterns if not already done
    await initializeStorePatterns();

    const results = body.products.map(product => {
      const storeId = categorizeProductByKeywords(
        product.title,
        product.description,
        product.productType,
        product.tags
      );

      const storeInfo = getStoreInfo(storeId);

      // Determine confidence based on assignment
      let confidence: 'high' | 'medium' | 'low' | 'none' = 'none';
      if (storeId) {
        // This is a simple confidence measure - you could make it more sophisticated
        const hasKeywords = product.title.toLowerCase().includes(storeInfo?.category.toLowerCase() || '');
        const hasRelevantType = product.productType.length > 0;

        if (hasKeywords && hasRelevantType) confidence = 'high';
        else if (hasKeywords || hasRelevantType) confidence = 'medium';
        else confidence = 'low';
      }

      return {
        product: {
          id: product.id,
          title: product.title
        },
        storeId,
        storeInfo,
        confidence
      };
    });

    // Generate summary
    const categorized = results.filter(r => r.storeId).length;
    const unassigned = results.length - categorized;

    const byStore: Record<string, number> = {};
    results.forEach(result => {
      if (result.storeId) {
        byStore[result.storeId] = (byStore[result.storeId] || 0) + 1;
      }
    });

    console.log(`Categorization complete: ${categorized} assigned, ${unassigned} unassigned`);

    return NextResponse.json({
      success: true,
      results,
      summary: {
        categorized,
        unassigned,
        byStore
      }
    });

  } catch (error) {
    console.error('Product categorization error:', error);

    return NextResponse.json({
      success: false,
      results: [],
      summary: { categorized: 0, unassigned: 0, byStore: {} },
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// GET endpoint to analyze current products and show patterns
export async function GET(): Promise<NextResponse> {
  try {
    await initializeStorePatterns();

    const { getStorePatterns } = await import('@/lib/store-assignment');
    const patterns = await getStorePatterns();

    const summary = patterns.map(pattern => ({
      storeId: pattern.storeId,
      storeName: pattern.storeName,
      category: pattern.category,
      keywordCount: pattern.pattern.keywords.length,
      productTypes: pattern.pattern.productTypes,
      vendors: pattern.pattern.vendors,
      topKeywords: pattern.pattern.keywords.slice(0, 10),
      sampleTitles: pattern.pattern.sampleTitles
    }));

    return NextResponse.json({
      success: true,
      storePatterns: summary,
      message: 'Store patterns loaded successfully'
    });

  } catch (error) {
    console.error('Failed to get store patterns:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}