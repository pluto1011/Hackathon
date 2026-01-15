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
    <Card className="relative bg-card border-border w-[320px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <CardTitle className="text-sm font-medium text-foreground">{name}</CardTitle>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {type === "table" ? "테이블 모니터링" : "검색 모니터링"}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connected Stream */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">연결된 스트림</span>
          {connectedStream && (
            <div className="flex items-center justify-between p-2 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-foreground/80">{connectedStream}</span>
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
            <span className="text-xs text-muted-foreground">필드 순서</span>
            <Eye className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="space-y-1 p-3 bg-secondary/50 rounded-lg">
            {fieldOrder.map((field, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-1.5 bg-secondary rounded cursor-move hover:bg-secondary/80 transition-colors"
                draggable
              >
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-foreground/80 flex-1">{field}</span>
                <span className="text-xs text-muted-foreground w-4 text-center">{index + 1}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">드래그하여 순서 변경</p>
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

export default MonitoringBlock;
