import { IconBolt, IconTrendingUp, IconUsers } from "@/lib/icons";

const features = [
  {
    icon: IconBolt,
    title: "Real-time Chat",
    description: "Instant messaging powered by WebSockets. No refresh needed.",
  },
  {
    icon: IconTrendingUp,
    title: "Community Upvotes",
    description: "The best messages rise to the top based on community votes.",
  },
  {
    icon: IconUsers,
    title: "Room-based",
    description: "Create private rooms and invite others with a simple room code.",
  },
];

export default function FeatureCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="glass rounded-2xl p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <feature.icon className="h-5 w-5" />
          </div>
          <h3 className="mb-1 font-semibold text-foreground">{feature.title}</h3>
          <p className="text-sm text-muted">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
