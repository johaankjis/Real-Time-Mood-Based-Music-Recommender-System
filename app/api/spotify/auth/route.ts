import { NextResponse } from "next/server"
import { getSpotifyAuthUrl } from "@/lib/spotify"
import { randomBytes } from "crypto"

export async function GET() {
  // Generate random state for CSRF protection
  const state = randomBytes(16).toString("hex")

  const authUrl = getSpotifyAuthUrl(state)

  // In production, you'd want to store the state in a session/cookie
  const response = NextResponse.redirect(authUrl)
  response.cookies.set("spotify_auth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
  })

  return response
}
