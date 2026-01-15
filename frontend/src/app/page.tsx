import { Header } from "@/components/layout/Header";
import { SwapCard } from "@/components/swap/SwapCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <SwapCard />
        </div>
      </main>
    </div>
  );
}
