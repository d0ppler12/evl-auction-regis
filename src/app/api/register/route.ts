import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.full_name || !body.phone_number) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('players')
      .insert({
        full_name: body.full_name,
        age: parseInt(body.age) || 0,
        phone_number: body.phone_number,
        wing_building: body.wing_building,
        jersey_name: body.jersey_name,
        jersey_size: body.jersey_size,
        jersey_number: body.jersey_number ? parseInt(body.jersey_number) : null,
        utr_number: body.utr_number,
        volleyball_experience: body.volleyball_experience || '',
        photo_url: 'placeholder',
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
