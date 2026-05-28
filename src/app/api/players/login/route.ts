import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { signToken } from '@/lib/auth-utils'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email/Phone and password are required' }, { status: 400 })
    }

    const loginInput = email.trim()

    // Query either email OR phone_number columns using Supabase OR filter
    const { data: player, error } = await supabaseAdmin
      .from('players')
      .select('*')
      .or(`email.eq."${loginInput}",phone_number.eq."${loginInput}"`)
      .limit(1)
      .maybeSingle()

    if (error || !player) {
      return NextResponse.json({ error: 'Invalid email/phone or password' }, { status: 401 })
    }

    // Verify plaintext password as requested by the user
    if (player.password !== password) {
      return NextResponse.json({ error: 'Invalid email/phone or password' }, { status: 401 })
    }

    // Check if account is approved
    if (player.status !== 'approved') {
      return NextResponse.json({ error: 'account not approved yet' }, { status: 403 })
    }

    // Generate signed session token
    const token = signToken({
      id: player.id,
      email: player.email,
      name: player.full_name
    })

    // Set secure HTTP-only cookie
    cookies().set('player_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    })

    return NextResponse.json({ success: true, player: { id: player.id, name: player.full_name, email: player.email } })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
