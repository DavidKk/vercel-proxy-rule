'use server'

import { searchBundleId } from '@/services/iosbundleidfinder'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return Response.json({ results: [] }, { status: 200 })
  }

  try {
    const results = await searchBundleId(query)
    return Response.json({ results }, { status: 200 })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in iosbundleidfinder API:', error)
    return Response.json({ error: 'Failed to search bundle ID' }, { status: 500 })
  }
}
