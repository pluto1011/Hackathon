"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { PriceChart } from "@/components/charts/PriceChart";
import { LiquidityChart } from "@/components/charts/LiquidityChart";
import { VolumeChart } from "@/components/charts/VolumeChart";

const tokens = [
  { symbol: "rTSLA", name: "RWA Tesla", realReserve: 1250, virtualReserve: 3750 },
  { symbol: "rGOLD", name: "RWA Gold", realReserve: 500, virtualReserve: 1500 },
  { symbol: "rREIT", name: "RWA Real Estate", realReserve: 2500, virtualReserve: 5000 },
];

export default function AnalyticsPage() {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold mb-1">Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Pool statistics and trading metrics
              </p>
            </div>

            <div className="flex gap-1 bg-secondary rounded-lg p-1">
              {tokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    selectedToken.symbol === token.symbol
                      ? "bg-card text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {token.symbol}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-card rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-1">TVL</div>
              <div className="text-2xl font-semibold">$2.45M</div>
              <div className="text-xs text-muted-foreground mt-1">+12.3% (7D)</div>
            </div>
            <div className="bg-card rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-1">24H Volume</div>
              <div className="text-2xl font-semibold">$156K</div>
              <div className="text-xs text-muted-foreground mt-1">+5.2% vs yesterday</div>
            </div>
            <div className="bg-card rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-1">Pending Reservations</div>
              <div className="text-2xl font-semibold">23</div>
              <div className="text-xs text-muted-foreground mt-1">$45.2K value</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <PriceChart tokenSymbol={selectedToken.symbol} />
            <LiquidityChart
              realReserve={selectedToken.realReserve}
              virtualReserve={selectedToken.virtualReserve}
              tokenSymbol={selectedToken.symbol}
            />
          </div>

          <VolumeChart tokenSymbol={selectedToken.symbol} />

          <div className="mt-4 bg-card rounded-xl p-4">
            <div className="text-sm text-muted-foreground mb-4">Recent Transactions</div>
            <div className="space-y-2">
              {[
                { type: "Swap", from: "100 USDC", to: "0.41 rTSLA", time: "2 min ago" },
                { type: "Swap", from: "500 USDC", to: "2.04 rTSLA", time: "5 min ago" },
                { type: "Reserve", from: "1000 USDC", to: "4.08 rTSLA", time: "12 min ago" },
                { type: "Claim", from: "-", to: "2.5 rTSLA", time: "23 min ago" },
                { type: "Swap", from: "250 USDC", to: "1.02 rTSLA", time: "31 min ago" },
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">{tx.type}</span>
                    <span className="text-sm">{tx.from} → {tx.to}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{tx.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
