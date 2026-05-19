import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export function isAdminAuthenticated(): boolean {
  const token = cookies().get('admin_token')
  return token?.value === 'authenticated'
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function requireAdmin() {
  if (!isAdminAuthenticated()) {
    throw new Error('UNAUTHORIZED')
  }
}
