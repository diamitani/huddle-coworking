import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-cognito"
import { query } from "@/lib/db"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await req.json()
  const { space_name, space_city, space_state, space_website, inquiry_type, message } = body

  if (!space_name) {
    return NextResponse.json({ error: "Space name is required" }, { status: 400 })
  }

  try {
    const result = await query(
      `INSERT INTO inquiries (user_sub, user_email, space_name, space_city, space_state, space_website, inquiry_type, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user.sub, user.email, space_name, space_city || "", space_state || "", space_website || "", inquiry_type || "membership", message || ""]
    )
    return NextResponse.json({ inquiry: result.rows[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const result = await query(
      `SELECT * FROM inquiries WHERE user_sub = $1 ORDER BY created_at DESC`,
      [user.sub]
    )
    return NextResponse.json({ inquiries: result.rows })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
