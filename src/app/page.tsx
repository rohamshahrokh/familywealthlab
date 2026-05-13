import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Chaos } from "@/components/sections/Chaos";
import { CommandCenter } from "@/components/sections/CommandCenter";
import { WhatIf } from "@/components/sections/WhatIf";
import { AIInsights } from "@/components/sections/AIInsights";
import { MobileExperience } from "@/components/sections/MobileExperience";
import { Trust } from "@/components/sections/Trust";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="relative">
        <Hero />
        <Chaos />
        <CommandCenter />
        <WhatIf />
        <AIInsights />
        <MobileExperience />
        <Trust />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
