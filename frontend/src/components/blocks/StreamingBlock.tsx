"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, Zap, Clock } from "lucide-react";

interface StreamingBlockProps {
  name?: string;
  fields?: string[];
  updateMode?: "live" | "periodic";
  updateInterval?: number;
  onClose?: () => void;
}

const StreamingBlock: React.FC<StreamingBlockProps> = ({
  name = "Binance_BTC_Stream",
  fields = ["timestamp", "price", "volume"],
  updateMode = "periodic",
  updateInterval = 1000,
  onClose,
}) => {
  const [mode, setMode] = useState(updateMode);
  const [interval, setInterval] = useState(updateInterval);

  return (
    <Card className="relative bg-slate-900 border-slate-700 w-[320px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <CardTitle className="text-sm font-medium text-white">{name}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-500">스트리밍 블록</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-1 p-1 bg-slate-800 rounded-lg">
          <Button
            variant={mode === "live" ? "default" : "ghost"}
            size="sm"
            className={`flex-1 h-8 text-xs ${
              mode === "live"
                ? "bg-blue-600 hover:bg-blue-700"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
            onClick={() => setMode("live")}
          >
            <Zap className="h-3 w-3 mr-1" />
            실시간
          </Button>
          <Button
            variant={mode === "periodic" ? "default" : "ghost"}
            size="sm"
            className={`flex-1 h-8 text-xs ${
              mode === "periodic"
                ? "bg-blue-600 hover:bg-blue-700"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
            onClick={() => setMode("periodic")}
          >
            <Clock className="h-3 w-3 mr-1" />
            주기적
          </Button>
        </div>

        {/* Update Interval */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400">업데이트 주기 (ms)</label>
          <Input
            type="number"
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="h-9 bg-slate-800 border-slate-600 text-white text-sm"
          />
        </div>

        {/* Fields List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">필드 목록</span>
          </div>
          <div className="space-y-1.5 p-3 bg-slate-800/50 rounded-lg">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-300">{field}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 text-center">우클릭으로 필드 블록 생성</p>
        </div>
      </CardContent>

      {/* Connection Points */}
      <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-800 -translate-y-1/2" />
      <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-800 -translate-y-1/2" />
      <div className="absolute -top-1.5 left-1/2 w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-800 -translate-x-1/2" />
      <div className="absolute -bottom-1.5 left-1/2 w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-800 -translate-x-1/2" />
    </Card>
  );
};

export default StreamingBlock;
