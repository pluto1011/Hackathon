"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Pool {
  id: string;
  rwaToken: {
    symbol: string;
    name: string;
  };
  stableToken: {
    symbol: string;
  };
  realReserve: number;
  virtualReservePercent: number;
  tvl: number;
  volume24h: number;
  apy: number;
  utilization: number;
}

const mockPools: Pool[] = [
  {
    id: "1",
    rwaToken: { symbol: "rTSLA", name: "RWA Tesla" },
    stableToken: { symbol: "USDC" },
    realReserve: 1250,
    virtualReservePercent: 50,
    tvl: 1250000,
    volume24h: 245000,
    apy: 12.5,
    utilization: 75,
  },
  {
    id: "2",
    rwaToken: { symbol: "rGOLD", name: "RWA Gold" },
    stableToken: { symbol: "USDC" },
    realReserve: 500,
    virtualReservePercent: 100,
    tvl: 980000,
    volume24h: 125000,
    apy: 8.2,
    utilization: 45,
  },
  {
    id: "3",
    rwaToken: { symbol: "rREIT", name: "RWA Real Estate" },
    stableToken: { symbol: "USDT" },
    realReserve: 2500,
    virtualReservePercent: 75,
    tvl: 2100000,
    volume24h: 320000,
    apy: 15.8,
    utilization: 88,
  },
];

export function PoolList() {
  return (
    <div className="space-y-4">
      <div className="hidden md:grid grid-cols-7 gap-4 px-4 text-sm text-muted-foreground">
        <span className="col-span-2">Pool</span>
        <span className="text-right">TVL</span>
        <span className="text-right">Volume (24h)</span>
        <span className="text-right">APY</span>
        <span className="text-right">Real Reserve</span>
        <span className="text-right">Actions</span>
      </div>

      {mockPools.map((pool) => (
        <Card key={pool.id} className="glass-card border-border/50 hover:border-border transition-colors">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4 items-center">
              <div className="col-span-2 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary z-10 border-2 border-background">
                    {pool.rwaToken.symbol.slice(0, 2)}
                  </div>
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                    {pool.stableToken.symbol.slice(0, 2)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{pool.rwaToken.symbol}/{pool.stableToken.symbol}</span>
                    <Badge variant="outline" className="text-[10px] border-primary/50 text-primary">
                      RWA
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{pool.rwaToken.name}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium">${(pool.tvl / 1000000).toFixed(2)}M</div>
                <div className="text-sm text-muted-foreground md:hidden">TVL</div>
              </div>

              <div className="text-right">
                <div className="font-medium">${(pool.volume24h / 1000).toFixed(0)}K</div>
                <div className="text-sm text-muted-foreground md:hidden">24h Vol</div>
              </div>

              <div className="text-right">
                <div className="font-medium">{pool.apy}%</div>
                <div className="text-sm text-muted-foreground md:hidden">APY</div>
              </div>

              <div className="text-right">
                <div className="font-medium">{pool.realReserve.toLocaleString()}</div>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground/80 rounded-full"
                      style={{ width: `${pool.utilization}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{pool.utilization}%</span>
                </div>
              </div>

              <div className="col-span-2 md:col-span-1 flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/pool/${pool.id}`}>
                    Manage
                  </Link>
                </Button>
                <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90" asChild>
                  <Link href={`/?token=${pool.rwaToken.symbol}`}>
                    Trade
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
