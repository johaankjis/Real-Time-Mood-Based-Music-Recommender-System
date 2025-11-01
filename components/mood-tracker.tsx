"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Calendar, BarChart3, Smile, Frown, Meh, Angry, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface MoodEntry {
  emotion: string
  timestamp: number
  playlistCreated: boolean
}

const emotionIcons: Record<string, any> = {
  happy: Smile,
  sad: Frown,
  neutral: Meh,
  angry: Angry,
  surprised: Zap,
}

const emotionColors: Record<string, string> = {
  happy: "text-chart-4 bg-chart-4/20",
  sad: "text-chart-2 bg-chart-2/20",
  neutral: "text-chart-3 bg-chart-3/20",
  angry: "text-destructive bg-destructive/20",
  surprised: "text-chart-5 bg-chart-5/20",
}

export function MoodTracker() {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    mostCommonMood: "",
    playlistsCreated: 0,
    streakDays: 0,
  })

  useEffect(() => {
    // Load mood history from localStorage
    const stored = localStorage.getItem("moodHistory")
    if (stored) {
      const history = JSON.parse(stored) as MoodEntry[]
      setMoodHistory(history)
      calculateStats(history)
    }

    // Listen for new mood entries
    const handleMoodChange = (event: CustomEvent) => {
      const newEntry: MoodEntry = {
        emotion: event.detail.emotion,
        timestamp: Date.now(),
        playlistCreated: event.detail.playlistCreated || false,
      }

      const updatedHistory = [newEntry, ...moodHistory].slice(0, 50) // Keep last 50 entries
      setMoodHistory(updatedHistory)
      localStorage.setItem("moodHistory", JSON.stringify(updatedHistory))
      calculateStats(updatedHistory)
    }

    window.addEventListener("moodDetected", handleMoodChange as EventListener)
    return () => window.removeEventListener("moodDetected", handleMoodChange as EventListener)
  }, [moodHistory])

  function calculateStats(history: MoodEntry[]) {
    if (history.length === 0) {
      setStats({
        totalSessions: 0,
        mostCommonMood: "",
        playlistsCreated: 0,
        streakDays: 0,
      })
      return
    }

    // Count emotions
    const emotionCounts: Record<string, number> = {}
    let playlistCount = 0

    history.forEach((entry) => {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1
      if (entry.playlistCreated) playlistCount++
    })

    // Find most common mood
    const mostCommon = Object.entries(emotionCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0]

    // Calculate streak (consecutive days with entries)
    const uniqueDays = new Set(history.map((entry) => new Date(entry.timestamp).toDateString()))
    const streak = calculateStreak(history)

    setStats({
      totalSessions: history.length,
      mostCommonMood: mostCommon,
      playlistsCreated: playlistCount,
      streakDays: streak,
    })
  }

  function calculateStreak(history: MoodEntry[]): number {
    if (history.length === 0) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let streak = 0
    const currentDate = new Date(today)

    const datesWithEntries = new Set(
      history.map((entry) => {
        const date = new Date(entry.timestamp)
        date.setHours(0, 0, 0, 0)
        return date.getTime()
      }),
    )

    // Check if there's an entry today or yesterday to start counting
    if (!datesWithEntries.has(today.getTime())) {
      currentDate.setDate(currentDate.getDate() - 1)
      if (!datesWithEntries.has(currentDate.getTime())) {
        return 0
      }
    }

    // Count consecutive days
    while (datesWithEntries.has(currentDate.getTime())) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
  }

  function clearHistory() {
    if (confirm("Are you sure you want to clear your mood history?")) {
      setMoodHistory([])
      localStorage.removeItem("moodHistory")
      setStats({
        totalSessions: 0,
        mostCommonMood: "",
        playlistsCreated: 0,
        streakDays: 0,
      })
    }
  }

  function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Track Your Mood Journey</h2>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          Monitor your emotional patterns and music preferences over time
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-3xl font-bold">{stats.totalSessions}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Most Common</p>
                <p className="text-xl font-bold capitalize">{stats.mostCommonMood || "N/A"}</p>
              </div>
              {stats.mostCommonMood && emotionIcons[stats.mostCommonMood] && (
                <div className={cn("rounded-full p-2", emotionColors[stats.mostCommonMood])}>
                  {(() => {
                    const Icon = emotionIcons[stats.mostCommonMood]
                    return <Icon className="h-6 w-6" />
                  })()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Playlists Created</p>
                <p className="text-3xl font-bold">{stats.playlistsCreated}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
                <p className="text-3xl font-bold">{stats.streakDays}</p>
              </div>
              <Calendar className="h-8 w-8 text-chart-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood History */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Mood History</CardTitle>
              <CardDescription>Your last 50 emotion detection sessions</CardDescription>
            </div>
            {moodHistory.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearHistory}>
                Clear History
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {moodHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="mb-4 h-16 w-16 text-muted-foreground/50" />
              <p className="text-center text-sm text-muted-foreground">
                No mood history yet. Start detecting your emotions to see your journey!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {moodHistory.map((entry, index) => {
                const Icon = emotionIcons[entry.emotion]
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("rounded-full p-2", emotionColors[entry.emotion])}>
                        {Icon && <Icon className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{entry.emotion}</p>
                        <p className="text-sm text-muted-foreground">{formatTimeAgo(entry.timestamp)}</p>
                      </div>
                    </div>
                    {entry.playlistCreated && (
                      <div className="rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">Playlist Created</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
