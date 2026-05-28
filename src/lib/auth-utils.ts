import crypto from 'crypto'

const AUTH_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-fallback-secret-key'

export function signToken(payload: object): string {
  const data = JSON.stringify(payload)
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('hex')
  return `${Buffer.from(data).toString('base64')}.${signature}`
}

export function verifyToken(token: string): any {
  try {
    const [base64Payload, signature] = token.split('.')
    if (!base64Payload || !signature) return null
    const data = Buffer.from(base64Payload, 'base64').toString('utf8')
    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('hex')
    if (signature === expectedSignature) {
      return JSON.parse(data)
    }
  } catch (e) {
    return null
  }
  return null
}
