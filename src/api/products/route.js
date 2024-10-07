import { NextResponse } from 'next/server';
import { craaft } from '../utils/client';

export async function GET(req) {
  try {
    // Fetch all store URLs from the credentials table
    const { data, error } = await craaft
      .from('credentials')
      .select('store_url');

    if (error) {
      throw new Error('Error fetching store URLs:', error);
    }

    // Prepend 'https://' to each store_url
    const allowedOrigins = data.map((item) => `https://${item.store_url}`);

    const origin = req.headers.get('origin');

    if (!allowedOrigins.includes(origin)) {
      // Return a CORS error for unauthorized origins
      return NextResponse.json(
        { error: 'CORS policy: Access denied' },
        { status: 403 }
      );
    }

    // Set CORS headers if origin is allowed
    const response = NextResponse.json({ message: '' });
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    // Get subdomain from the request query params
    const subdomain = req.nextUrl.searchParams.get('id');

    // Fetch store data based on subdomain
    const { data: storeData, error: storeError } = await craaft
      .from('credentials')
      .select('store_sanitized')
      .eq('store_url', subdomain);

    if (storeError || !storeData.length) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const storeSanitized = storeData[0]?.store_sanitized;

    // Fetch products from the partitioned table
    const { data: productData, error: productError } = await craaft
      .from(`${storeSanitized}_product_partition`)
      .select();

    if (productError) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Fetch categories from the credentials table
    const { data: credentialsData, error: credentialsError } = await craaft
      .from('credentials')
      .select('categories')
      .eq('store_sanitized', storeSanitized);

    if (credentialsError) {
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    const categories = ['All Collections', ...(credentialsData[0]?.categories || [])];

    // Combine products and categories and return them
    return NextResponse.json({
      products: productData,
      categories: categories,
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { status: 500 }
    );
  }
}
