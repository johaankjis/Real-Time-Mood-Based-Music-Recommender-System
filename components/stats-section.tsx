import { Card } from "@/components/ui/card"
import { TrendingUp, Clock, Music, Users } from "lucide-react"

const stats = [
  {
    label: "Classification Accuracy",
    value: "92%",
    icon: TrendingUp,
    description: "Emotion detection precision",
  },
  {
    label: "Response Time",
    value: "<150ms",
    icon: Clock,
    description: "Real-time inference speed",
  },
  {
    label: "Songs Analyzed",
    value: "10K+",
    icon: Music,
    description: "Across all mood categories",
  },
  {
    label: "Active Users",
    value: "2.5K+",
    icon: Users,
    description: "Music lovers worldwide",
  },
]

export function StatsSection() {
  return (
    <section className="border-t border-border bg-secondary/30 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Powered by Advanced AI</h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Built with TensorFlow, OpenCV, and optimized data structures for lightning-fast performance
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="border-2 border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="mt-1 font-medium">{stat.label}</div>
                <p className="mt-2 text-sm text-muted-foreground">{stat.description}</p>
              </Card>
            )
          })}
        </div>

        <div className="mt-16 rounded-2xl border-2 border-border bg-card p-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Tech Stack</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• TensorFlow CNN Model</li>
                <li>• OpenCV for Computer Vision</li>
                <li>• Flask Backend API</li>
                <li>• Spotify Web API</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">Performance</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Hash maps for fast retrieval</li>
                <li>• Priority queues optimization</li>
                <li>• 40% faster song lookup</li>
                <li>• End-to-end &lt;1.5s flow</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time emotion detection</li>
                <li>• Dynamic playlist generation</li>
                <li>• Spotify integration</li>
                <li>• Personalized recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
