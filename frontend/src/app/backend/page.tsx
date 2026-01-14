"use client";

import React, { useState } from "react";
import {
  StreamingBlock,
  MonitoringBlock,
  ActionBlock,
  StreamingTableMonitor,
  StreamingSearchMonitor,
} from "@/components/blocks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BackendPage() {
  const [activeView, setActiveView] = useState<"table" | "search">("table");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Backend Dashboard</h1>
      </div>

      <Tabs defaultValue="blocks" className="w-full">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="blocks" className="data-[state=active]:bg-slate-700">
            블록 관리
          </TabsTrigger>
          <TabsTrigger value="monitor" className="data-[state=active]:bg-slate-700">
            모니터 뷰
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="space-y-8 mt-6">
          {/* Streaming Blocks Section */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Streaming Blocks</h2>
            <div className="flex flex-wrap gap-6">
              <StreamingBlock
                name="Binance_BTC_Stream"
                fields={["timestamp", "price", "volume", "change"]}
                updateMode="periodic"
                updateInterval={1000}
              />
              <StreamingBlock
                name="Ethereum_Price_Feed"
                fields={["price", "timestamp", "marketCap"]}
                updateMode="live"
              />
            </div>
          </section>

          {/* Monitoring Blocks Section */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Monitoring Blocks</h2>
            <div className="flex flex-wrap gap-6">
              <MonitoringBlock
                name="Price_Table_Monitor"
                type="table"
                connectedStream="Binance_BTC_Stream"
                fields={["timestamp", "price", "volume", "change"]}
              />
              <MonitoringBlock
                name="Trade_Search"
                type="search"
                connectedStream="Binance_BTC_Stream"
                fields={["id", "timestamp", "price", "volume"]}
              />
            </div>
          </section>

          {/* Action Blocks Section */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Action Blocks</h2>
            <div className="flex flex-wrap gap-6">
              <ActionBlock
                name="Long_ETH"
                actionType="dex"
                web3Function="swap"
                parameters={[
                  { name: "tokenIn", value: "", placeholder: "값 또는 블록 연결" },
                  { name: "tokenOut", value: "", placeholder: "값 또는 블록 연결" },
                  { name: "amount", value: "", placeholder: "값 또는 블록 연결" },
                ]}
              />
              <ActionBlock
                name="Quick_Buy_BTC"
                actionType="cex"
                exchange="Binance"
                parameters={[
                  { name: "symbol", value: "", placeholder: "값 또는 블록 연결" },
                  { name: "amount", value: "", placeholder: "값 또는 블록 연결" },
                ]}
              />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6 mt-6">
          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
              onClick={() => setActiveView("table")}
            >
              Table Monitor
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === "search"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
              onClick={() => setActiveView("search")}
            >
              Search Monitor
            </button>
          </div>

          {/* Monitor Display */}
          <div className="max-w-2xl">
            {activeView === "table" && (
              <StreamingTableMonitor
                name="Price_Table_Monitor"
                source="TABLE NAME"
                totalRecords={100}
                visibleFields="5/6"
                lastUpdate="오후 06:27:19"
                updateSpeed="실시간"
                currentPage={1}
                totalPages={10}
                viewMode="card"
              />
            )}
            {activeView === "search" && (
              <StreamingSearchMonitor
                name="Trade_Search"
                source="Binance_BTC_Stream"
                searchPlaceholder="데이터 검색... (모든 필드 대상)"
                currentPage={1}
                totalPages={10}
                totalRecords={100}
                viewMode="card"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
