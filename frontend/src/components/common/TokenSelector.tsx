"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl?: string;
  isRWA?: boolean;
}

const defaultTokens: Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x...",
    decimals: 6,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x...",
    decimals: 6,
  },
  {
    symbol: "MNT",
    name: "Mantle",
    address: "0x...",
    decimals: 18,
  },
  {
    symbol: "rTSLA",
    name: "RWA Tesla",
    address: "0x...",
    decimals: 18,
    isRWA: true,
  },
  {
    symbol: "rGOLD",
    name: "RWA Gold",
    address: "0x...",
    decimals: 18,
    isRWA: true,
  },
  {
    symbol: "rREIT",
    name: "RWA Real Estate",
    address: "0x...",
    decimals: 18,
    isRWA: true,
  },
];

interface TokenSelectorProps {
  selectedToken?: Token;
  onSelect: (token: Token) => void;
  label?: string;
}

export function TokenSelector({ selectedToken, onSelect, label }: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTokens = defaultTokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="h-10 gap-2 rounded-xl font-medium hover:bg-secondary/80"
        >
          {selectedToken ? (
            <>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                selectedToken.isRWA ? 'bg-primary/20 text-primary' : 'bg-muted'
              }`}>
                {selectedToken.symbol.slice(0, 2)}
              </div>
              <span>{selectedToken.symbol}</span>
              {selectedToken.isRWA && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">RWA</span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">{label || "Select token"}</span>
          )}
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search by name or address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-secondary border-0"
          />
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {filteredTokens.map((token) => (
              <button
                key={token.address + token.symbol}
                onClick={() => {
                  onSelect(token);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  token.isRWA ? 'bg-primary/20 text-primary' : 'bg-muted'
                }`}>
                  {token.symbol.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{token.symbol}</span>
                    {token.isRWA && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">RWA</span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{token.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
