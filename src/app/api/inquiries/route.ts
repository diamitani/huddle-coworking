import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Contact form not available. Set up Supabase to enable." },
      { status: 503 }
    )
  }

  const { createServerClient } = await import("@supabase/ssr")
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {},
    },
  })

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
