import { NextResponse } from 'next/server'
import { craaft } from '@/utils/client' 

export async function GET(req) {
  try {
    
      const subdomain = req.nextUrl.searchParams.get('id')

    // Fetch store data based on subdomain
    const { data: storeData, error: storeError } = await craaft
      .from('credentials')
      .select('store_sanitized')
      .eq('store_url', subdomain)

    if (storeError || !storeData.length) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const storeSanitized = storeData[0]?.store_sanitized

    // Fetch products from the partitioned table
    const { data: productData, error: productError } = await craaft
      .from(`${storeSanitized}_product_partition`)
      .select()

    if (productError) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Fetch categories from the credentials table
    const { data: credentialsData, error: credentialsError } = await craaft
      .from('credentials')
      .select('categories')
      .eq('store_sanitized', storeSanitized)

    if (credentialsError) {
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    const categories = ['All Collections', ...(credentialsData[0]?.categories || [])]

    // Combine products and categories and return them
    return NextResponse.json({
      products: productData,
      categories: categories,
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { status: 500 }
    )
  }
}
