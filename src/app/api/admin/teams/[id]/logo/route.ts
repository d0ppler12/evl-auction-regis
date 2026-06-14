import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin()
    const formData = await request.formData()
    const file = formData.get('logo') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'png'
    const path = `${params.id}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    try {
      await supabaseAdmin.storage.createBucket('team-logos', { public: true })
    } catch (bucketErr) {
      // ignore bucket creation error
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from('team-logos')
      .upload(path, buffer, { upsert: true, contentType: file.type })

    if (uploadError) throw uploadError

    const { data: urlData } = supabaseAdmin.storage.from('team-logos').getPublicUrl(path)
    const logo_url = urlData.publicUrl

    const { data, error } = await supabaseAdmin
      .from('teams')
      .update({ logo_url })
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error

    return NextResponse.json(data)
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
