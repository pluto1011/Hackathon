"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { getPool, getQueue, PoolState, QueueResult } from "@/lib/api";
import { formatUnits } from "viem";

interface AddLiquidityFormProps {
  poolId?: string;
  rwaSymbol?: string;
  stableSymbol?: string;
}

export function AddLiquidityForm({
  poolId,
  rwaSymbol = "RWA",
  stableSymbol = "USDC",
}: AddLiquidityFormProps) {
  const [rwaAmount, setRwaAmount] = useState("");
  const [stableAmount, setStableAmount] = useState("");
  const [processQueue, setProcessQueue] = useState(true);
  const [maxUsers, setMaxUsers] = useState("10");
  const [poolState, setPoolState] = useState<PoolState | null>(null);
  const [queueInfo, setQueueInfo] = useState<QueueResult | null>(null);

  // Fetch pool and queue state
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pool, queue] = await Promise.all([getPool(), getQueue()]);
        setPoolState(pool);
        setQueueInfo(queue);
      } catch (err) {
        console.error("Failed to fetch pool/queue:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const poolInfo = poolState
    ? {
        currentPrice:
          Number(poolState.effective.stable) > 0 && Number(poolState.effective.rwa) > 0
            ? Number(formatUnits(BigInt(poolState.effective.stable), 18)) /
              Number(formatUnits(BigInt(poolState.effective.rwa), 18))
            : 0,
        totalRealReserve: Number(formatUnits(BigInt(poolState.real.rwa), 18)),
        totalVirtualReserve: Number(formatUnits(BigInt(poolState.virtual.rwa), 18)),
        totalRealStable: Number(formatUnits(BigInt(poolState.real.stable), 18)),
      }
    : null;

  const handleRwaChange = (value: string) => {
    setRwaAmount(value);
    if (value && poolInfo && poolInfo.currentPrice > 0) {
      const stable = parseFloat(value) * poolInfo.currentPrice;
      setStableAmount(stable.toFixed(2));
    } else {
      setStableAmount("");
    }
  };

  const handleStableChange = (value: string) => {
    setStableAmount(value);
    if (value && poolInfo && poolInfo.currentPrice > 0) {
      const rwa = parseFloat(value) / poolInfo.currentPrice;
      setRwaAmount(rwa.toFixed(6));
    } else {
      setRwaAmount("");
    }
  };

  const getButtonText = () => {
    if (!rwaAmount && !stableAmount) return "Enter amounts";
    if (processQueue && queueInfo && queueInfo.pendingCount > 0) {
      return `Add Liquidity & Process Queue (${queueInfo.pendingCount} pending)`;
    }
    return "Add Liquidity";
  };

  return (
    <Card className="glass-card border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Add Liquidity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="bg-secondary/30 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary z-10 border-2 border-background">
                  {rwaSymbol.slice(0, 2)}
                </div>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                  {stableSymbol.slice(0, 2)}
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg">{rwaSymbol}/{stableSymbol}</div>
                <div className="text-sm text-muted-foreground">
                  1 {rwaSymbol} = ${poolInfo?.currentPrice.toFixed(2) || "0.00"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">{rwaSymbol} Amount</label>
              <span className="text-xs text-muted-foreground">Balance: 0.00</span>
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="0.00"
                value={rwaAmount}
                onChange={(e) => handleRwaChange(e.target.value)}
                className="pr-20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary">
                  MAX
                </Button>
                <span className="text-sm font-medium">{rwaSymbol}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
              +
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">{stableSymbol} Amount</label>
              <span className="text-xs text-muted-foreground">Balance: 0.00</span>
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="0.00"
                value={stableAmount}
                onChange={(e) => handleStableChange(e.target.value)}
                className="pr-20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary">
                  MAX
                </Button>
                <span className="text-sm font-medium">{stableSymbol}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Queue Processing Option */}
        {queueInfo && queueInfo.pendingCount > 0 && (
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="processQueue"
                  checked={processQueue}
                  onChange={(e) => setProcessQueue(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="processQueue" className="text-sm cursor-pointer">
                  Process reservation queue
                </Label>
              </div>
              <span className="text-xs text-blue-500">{queueInfo.pendingCount} pending</span>
            </div>
            {processQueue && (
              <div className="flex items-center gap-2 mt-2">
                <Label className="text-xs text-muted-foreground">Max users to process:</Label>
                <Input
                  type="number"
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(e.target.value)}
                  className="w-20 h-7 text-xs"
                  min="1"
                  max="100"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Using addLiquidityAndProcess() to add liquidity and process queue in one transaction.
            </p>
          </div>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pool Real Reserve</span>
            <span className="font-medium">{poolInfo?.totalRealReserve.toLocaleString(undefined, { maximumFractionDigits: 2 }) || "0"} {rwaSymbol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pool Virtual Reserve</span>
            <span className="font-medium text-primary">{poolInfo?.totalVirtualReserve.toLocaleString(undefined, { maximumFractionDigits: 2 }) || "0"} {rwaSymbol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pool Stable Reserve</span>
            <span className="font-medium">{poolInfo?.totalRealStable.toLocaleString(undefined, { maximumFractionDigits: 2 }) || "0"} {stableSymbol}</span>
          </div>
        </div>

        <Button
          className="w-full h-14 text-lg font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-2xl"
          disabled={!rwaAmount && !stableAmount}
        >
          {getButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
}
