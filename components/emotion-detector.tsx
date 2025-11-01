"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Smile, Frown, Meh, Angry, Zap, Music2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PlaylistGenerator } from "@/components/playlist-generator"

type Emotion = "happy" | "sad" | "neutral" | "angry" | "surprised"

const emotions: { value: Emotion; label: string; icon: any; color: string }[] = [
  { value: "happy", label: "Happy", icon: Smile, color: "text-chart-4" },
  { value: "sad", label: "Sad", icon: Frown, color: "text-chart-2" },
  { value: "neutral", label: "Neutral", icon: Meh, color: "text-chart-3" },
  { value: "angry", label: "Angry", icon: Angry, color: "text-destructive" },
  { value: "surprised", label: "Surprised", icon: Zap, color: "text-chart-5" },
]

export function EmotionDetector() {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)

  const handleDetect = (emotion: Emotion) => {
    setIsDetecting(true)
    setSelectedEmotion(emotion)

    window.dispatchEvent(
      new CustomEvent("moodDetected", {
        detail: { emotion, playlistCreated: false },
      }),
    )

    setTimeout(() => {
      setIsDetecting(false)
    }, 1500)
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">How Are You Feeling?</h2>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          Select your current mood or let our AI detect it automatically
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Emotion Detection Area */}
        <Card className="relative overflow-hidden border-2 border-border bg-card p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Emotion Detection</h3>
            {selectedEmotion && (
              <div className="flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-sm">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span className="text-primary">Active</span>
              </div>
            )}
          </div>

          {/* Simulated Camera View */}
          <div className="relative mb-6 aspect-video overflow-hidden rounded-lg bg-secondary">
            <div className="absolute inset-0 flex items-center justify-center">
              {isDetecting ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-24 w-24 animate-pulse rounded-full border-4 border-primary" />
                  <p className="text-sm text-muted-foreground">Analyzing emotion...</p>
                </div>
              ) : selectedEmotion ? (
                <div className="flex flex-col items-center gap-4">
                  {emotions.find((e) => e.value === selectedEmotion)?.icon && (
                    <div className={cn("h-24 w-24", emotions.find((e) => e.value === selectedEmotion)?.color)}>
                      {(() => {
                        const Icon = emotions.find((e) => e.value === selectedEmotion)?.icon
                        return Icon ? <Icon className="h-full w-full" /> : null
                      })()}
                    </div>
                  )}
                  <p className="text-lg font-medium">
                    Detected: {emotions.find((e) => e.value === selectedEmotion)?.label}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Music2 className="h-24 w-24 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Select an emotion to begin</p>
                </div>
              )}
            </div>
          </div>

          {/* Emotion Selector */}
          <div className="grid grid-cols-5 gap-2">
            {emotions.map((emotion) => {
              const Icon = emotion.icon
              return (
                <Button
                  key={emotion.value}
                  variant={selectedEmotion === emotion.value ? "default" : "outline"}
                  className={cn(
                    "flex h-auto flex-col gap-2 py-4",
                    selectedEmotion === emotion.value && "border-primary bg-primary/20",
                  )}
                  onClick={() => handleDetect(emotion.value)}
                >
                  <Icon className={cn("h-6 w-6", emotion.color)} />
                  <span className="text-xs">{emotion.label}</span>
                </Button>
              )
            })}
          </div>
        </Card>

        {/* Playlist Generator */}
        {selectedEmotion ? (
          <PlaylistGenerator emotion={selectedEmotion} />
        ) : (
          <Card className="border-2 border-border bg-card p-8">
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <div className="text-center">
                <Music2 className="mx-auto h-16 w-16 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Select your mood to generate a personalized playlist
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </section>
  )
}
