import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const dealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  url: z.string().url().optional(),
  source: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  originalPrice: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  status: z.enum(['OPEN', 'CLOSED', 'PENDING']).default('OPEN'),
  category: z.string().optional()
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const deals = await prisma.deal.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
    
    const total = await prisma.deal.count()

    return NextResponse.json({
      data: deals,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsedData = dealSchema.safeParse(body)

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parsedData.error.format() },
        { status: 400 }
      )
    }

    const deal = await prisma.deal.create({
      data: parsedData.data
    })

    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    console.error('Error creating deal:', error)
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
  }
}
