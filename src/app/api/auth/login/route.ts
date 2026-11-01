import { NextResponse } from "next/server"
import { signIn } from "@/lib/auth-cognito"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const tokens = await signIn(email, password)
    const response = NextResponse.json({ email })

    const cookieOpts = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" }

    if (tokens.idToken) {
      response.cookies.set("id_token", tokens.idToken, { ...cookieOpts, maxAge: 60 * 60 * 24 })
    }
    if (tokens.accessToken) {
      response.cookies.set("access_token", tokens.accessToken, { ...cookieOpts, maxAge: 60 * 60 * 24 })
    }
    if (tokens.refreshToken) {
      response.cookies.set("refresh_token", tokens.refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 })
    }

    return response
  } catch (err: unknown) {
    const msg = (err as Error)?.message || "Login failed"
    // Translate Cognito error codes to user-friendly messages
    if (msg.includes("NotAuthorizedException") || msg.includes("Incorrect username or password")) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 })
    }
    if (msg.includes("UserNotConfirmedException")) {
      return NextResponse.json({ error: "Please confirm your email before signing in.", code: "unconfirmed" }, { status: 401 })
    }
    return NextResponse.json({ error: msg }, { status: 401 })
  }
}
