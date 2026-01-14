"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenSelector, Token } from "@/components/common/TokenSelector";
import { Separator } from "@/components/ui/separator";

export function CreatePoolForm() {
  const [rwaToken, setRwaToken] = useState<Token>();
  const [stableToken, setStableToken] = useState<Token>();
  const [rwaAmount, setRwaAmount] = useState("");
  const [stableAmount, setStableAmount] = useState("");
  const [virtualReservePercent, setVirtualReservePercent] = useState("50");

  const calculatePrice = () => {
    if (!rwaAmount || !stableAmount) return "0.00";
    const price = parseFloat(stableAmount) / parseFloat(rwaAmount);
    return isNaN(price) ? "0.00" : price.toFixed(4);
  };

  const calculateVirtualReserve = () => {
    if (!rwaAmount) return 0;
    return (parseFloat(rwaAmount) * parseFloat(virtualReservePercent)) / 100;
  };

  return (
    <Card className="glass-card border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Create New Pool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Select Tokens</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">RWA Token</label>
              <TokenSelector
                selectedToken={rwaToken}
                onSelect={setRwaToken}
                label="Select RWA"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Stable Token</label>
              <TokenSelector
                selectedToken={stableToken}
                onSelect={setStableToken}
                label="Select Stable"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Initial Liquidity</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">RWA Amount</label>
                <span className="text-xs text-muted-foreground">Balance: 0.00</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="0.00"
                  value={rwaAmount}
                  onChange={(e) => setRwaAmount(e.target.value)}
                  className="flex-1"
                />
                {rwaToken && (
                  <span className="text-sm font-medium px-3">{rwaToken.symbol}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">Stable Amount</label>
                <span className="text-xs text-muted-foreground">Balance: 0.00</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="0.00"
                  value={stableAmount}
                  onChange={(e) => setStableAmount(e.target.value)}
                  className="flex-1"
                />
                {stableToken && (
                  <span className="text-sm font-medium px-3">{stableToken.symbol}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Virtual Reserve Settings</h3>
            <span className="text-xs text-primary cursor-help" title="Virtual reserve helps maintain price stability by creating a buffer for price calculations">
              What is this?
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Virtual Reserve Ratio</span>
              <span className="font-medium">{virtualReservePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={virtualReservePercent}
              onChange={(e) => setVirtualReservePercent(e.target.value)}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0% (High Volatility)</span>
              <span>200% (High Stability)</span>
            </div>
          </div>

          <Card className="bg-secondary/50 border-0">
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Real RWA Reserve</span>
                <span className="font-medium">{rwaAmount || "0"} {rwaToken?.symbol || "RWA"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Virtual RWA Reserve</span>
                <span className="font-medium text-primary">{calculateVirtualReserve().toFixed(2)} {rwaToken?.symbol || "RWA"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Effective Reserve</span>
                <span className="font-medium">
                  {(parseFloat(rwaAmount || "0") + calculateVirtualReserve()).toFixed(2)} {rwaToken?.symbol || "RWA"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Pool Summary</h3>

          <Card className="bg-secondary/50 border-0">
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Initial Price</span>
                <span className="font-medium">1 {rwaToken?.symbol || "RWA"} = {calculatePrice()} {stableToken?.symbol || "USDC"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pool Type</span>
                <span className="font-medium">RWA Core Pool</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fee Tier</span>
                <span className="font-medium">0.3%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button
          className="w-full h-14 text-lg font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-2xl"
          disabled={!rwaToken || !stableToken || !rwaAmount || !stableAmount}
        >
          {!rwaToken || !stableToken
            ? "Select tokens"
            : !rwaAmount || !stableAmount
            ? "Enter amounts"
            : "Create Pool"}
        </Button>
      </CardContent>
    </Card>
  );
}
