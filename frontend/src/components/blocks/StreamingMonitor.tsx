"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Download,
} from "lucide-react";

interface StreamingTableMonitorProps {
  name?: string;
  source?: string;
  totalRecords?: number;
  visibleFields?: string;
  lastUpdate?: string;
  updateSpeed?: string;
  currentPage?: number;
  totalPages?: number;
  viewMode?: "card" | "list";
}

export const StreamingTableMonitor: React.FC<StreamingTableMonitorProps> = ({
  name = "Price_Table_Monitor",
  source = "TABLE NAME",
  totalRecords = 100,
  visibleFields = "5/6",
  lastUpdate = "오후 06:27:19",
  updateSpeed = "실시간",
  currentPage = 1,
  totalPages = 10,
  viewMode = "card",
}) => {
  const [mode, setMode] = useState(viewMode);
  const [page, setPage] = useState(currentPage);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <Table className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-foreground">{name}</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">SOURCE: {source}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 p-0.5 bg-secondary rounded">
              <Button
                variant={mode === "card" ? "default" : "ghost"}
                size="icon"
                className={`h-7 w-7 ${
                  mode === "card" ? "bg-foreground/10" : "text-muted-foreground"
                }`}
                onClick={() => setMode("card")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={mode === "list" ? "default" : "ghost"}
                size="icon"
                className={`h-7 w-7 ${
                  mode === "list" ? "bg-foreground/10" : "text-muted-foreground"
                }`}
                onClick={() => setMode("list")}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 bg-secondary text-foreground">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-secondary text-muted-foreground"
              disabled
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-2 bg-secondary/50 rounded">
            <p className="text-xs text-muted-foreground">전체 레코드</p>
            <p className="text-sm font-medium text-foreground">{totalRecords}</p>
          </div>
          <div className="p-2 bg-secondary/50 rounded">
            <p className="text-xs text-muted-foreground">표시 필드</p>
            <p className="text-sm font-medium text-foreground">{visibleFields}</p>
          </div>
          <div className="p-2 bg-secondary/50 rounded">
            <p className="text-xs text-muted-foreground">최근 업데이트</p>
            <p className="text-sm font-medium text-foreground/80">{lastUpdate}</p>
          </div>
          <div className="p-2 bg-secondary/50 rounded">
            <p className="text-xs text-muted-foreground">업데이트 속도</p>
            <p className="text-sm font-medium text-green-500">{updateSpeed}</p>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {(page - 1) * 10 + 1} - {Math.min(page * 10, totalRecords)} / {totalRecords}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              이전
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              다음
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StreamingSearchMonitorProps {
  name?: string;
  source?: string;
  searchPlaceholder?: string;
  currentPage?: number;
  totalPages?: number;
  totalRecords?: number;
  viewMode?: "card" | "list";
}

export const StreamingSearchMonitor: React.FC<StreamingSearchMonitorProps> = ({
  name = "Trade_Search",
  source = "Binance_BTC_Stream",
  searchPlaceholder = "데이터 검색... (모든 필드 대상)",
  currentPage = 1,
  totalPages = 10,
  totalRecords = 100,
  viewMode = "card",
}) => {
  const [mode, setMode] = useState(viewMode);
  const [page, setPage] = useState(currentPage);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-foreground">{name}</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">SOURCE: {source}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 p-0.5 bg-secondary rounded">
              <Button
                variant={mode === "card" ? "default" : "ghost"}
                size="icon"
                className={`h-7 w-7 ${
                  mode === "card" ? "bg-foreground/10" : "text-muted-foreground"
                }`}
                onClick={() => setMode("card")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={mode === "list" ? "default" : "ghost"}
                size="icon"
                className={`h-7 w-7 ${
                  mode === "list" ? "bg-foreground/10" : "text-muted-foreground"
                }`}
                onClick={() => setMode("list")}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 bg-secondary text-foreground">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-secondary text-muted-foreground"
              disabled
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-secondary border-border text-foreground"
          />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {(page - 1) * 10 + 1} - {Math.min(page * 10, totalRecords)} / {totalRecords}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              이전
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              다음
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
