import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens } from "@/lib/spotify"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/?error=missing_params", request.url))
  }

  // Verify state matches (CSRF protection)
  const savedState = request.cookies.get("spotify_auth_state")?.value
  if (state !== savedState) {
    return NextResponse.redirect(new URL("/?error=state_mismatch", request.url))
  }

  try {
    const tokens = await exchangeCodeForTokens(code)

    // Store tokens in cookies (in production, use a more secure method)
    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.set("spotify_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
    })
    response.cookies.set("spotify_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error("[v0] Spotify callback error:", error)
    return NextResponse.redirect(new URL("/?error=token_exchange_failed", request.url))
  }
}
