import { Music, Sparkles, Brain } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 backdrop-blur-sm">
              <Music className="h-6 w-6 text-accent" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-3/20 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-chart-3" />
            </div>
          </div>

          <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-7xl">
            Music That Matches Your{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">
              Mood
            </span>
          </h1>

          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            Experience the future of music discovery. Our AI-powered system detects your emotions in real-time and
            generates personalized Spotify playlists that perfectly match how you feel.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-muted-foreground">90%+ Accuracy</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <span className="text-muted-foreground">&lt;150ms Response</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
