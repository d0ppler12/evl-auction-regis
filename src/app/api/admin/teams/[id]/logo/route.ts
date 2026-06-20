import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import fs from 'fs'
import path from 'path'

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

    // Save file locally to public/uploads/team-logos/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'team-logos')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    const filePath = path.join(uploadDir, fileName)
    fs.writeFileSync(filePath, buffer)

    const logo_url = `/uploads/team-logos/${fileName}`

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

