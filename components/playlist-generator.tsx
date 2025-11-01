"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Music, Plus, Loader2, ExternalLink, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { SpotifyTrack } from "@/lib/spotify"

interface PlaylistGeneratorProps {
  emotion: string
}

export function PlaylistGenerator({ emotion }: PlaylistGeneratorProps) {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [playlistName, setPlaylistName] = useState("")
  const [createdPlaylist, setCreatedPlaylist] = useState<{ id: string; external_urls: { spotify: string } } | null>(
    null,
  )
  const { toast } = useToast()

  async function generateTracks() {
    setLoading(true)
    setCreatedPlaylist(null)

    try {
      const response = await fetch("/api/spotify/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: emotion }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 401) {
          toast({
            title: "Not Connected",
            description: "Please connect your Spotify account first.",
            variant: "destructive",
          })
          return
        }
        throw new Error(data.error || "Failed to fetch tracks")
      }

      const data = await response.json()
      setTracks(data.tracks)
      setSelectedTracks(new Set(data.tracks.slice(0, 10).map((t: SpotifyTrack) => t.id)))
      setPlaylistName(
        `${emotion.charAt(0).toUpperCase() + emotion.slice(1)} Vibes - ${new Date().toLocaleDateString()}`,
      )

      toast({
        title: "Tracks Generated",
        description: `Found ${data.tracks.length} tracks for your ${emotion} mood.`,
      })
    } catch (error) {
      console.error("[v0] Failed to generate tracks:", error)
      toast({
        title: "Error",
        description: "Failed to generate tracks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function createPlaylist() {
    if (selectedTracks.size === 0) {
      toast({
        title: "No Tracks Selected",
        description: "Please select at least one track.",
        variant: "destructive",
      })
      return
    }

    setCreating(true)

    try {
      const trackUris = Array.from(selectedTracks)
        .map((id) => {
          const track = tracks.find((t) => t.id === id)
          return track?.uri
        })
        .filter(Boolean) as string[]

      const response = await fetch("/api/spotify/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playlistName || `${emotion} Playlist`,
          description: `A mood-based playlist created by MoodTune for your ${emotion} mood.`,
          trackUris,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create playlist")
      }

      const data = await response.json()
      setCreatedPlaylist(data.playlist)

      window.dispatchEvent(
        new CustomEvent("moodDetected", {
          detail: { emotion, playlistCreated: true },
        }),
      )

      toast({
        title: "Playlist Created!",
        description: `"${playlistName}" has been added to your Spotify library.`,
      })
    } catch (error) {
      console.error("[v0] Failed to create playlist:", error)
      toast({
        title: "Error",
        description: "Failed to create playlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  function toggleTrack(trackId: string) {
    const newSelected = new Set(selectedTracks)
    if (newSelected.has(trackId)) {
      newSelected.delete(trackId)
    } else {
      newSelected.add(trackId)
    }
    setSelectedTracks(newSelected)
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          Generate Playlist
        </CardTitle>
        <CardDescription>Create a personalized Spotify playlist based on your {emotion} mood</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Music className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <p className="mb-4 text-center text-sm text-muted-foreground">Generate tracks based on your current mood</p>
            <Button onClick={generateTracks} disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Generate Tracks
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="playlist-name">Playlist Name</Label>
                <Input
                  id="playlist-name"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  className="mt-1.5"
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <Label>Select Tracks ({selectedTracks.size} selected)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (selectedTracks.size === tracks.length) {
                        setSelectedTracks(new Set())
                      } else {
                        setSelectedTracks(new Set(tracks.map((t) => t.id)))
                      }
                    }}
                  >
                    {selectedTracks.size === tracks.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>

                <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 rounded-lg bg-card p-3 transition-colors hover:bg-accent/50"
                    >
                      <Checkbox checked={selectedTracks.has(track.id)} onCheckedChange={() => toggleTrack(track.id)} />
                      {track.album.images[0] && (
                        <img
                          src={track.album.images[0].url || "/placeholder.svg"}
                          alt={track.album.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{track.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {track.artists.map((a) => a.name).join(", ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={createPlaylist}
                disabled={creating || selectedTracks.size === 0}
                className="flex-1 gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : createdPlaylist ? (
                  <>
                    <Check className="h-4 w-4" />
                    Created
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Playlist
                  </>
                )}
              </Button>

              {createdPlaylist && (
                <Button
                  variant="outline"
                  onClick={() => window.open(createdPlaylist.external_urls.spotify, "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Spotify
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={generateTracks}
              disabled={loading}
              className="w-full gap-2 bg-transparent"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Music className="h-4 w-4" />
                  Regenerate Tracks
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
