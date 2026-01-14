"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PoolList } from "@/components/pool/PoolList";
import { CreatePoolForm } from "@/components/pool/CreatePoolForm";
import { AddLiquidityForm } from "@/components/pool/AddLiquidityForm";
import { getPool, PoolState } from "@/lib/api";
import { formatUnits } from "viem";

export default function PoolPage() {
  const [activeTab, setActiveTab] = useState("pools");
  const [poolState, setPoolState] = useState<PoolState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoolState = async () => {
      try {
        const data = await getPool();
        setPoolState(data);
      } catch (err) {
        console.error("Failed to fetch pool state:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoolState();
    const interval = setInterval(fetchPoolState, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate stats from pool state
  const stats = poolState
    ? {
        realRWA: Number(formatUnits(BigInt(poolState.real.rwa), 18)),
        realStable: Number(formatUnits(BigInt(poolState.real.stable), 18)),
        effectiveRWA: Number(formatUnits(BigInt(poolState.effective.rwa), 18)),
        effectiveStable: Number(formatUnits(BigInt(poolState.effective.stable), 18)),
        virtualRWA: Number(formatUnits(BigInt(poolState.virtual.rwa), 18)),
        virtualStable: Number(formatUnits(BigInt(poolState.virtual.stable), 18)),
        feeBps: Number(poolState.feeBps),
        tvl: Number(formatUnits(BigInt(poolState.real.stable), 18)) +
             Number(formatUnits(BigInt(poolState.real.rwa), 18)) *
             (Number(poolState.effective.stable) / Number(poolState.effective.rwa || 1)),
      }
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Liquidity Pools</h1>
            <p className="text-muted-foreground">
              Provide liquidity to RWA pools and earn trading fees
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="pools">All Pools</TabsTrigger>
              <TabsTrigger value="my-positions">My Positions</TabsTrigger>
              <TabsTrigger value="create">Create Pool</TabsTrigger>
              <TabsTrigger value="add-liquidity">Add Liquidity</TabsTrigger>
            </TabsList>

            <TabsContent value="pools" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Real RWA Reserve</div>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : stats?.realRWA.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Real Stable Reserve</div>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : stats?.realStable.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Virtual RWA</div>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : stats?.virtualRWA.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Fee</div>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : `${(stats?.feeBps || 0) / 100}%`}
                  </div>
                </div>
              </div>

              {/* Pool Details */}
              {poolState && (
                <div className="glass-card rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Core Pool State</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Real Reserves</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>RWA:</span>
                          <span className="font-mono">{stats?.realRWA.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stable:</span>
                          <span className="font-mono">{stats?.realStable.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Virtual Reserves</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>RWA:</span>
                          <span className="font-mono">{stats?.virtualRWA.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stable:</span>
                          <span className="font-mono">{stats?.virtualStable.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Effective Reserves</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>RWA:</span>
                          <span className="font-mono">{stats?.effectiveRWA.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stable:</span>
                          <span className="font-mono">{stats?.effectiveStable.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <PoolList />
            </TabsContent>

            <TabsContent value="my-positions">
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No Positions Found</h3>
                <p className="text-muted-foreground mb-6">
                  Connect your wallet to view your liquidity positions
                </p>
                <button
                  onClick={() => setActiveTab("add-liquidity")}
                  className="bg-foreground text-background hover:bg-foreground/90 px-6 py-2 rounded-xl font-medium transition-colors"
                >
                  Add Liquidity
                </button>
              </div>
            </TabsContent>

            <TabsContent value="create">
              <div className="max-w-lg mx-auto">
                <CreatePoolForm />
              </div>
            </TabsContent>

            <TabsContent value="add-liquidity">
              <div className="max-w-lg mx-auto">
                <AddLiquidityForm />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
