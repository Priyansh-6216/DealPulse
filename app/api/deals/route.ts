import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(deals)
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, price, category, status } = body

    if (!title || price === undefined) {
      return NextResponse.json({ error: 'Title and price are required' }, { status: 400 })
    }

    const deal = await prisma.deal.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        status: status || 'open'
      }
    })

    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    console.error('Error creating deal:', error)
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
  }
}
