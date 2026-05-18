import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await req.json()
  const { space_name, space_city, space_state, space_website, inquiry_type, message } = body

  if (!space_name) {
    return NextResponse.json({ error: "Space name is required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      user_id: user.id,
      space_name,
      space_city: space_city || "",
      space_state: space_state || "",
      space_website: space_website || "",
      inquiry_type: inquiry_type || "membership",
      message: message || "",
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ inquiry: data })
}
