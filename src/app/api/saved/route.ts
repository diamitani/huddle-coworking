import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-cognito"
import { query } from "@/lib/db"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const result = await query(
    `SELECT * FROM saved_spaces WHERE user_sub = $1 ORDER BY created_at DESC`,
    [user.sub]
  )
  return NextResponse.json({ saved: result.rows })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { space_name, space_city, space_state, space_slug } = await req.json()
  if (!space_name) return NextResponse.json({ error: "space_name required" }, { status: 400 })

  try {
    const result = await query(
      `INSERT INTO saved_spaces (user_sub, user_email, space_name, space_city, space_state, space_slug)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_sub, space_slug) DO NOTHING
       RETURNING *`,
      [user.sub, user.email, space_name, space_city || "", space_state || "", space_slug || ""]
    )
    return NextResponse.json({ saved: result.rows[0] || null, already_saved: result.rows.length === 0 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { space_slug } = await req.json()
  await query(
    `DELETE FROM saved_spaces WHERE user_sub = $1 AND space_slug = $2`,
    [user.sub, space_slug]
  )
  return NextResponse.json({ success: true })
}
