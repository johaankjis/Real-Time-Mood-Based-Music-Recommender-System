const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || "http://localhost:3000/api/spotify/callback"

export interface SpotifyTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
  }
  uri: string
}

export function getSpotifyAuthUrl(state: string): string {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "playlist-modify-public",
    "playlist-modify-private",
    "user-top-read",
  ]

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: scopes.join(" "),
    state,
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string): Promise<SpotifyTokens> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to exchange code for tokens")
  }

  return response.json()
}

export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokens> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to refresh access token")
  }

  return response.json()
}

export async function searchTracksByMood(accessToken: string, mood: string, limit = 20): Promise<SpotifyTrack[]> {
  // Map moods to Spotify audio features
  const moodToFeatures: Record<string, { valence: number; energy: number; query: string }> = {
    happy: { valence: 0.8, energy: 0.7, query: "happy upbeat pop" },
    sad: { valence: 0.2, energy: 0.3, query: "sad melancholic" },
    angry: { valence: 0.3, energy: 0.9, query: "aggressive rock metal" },
    neutral: { valence: 0.5, energy: 0.5, query: "chill ambient" },
    surprised: { valence: 0.7, energy: 0.8, query: "energetic exciting" },
    fearful: { valence: 0.3, energy: 0.6, query: "dark atmospheric" },
    disgusted: { valence: 0.2, energy: 0.4, query: "alternative indie" },
  }

  const features = moodToFeatures[mood.toLowerCase()] || moodToFeatures.neutral

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(features.query)}&type=track&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error("Failed to search tracks")
  }

  const data = await response.json()
  return data.tracks.items
}

export async function createPlaylist(
  accessToken: string,
  userId: string,
  name: string,
  description: string,
  trackUris: string[],
): Promise<{ id: string; external_urls: { spotify: string } }> {
  // Create playlist
  const createResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      public: false,
    }),
  })

  if (!createResponse.ok) {
    throw new Error("Failed to create playlist")
  }

  const playlist = await createResponse.json()

  // Add tracks to playlist
  if (trackUris.length > 0) {
    await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: trackUris,
      }),
    })
  }

  return playlist
}

export async function getUserProfile(accessToken: string): Promise<{ id: string; display_name: string }> {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get user profile")
  }

  return response.json()
}
