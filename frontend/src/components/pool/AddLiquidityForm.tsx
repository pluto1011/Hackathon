"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface AddLiquidityFormProps {
  poolId?: string;
  rwaSymbol?: string;
  stableSymbol?: string;
}

export function AddLiquidityForm({
  poolId,
  rwaSymbol = "rTSLA",
  stableSymbol = "USDC",
}: AddLiquidityFormProps) {
  const [rwaAmount, setRwaAmount] = useState("");
  const [stableAmount, setStableAmount] = useState("");

  const poolInfo = {
    currentPrice: 245.32,
    yourLiquidity: 0,
    yourShare: 0,
    totalRealReserve: 1250,
    totalVirtualReserve: 625,
  };

  const handleRwaChange = (value: string) => {
    setRwaAmount(value);
    if (value) {
      const stable = parseFloat(value) * poolInfo.currentPrice;
      setStableAmount(stable.toFixed(2));
    } else {
      setStableAmount("");
    }
  };

  const handleStableChange = (value: string) => {
    setStableAmount(value);
    if (value) {
      const rwa = parseFloat(value) / poolInfo.currentPrice;
      setRwaAmount(rwa.toFixed(6));
    } else {
      setRwaAmount("");
    }
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
                  1 {rwaSymbol} = ${poolInfo.currentPrice.toFixed(2)}
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

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Your Pool Share</span>
            <span className="font-medium">{poolInfo.yourShare}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pool Real Reserve</span>
            <span className="font-medium">{poolInfo.totalRealReserve.toLocaleString()} {rwaSymbol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pool Virtual Reserve</span>
            <span className="font-medium text-primary">{poolInfo.totalVirtualReserve.toLocaleString()} {rwaSymbol}</span>
          </div>
        </div>

        <Button
          className="w-full h-14 text-lg font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-2xl"
          disabled={!rwaAmount || !stableAmount}
        >
          {!rwaAmount || !stableAmount ? "Enter amounts" : "Add Liquidity"}
        </Button>
      </CardContent>
    </Card>
  );
}
