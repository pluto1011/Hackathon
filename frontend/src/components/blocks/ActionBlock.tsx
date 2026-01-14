"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, ArrowLeftRight, Settings2 } from "lucide-react";

interface Parameter {
  name: string;
  value: string;
  placeholder: string;
}

interface ActionBlockProps {
  name?: string;
  actionType?: "dex" | "cex";
  web3Function?: string;
  exchange?: string;
  parameters?: Parameter[];
}

const ActionBlock: React.FC<ActionBlockProps> = ({
  name = "Long_ETH",
  actionType = "dex",
  web3Function = "swap",
  exchange = "Binance",
  parameters = [
    { name: "param1", value: "", placeholder: "값 또는 블록 연결" },
    { name: "param2", value: "", placeholder: "값 또는 블록 연결" },
  ],
}) => {
  const [type, setType] = useState(actionType);
  const [func, setFunc] = useState(web3Function);
  const [selectedExchange, setSelectedExchange] = useState(exchange);
  const [params, setParams] = useState(parameters);

  const updateParam = (index: number, value: string) => {
    const newParams = [...params];
    newParams[index].value = value;
    setParams(newParams);
  };

  return (
    <Card className="relative bg-card border-border w-[320px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <CardTitle className="text-sm font-medium text-foreground">{name}</CardTitle>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">액션 블록</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Type Toggle */}
        <div className="flex gap-1 p-1 bg-secondary rounded-lg">
          <Button
            variant={type === "cex" ? "default" : "ghost"}
            size="sm"
            className={`flex-1 h-8 text-xs ${
              type === "cex"
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
            onClick={() => setType("cex")}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            CEX
          </Button>
          <Button
            variant={type === "dex" ? "default" : "ghost"}
            size="sm"
            className={`flex-1 h-8 text-xs ${
              type === "dex"
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
            onClick={() => setType("dex")}
          >
            <ArrowLeftRight className="h-3 w-3 mr-1" />
            DEX
          </Button>
        </div>

        {/* CEX Exchange Select */}
        {type === "cex" && (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">거래소</label>
            <Select value={selectedExchange} onValueChange={setSelectedExchange}>
              <SelectTrigger className="h-9 bg-secondary border-border text-foreground text-sm">
                <SelectValue placeholder="거래소 선택" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="Binance">Binance</SelectItem>
                <SelectItem value="Coinbase">Coinbase</SelectItem>
                <SelectItem value="Kraken">Kraken</SelectItem>
                <SelectItem value="Upbit">Upbit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* DEX Function Input */}
        {type === "dex" && (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Web3 함수</label>
            <Input
              type="text"
              value={func}
              onChange={(e) => setFunc(e.target.value)}
              placeholder="swap"
              className="h-9 bg-secondary border-border text-foreground text-sm"
            />
          </div>
        )}

        {/* Parameters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">파라미터</span>
          </div>
          <div className="space-y-2 p-3 bg-secondary/50 rounded-lg">
            {params.map((param, index) => (
              <div key={index} className="space-y-1">
                <label className="text-xs text-muted-foreground">{param.name}</label>
                <Input
                  type="text"
                  value={param.value}
                  onChange={(e) => updateParam(index, e.target.value)}
                  placeholder={param.placeholder}
                  className="h-8 bg-secondary border-border text-foreground text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Connection Points */}
      <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-secondary rounded-full border-2 border-card -translate-y-1/2" />
      <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-secondary rounded-full border-2 border-card -translate-y-1/2" />
      <div className="absolute -top-1.5 left-1/2 w-3 h-3 bg-secondary rounded-full border-2 border-card -translate-x-1/2" />
      <div className="absolute -bottom-1.5 left-1/2 w-3 h-3 bg-secondary rounded-full border-2 border-card -translate-x-1/2" />
    </Card>
  );
};

export default ActionBlock;
