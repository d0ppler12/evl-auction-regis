import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// Public API for dashboard matches
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .select('*, team_a:team_a_id(id, name, logo_url), team_b:team_b_id(id, name, logo_url)')
      .order('match_date', { ascending: true })

    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
