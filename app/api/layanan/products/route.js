import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { atlantic, premku } from '@/lib/apis'

export async function GET(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'pulsa'
  const carrier = searchParams.get('carrier') || ''

  try {
    if (type === 'premium') {
      const apiRes = await premku.getProducts()
      return NextResponse.json({ success: true, products: apiRes?.data || apiRes?.products || [] })
    }

    const apiRes = await atlantic.getProducts(type)
    let products = apiRes?.data || apiRes?.pricelist || []

    if (carrier && products.length > 0) {
      products = products.filter(p => {
        const name = (p.name || p.product_name || '').toLowerCase()
        const code = (p.code || p.product_code || '').toLowerCase()
        return name.includes(carrier.toLowerCase()) || code.includes(carrier.toLowerCase().slice(0,4))
      })
    }

    return NextResponse.json({ success: true, products })
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message, products: [] }, { status: 500 })
  }
}
