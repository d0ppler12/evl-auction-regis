import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyToken } from '@/lib/auth-utils'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('player_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { data: player, error } = await supabaseAdmin
      .from('players')
      .select('*, teams(id, name, logo_url, owner_name)')
      .eq('id', decoded.id)
      .limit(1)
      .maybeSingle()

    if (error || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Exclude password from returned payload for security
    const { password, ...safePlayer } = player

    return NextResponse.json({ player: safePlayer })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
