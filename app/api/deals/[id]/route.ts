import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateDealSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  source: z.string().optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  originalPrice: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  status: z.enum(['OPEN', 'CLOSED', 'PENDING']).optional(),
  category: z.string().optional()
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsedData = updateDealSchema.safeParse(body)

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parsedData.error.format() },
        { status: 400 }
      )
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: parsedData.data
    })

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Error updating deal:', error)
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.deal.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting deal:', error)
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })
  }
}
