import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.full_name || !body.phone_number) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    let photoUrl = 'placeholder'
    if (body.photo) {
      try {
        const fileData = body.photo.split(';base64,')
        if (fileData.length === 2) {
          const mimeType = fileData[0].split(':')[1]
          const extension = mimeType.split('/')[1] || 'png'
          const base64Data = fileData[1]
          const buffer = Buffer.from(base64Data, 'base64')
          const fileName = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`

          // try creating bucket if not exists
          try {
            await supabaseAdmin.storage.createBucket('player-photos', { public: true })
          } catch (bucketErr) {
            // ignore bucket creation error
          }

          const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('player-photos')
            .upload(fileName, buffer, {
              contentType: mimeType,
              upsert: true
            })

          if (uploadError) {
            console.error("Storage upload error, using base64 fallback:", uploadError)
            photoUrl = body.photo
          } else {
            const { data: publicUrlData } = supabaseAdmin.storage
              .from('player-photos')
              .getPublicUrl(fileName)
            photoUrl = publicUrlData.publicUrl
          }
        } else {
          photoUrl = body.photo
        }
      } catch (err) {
        console.error("Photo processing exception, using base64 fallback:", err)
        photoUrl = body.photo
      }
    }

    if (body.email) {
      const { data: existingPlayer } = await supabaseAdmin
        .from('players')
        .select('id')
        .eq('email', body.email)
        .limit(1)

      if (existingPlayer && existingPlayer.length > 0) {
        return NextResponse.json({ error: 'Email is already registered' }, { status: 400 })
      }
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
        photo_url: photoUrl,
        status: 'pending',
        email: body.email || null,
        password: body.password || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
