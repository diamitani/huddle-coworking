import { NextResponse } from "next/server"
import { signUp } from "@/lib/auth-cognito"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
    }

    const result = await signUp(email, password, name || "")
    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error("[signup error]", err)
    const msg = (err as Error)?.message || "Signup failed"
    if (msg.includes("UsernameExistsException")) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 })
    }
    if (msg.includes("InvalidPasswordException")) {
      return NextResponse.json({ error: "Password must be 8+ characters with uppercase, number, and symbol." }, { status: 400 })
    }
    if (msg.includes("Missing Cognito env vars")) {
      return NextResponse.json({ error: "Server misconfigured: AWS Cognito not set up" }, { status: 500 })
    }
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
