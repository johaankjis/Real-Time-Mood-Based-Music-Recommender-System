import { type NextRequest, NextResponse } from "next/server"
import { getUserProfile, refreshAccessToken } from "@/lib/spotify"

export async function GET(request: NextRequest) {
  let accessToken = request.cookies.get("spotify_access_token")?.value
  const refreshToken = request.cookies.get("spotify_refresh_token")?.value

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ authenticated: false })
  }

  // Try to refresh token if access token is missing
  if (!accessToken && refreshToken) {
    try {
      const tokens = await refreshAccessToken(refreshToken)
      accessToken = tokens.access_token

      const response = NextResponse.json({ authenticated: true })
      response.cookies.set("spotify_access_token", tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: tokens.expires_in,
      })

      return response
    } catch (error) {
      console.error("[v0] Token refresh failed:", error)
      return NextResponse.json({ authenticated: false })
    }
  }

  try {
    const profile = await getUserProfile(accessToken!)
    return NextResponse.json({
      authenticated: true,
      user: {
        id: profile.id,
        name: profile.display_name,
      },
    })
  } catch (error) {
    console.error("[v0] Profile fetch failed:", error)
    return NextResponse.json({ authenticated: false })
  }
}
