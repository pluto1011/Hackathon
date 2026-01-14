"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, Search, X, GripVertical, Eye } from "lucide-react";

interface MonitoringBlockProps {
  name?: string;
  type?: "table" | "search";
  connectedStream?: string;
  fields?: string[];
  onRemoveStream?: () => void;
}

const MonitoringBlock: React.FC<MonitoringBlockProps> = ({
  name = "Price_Table_Monitor",
  type = "table",
  connectedStream = "Binance_BTC_Stream",
  fields = ["timestamp", "price", "volume", "change"],
  onRemoveStream,
}) => {
  const [fieldOrder, setFieldOrder] = useState(fields);

  return (
    <Card className="relative bg-slate-900 border-slate-700 w-[320px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <CardTitle className="text-sm font-medium text-white">{name}</CardTitle>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          {type === "table" ? "📊 테이블 모니터링" : "🔍 검색 모니터링"}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connected Stream */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400">연결된 스트림</span>
          {connectedStream && (
            <div className="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-slate-300">{connectedStream}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={onRemoveStream}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Field Order */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">필드 순서</span>
            <Eye className="h-3 w-3 text-slate-500" />
          </div>
          <div className="space-y-1 p-3 bg-slate-800/50 rounded-lg">
            {fieldOrder.map((field, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-1.5 bg-slate-800 rounded cursor-move hover:bg-slate-700 transition-colors"
                draggable
              >
                <GripVertical className="h-3 w-3 text-slate-500" />
                <span className="text-xs text-slate-300 flex-1">{field}</span>
                <span className="text-xs text-slate-500 w-4 text-center">{index + 1}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 text-center">드래그하여 순서 변경</p>
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

export default MonitoringBlock;
