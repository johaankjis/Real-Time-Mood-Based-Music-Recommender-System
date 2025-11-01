import { type NextRequest, NextResponse } from "next/server"
import { searchTracksByMood, refreshAccessToken } from "@/lib/spotify"

export async function POST(request: NextRequest) {
  try {
    const { mood } = await request.json()

    if (!mood) {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 })
    }

    let accessToken = request.cookies.get("spotify_access_token")?.value
    const refreshToken = request.cookies.get("spotify_refresh_token")?.value

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Try to refresh token if access token is missing
    if (!accessToken && refreshToken) {
      try {
        const tokens = await refreshAccessToken(refreshToken)
        accessToken = tokens.access_token

        // Update cookies with new tokens
        const response = NextResponse.json({ tracks: [] })
        response.cookies.set("spotify_access_token", tokens.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: tokens.expires_in,
        })
      } catch (error) {
        console.error("[v0] Token refresh failed:", error)
        return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
      }
    }

    const tracks = await searchTracksByMood(accessToken!, mood)

    return NextResponse.json({ tracks })
  } catch (error) {
    console.error("[v0] Search error:", error)
    return NextResponse.json({ error: "Failed to search tracks" }, { status: 500 })
  }
}
