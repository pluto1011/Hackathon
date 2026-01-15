"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenSelector, Token } from "@/components/common/TokenSelector";
import { getPool, getQuote, PoolState, QuoteResult } from "@/lib/api";
import { formatUnits, parseUnits } from "viem";

export function SwapCard() {
  const [fromToken, setFromToken] = useState<Token>();
  const [toToken, setToToken] = useState<Token>();
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [poolState, setPoolState] = useState<PoolState | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pool state on mount and periodically
  useEffect(() => {
    const fetchPool = async () => {
      try {
        const data = await getPool();
        setPoolState(data);
      } catch (err) {
        console.error("Failed to fetch pool:", err);
      }
    };

    fetchPool();
    const interval = setInterval(fetchPool, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Fetch quote when fromToken and fromAmount change
  const fetchQuote = useCallback(async () => {
    if (!fromToken || !fromAmount || !toToken) {
      setQuote(null);
      setToAmount("");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const amountInWei = parseUnits(fromAmount, fromToken.decimals || 18).toString();
      const data = await getQuote(fromToken.address, amountInWei);
      setQuote(data);

      // Set toAmount from quote
      const rwaOut = formatUnits(BigInt(data.rwaOutQuote), toToken.decimals || 18);
      setToAmount(rwaOut);
    } catch (err: any) {
      console.error("Failed to fetch quote:", err);
      setError(err.message || "Failed to get quote");
      setQuote(null);
      setToAmount("");
    } finally {
      setLoading(false);
    }
  }, [fromToken, fromAmount, toToken]);

  useEffect(() => {
    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [fetchQuote]);

  const handleSwapDirection = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    setQuote(null);
  };

  // Calculate pool info from poolState
  const poolInfo = poolState
    ? {
        realRWA: Number(formatUnits(BigInt(poolState.real.rwa), 18)),
        effectiveRWA: Number(formatUnits(BigInt(poolState.effective.rwa), 18)),
        realStable: Number(formatUnits(BigInt(poolState.real.stable), 18)),
        effectiveStable: Number(formatUnits(BigInt(poolState.effective.stable), 18)),
        availablePercent:
          Number(poolState.effective.rwa) > 0
            ? (Number(poolState.real.rwa) / Number(poolState.effective.rwa)) * 100
            : 0,
        feeBps: Number(poolState.feeBps),
        price:
          Number(poolState.effective.stable) > 0 && Number(poolState.effective.rwa) > 0
            ? Number(poolState.effective.stable) / Number(poolState.effective.rwa)
            : 0,
      }
    : null;

  const getButtonText = () => {
    if (!fromToken || !toToken) return "Select a token";
    if (!fromAmount) return "Enter an amount";
    if (loading) return "Getting quote...";
    if (error) return "Quote unavailable";
    if (quote?.willReserve) return "Swap (Will Reserve Overflow)";
    return "Swap";
  };

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <div className="bg-card rounded-2xl p-3">
        <div className="bg-secondary rounded-xl p-4 mb-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Sell</span>
            <span className="text-xs text-muted-foreground">Balance: 0.00</span>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1 text-2xl font-medium bg-transparent border-0 p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/40"
            />
            <TokenSelector
              selectedToken={fromToken}
              onSelect={setFromToken}
              label="Select"
            />
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            $0.00
          </div>
        </div>

        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={handleSwapDirection}
            className="h-8 w-8 rounded-lg bg-card border-4 border-background flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>

        <div className="bg-secondary rounded-xl p-4 mt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Buy</span>
            <span className="text-xs text-muted-foreground">Balance: 0.00</span>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="0"
              value={toAmount}
              readOnly
              className="flex-1 text-2xl font-medium bg-transparent border-0 p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/40"
            />
            <TokenSelector
              selectedToken={toToken}
              onSelect={setToToken}
              label="Select"
            />
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            $0.00
          </div>
        </div>

        {/* Pool Liquidity Info */}
        {toToken?.isRWA && poolInfo && (
          <div className="mt-3 p-3 rounded-xl bg-secondary/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Pool Liquidity (Real/Effective)</span>
              <span className="text-xs text-foreground">
                {poolInfo.realRWA.toLocaleString(undefined, { maximumFractionDigits: 2 })} / {poolInfo.effectiveRWA.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="h-1 bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground/80 rounded-full transition-all"
                style={{ width: `${Math.min(poolInfo.availablePercent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">Price (RWA/Stable)</span>
              <span className="text-xs text-foreground">
                {poolInfo.price.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">Fee</span>
              <span className="text-xs text-foreground">{poolInfo.feeBps / 100}%</span>
            </div>
          </div>
        )}

        {/* Reservation Warning */}
        {quote?.willReserve && (
          <div className="mt-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-xs text-yellow-500">
                Exceeds available liquidity. Overflow will be reserved.
              </span>
            </div>
            {quote && (
              <div className="mt-2 text-xs text-muted-foreground">
                <div>Available: {formatUnits(BigInt(quote.rwaOutCap), 18)} RWA</div>
                <div>Reserved: {formatUnits(BigInt(quote.stableAmount), 18)} Stable</div>
              </div>
            )}
          </div>
        )}

        <Button
          className="w-full h-12 mt-3 text-base font-medium bg-foreground text-background hover:bg-foreground/90 rounded-xl"
          disabled={!fromToken || !toToken || !fromAmount || loading || !!error}
        >
          {getButtonText()}
        </Button>
      </div>

      {fromToken && toToken && fromAmount && quote && !error && (
        <div className="mt-2 px-3 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>You receive</span>
            <span className="text-foreground">
              {formatUnits(BigInt(quote.rwaOutQuote), 18)} {toToken.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Rate</span>
            <span className="text-foreground">
              1 {fromToken.symbol} ≈ {(Number(quote.rwaOutQuote) / Number(parseUnits(fromAmount, 18))).toFixed(6)} {toToken.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Fee</span>
            <span className="text-foreground">{poolInfo ? poolInfo.feeBps / 100 : 0}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
