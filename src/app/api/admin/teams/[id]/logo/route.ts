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
    const fileName = `${params.id}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Supabase Storage (bucket: team-logos, must be public)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('team-logos')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/png',
        upsert: true,
      })

    if (uploadError) throw uploadError

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('team-logos')
      .getPublicUrl(fileName)

    const logo_url = urlData.publicUrl

    // Update the team record with the new public URL
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
