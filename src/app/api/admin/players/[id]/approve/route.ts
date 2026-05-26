import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { updatePlayerById } from '@/lib/player-db'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin()
    const data = await updatePlayerById(params.id, { status: 'approved' })
    return NextResponse.json(data)
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
