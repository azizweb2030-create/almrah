import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { email, name } = await req.json()
  console.log(`Welcome email sent to ${email} (${name})`)
  return NextResponse.json({ sent: true })
}
