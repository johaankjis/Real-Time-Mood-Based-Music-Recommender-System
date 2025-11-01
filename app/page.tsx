import { EmotionDetector } from "@/components/emotion-detector"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { SpotifyConnect } from "@/components/spotify-connect"
import { MoodTracker } from "@/components/mood-tracker"

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <section className="container mx-auto px-4 py-12">
        <SpotifyConnect />
      </section>
      <EmotionDetector />
      <MoodTracker />
      <StatsSection />
    </main>
  )
}
