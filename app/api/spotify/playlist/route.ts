import { type NextRequest, NextResponse } from "next/server"
import { createPlaylist, getUserProfile, refreshAccessToken } from "@/lib/spotify"

export async function POST(request: NextRequest) {
  try {
    const { name, description, trackUris } = await request.json()

    if (!name || !trackUris || !Array.isArray(trackUris)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
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
      } catch (error) {
        console.error("[v0] Token refresh failed:", error)
        return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
      }
    }

    // Get user profile to get user ID
    const profile = await getUserProfile(accessToken!)

    // Create playlist
    const playlist = await createPlaylist(
      accessToken!,
      profile.id,
      name,
      description || `Playlist created by MoodTune`,
      trackUris,
    )

    return NextResponse.json({ playlist })
  } catch (error) {
    console.error("[v0] Playlist creation error:", error)
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 })
  }
}
