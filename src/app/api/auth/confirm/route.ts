import { NextResponse } from "next/server"
import { confirmSignUp } from "@/lib/auth-cognito"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()
    if (!email || !code) {
      return NextResponse.json({ error: "Email and confirmation code required" }, { status: 400 })
    }
    await confirmSignUp(email, code)
    return NextResponse.json({ confirmed: true })
  } catch (err: unknown) {
    const msg = (err as Error)?.message || "Confirmation failed"
    if (msg.includes("CodeMismatchException")) {
      return NextResponse.json({ error: "Invalid confirmation code." }, { status: 400 })
    }
    if (msg.includes("ExpiredCodeException")) {
      return NextResponse.json({ error: "Code expired. Please sign up again." }, { status: 400 })
    }
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
