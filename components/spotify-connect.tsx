"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music } from "lucide-react"

interface SpotifyStatus {
  authenticated: boolean
  user?: {
    id: string
    name: string
  }
}

export function SpotifyConnect() {
  const [status, setStatus] = useState<SpotifyStatus>({ authenticated: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStatus()
  }, [])

  async function checkStatus() {
    try {
      const response = await fetch("/api/spotify/status")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("[v0] Failed to check Spotify status:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleConnect() {
    window.location.href = "/api/spotify/auth"
  }

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          Spotify Connection
        </CardTitle>
        <CardDescription>
          {status.authenticated
            ? `Connected as ${status.user?.name}`
            : "Connect your Spotify account to create personalized playlists"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status.authenticated ? (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">Connected</span>
          </div>
        ) : (
          <Button onClick={handleConnect} className="w-full">
            Connect Spotify
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
