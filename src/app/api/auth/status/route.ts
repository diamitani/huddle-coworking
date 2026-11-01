import { NextResponse } from "next/server"

export async function GET() {
  const configured = Boolean(
    process.env.COGNITO_CLIENT_ID && process.env.COGNITO_USER_POOL_ID
  )
  return NextResponse.json({ configured })
}
