import { HeroSection } from "@/src/components/hero-section"
import { ProcessSection } from "@/src/components/process-section"
import { Footer } from "@/src/components/footer"
import { Navbar } from "@/src/components/navbar"

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <ProcessSection />
      <Footer />
    </main>
  )
}
