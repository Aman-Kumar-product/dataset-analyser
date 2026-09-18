import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  return (
    <main className="min-h-screen p-8 md:p-24 max-w-7xl mx-auto">
      <div className="flex flex-col items-start gap-2 mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          AI UX <span className="text-gradient">Discovery</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mt-4">
          Uncovering latent user needs by semantically clustering thousands of raw feedback rows using HDBSCAN and synthesizing insights with Groq.
        </p>
      </div>
      
      <Dashboard />
    </main>
  );
}
