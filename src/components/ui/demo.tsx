import { Hero } from "@/components/blocks/hero"

function HeroDemo({ onStart }: { onStart?: () => void }) {
  return (
    <Hero
      badge={
        <span className="inline-flex items-center gap-1.5 font-medium text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          IS 3812 · IRC:SP:58 · ASTM C618 Compliance Platform
        </span>
      }
      title="AI-Driven Industrial Byproduct Valorization"
      subtitle="Transform mineral waste streams into certified high-value circular construction materials. Benchmark laboratory assays, discover vetted regional off-takers, and unlock substantial economic arbitrage over ash pond disposal."
      actions={[
        {
          label: "Start Characterization Flow",
          href: "#characterize-workspace",
          variant: "default",
          onClick: (e) => {
            e.preventDefault()
            if (onStart) onStart()
            const el = document.getElementById("characterize-workspace")
            if (el) el.scrollIntoView({ behavior: "smooth" })
          }
        }
      ]}
      titleClassName="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight"
      subtitleClassName="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed mx-auto"
      actionsClassName="mt-4"
    />
  );
}

export { HeroDemo }
