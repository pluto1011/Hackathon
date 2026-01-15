"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Activity,
  Database,
  Percent,
  Link2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Blocks,
  Radio,
  BarChart3,
  Zap,
} from "lucide-react";
import {
  StreamingBlock,
  MonitoringBlock,
  ActionBlock,
  StreamingTableMonitor,
  StreamingSearchMonitor,
} from "@/components/blocks";
import {
  getPool,
  getConfig,
  getHealth,
  setVirtualReserves,
  setFee,
  setAdapter,
  PoolState,
  ConfigResult,
} from "@/lib/api";
import { formatUnits, parseUnits } from "viem";

export default function BackendPage() {
  // State for pool and config
  const [poolState, setPoolState] = useState<PoolState | null>(null);
  const [config, setConfig] = useState<ConfigResult | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // Admin form states
  const [vReservesForm, setVReservesForm] = useState({ vRwa: "", vStable: "" });
  const [feeForm, setFeeForm] = useState({ feeBps: "" });
  const [adapterForm, setAdapterForm] = useState({ baseToken: "", adapter: "", supported: true });

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Blocks demo state
  const [activeBlockView, setActiveBlockView] = useState<"table" | "search">("table");

  // Fetch data
  const fetchData = async () => {
    try {
      const [poolData, configData, healthData] = await Promise.all([
        getPool(),
        getConfig(),
        getHealth(),
      ]);
      setPoolState(poolData);
      setConfig(configData);
      setIsHealthy(healthData.ok);
      setLastUpdate(new Date().toLocaleTimeString("ko-KR"));
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setIsHealthy(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Format helper
  const formatAmount = (value: string, decimals = 18) => {
    try {
      return Number(formatUnits(BigInt(value), decimals)).toLocaleString(undefined, {
        maximumFractionDigits: 4,
      });
    } catch {
      return "0";
    }
  };

  // Admin actions
  const handleSetVirtualReserves = async () => {
    setActionLoading("vReserves");
    setActionResult(null);
    try {
      const vRwa = parseUnits(vReservesForm.vRwa || "0", 18).toString();
      const vStable = parseUnits(vReservesForm.vStable || "0", 18).toString();
      const result = await setVirtualReserves(vRwa, vStable);
      setActionResult({ type: "success", message: `Tx: ${result.txHash.slice(0, 10)}...` });
      fetchData();
    } catch (err: any) {
      setActionResult({ type: "error", message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetFee = async () => {
    setActionLoading("fee");
    setActionResult(null);
    try {
      const result = await setFee(Number(feeForm.feeBps));
      setActionResult({ type: "success", message: `Tx: ${result.txHash.slice(0, 10)}...` });
      fetchData();
    } catch (err: any) {
      setActionResult({ type: "error", message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetAdapter = async () => {
    setActionLoading("adapter");
    setActionResult(null);
    try {
      const result = await setAdapter(adapterForm.baseToken, adapterForm.adapter, adapterForm.supported);
      setActionResult({ type: "success", message: `Tx: ${result.txHash.slice(0, 10)}...` });
      fetchData();
    } catch (err: any) {
      setActionResult({ type: "error", message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold mb-1">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                RWA Liquidity Hub - Pool Management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                {isHealthy === null ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : isHealthy ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-muted-foreground">
                  {isHealthy ? "Connected" : "Disconnected"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <Tabs defaultValue="monitor" className="w-full">
            <TabsList className="mb-6 bg-transparent p-0 h-auto gap-4">
              <TabsTrigger
                value="monitor"
                className="px-0 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-foreground flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Monitor
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="px-0 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-foreground flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Admin Actions
              </TabsTrigger>
              <TabsTrigger
                value="blocks"
                className="px-0 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-foreground flex items-center gap-2"
              >
                <Blocks className="h-4 w-4" />
                Blocks Demo
              </TabsTrigger>
            </TabsList>

            {/* Monitor Tab */}
            <TabsContent value="monitor" className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground mb-1">Real RWA</div>
                    <div className="text-xl font-bold">
                      {loading ? "..." : formatAmount(poolState?.real.rwa || "0")}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground mb-1">Real Stable</div>
                    <div className="text-xl font-bold">
                      {loading ? "..." : formatAmount(poolState?.real.stable || "0")}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground mb-1">Virtual RWA</div>
                    <div className="text-xl font-bold">
                      {loading ? "..." : formatAmount(poolState?.virtual.rwa || "0")}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground mb-1">Fee</div>
                    <div className="text-xl font-bold">
                      {loading ? "..." : `${Number(poolState?.feeBps || 0) / 100}%`}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Pool State */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Pool State Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Real Reserves</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-secondary rounded">
                          <span>RWA:</span>
                          <span className="font-mono">{formatAmount(poolState?.real.rwa || "0")}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-secondary rounded">
                          <span>Stable:</span>
                          <span className="font-mono">{formatAmount(poolState?.real.stable || "0")}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Virtual Reserves</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-secondary rounded">
                          <span>RWA:</span>
                          <span className="font-mono">{formatAmount(poolState?.virtual.rwa || "0")}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-secondary rounded">
                          <span>Stable:</span>
                          <span className="font-mono">{formatAmount(poolState?.virtual.stable || "0")}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Effective Reserves</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-secondary rounded">
                          <span>RWA:</span>
                          <span className="font-mono">{formatAmount(poolState?.effective.rwa || "0")}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-secondary rounded">
                          <span>Stable:</span>
                          <span className="font-mono">{formatAmount(poolState?.effective.stable || "0")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                    Last updated: {lastUpdate || "..."}
                  </div>
                </CardContent>
              </Card>

              {/* Config Info */}
              {config && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      Contract Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 bg-secondary rounded">
                          <span className="text-muted-foreground">Chain ID:</span>
                          <span className="font-mono">{config.chainId}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-secondary rounded">
                          <span className="text-muted-foreground">Core:</span>
                          <span className="font-mono text-xs">{config.core.slice(0, 10)}...{config.core.slice(-8)}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-secondary rounded">
                          <span className="text-muted-foreground">Router:</span>
                          <span className="font-mono text-xs">{config.router.slice(0, 10)}...{config.router.slice(-8)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 bg-secondary rounded">
                          <span className="text-muted-foreground">Reservations:</span>
                          <span className="font-mono text-xs">{config.reservations.slice(0, 10)}...{config.reservations.slice(-8)}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-secondary rounded">
                          <span className="text-muted-foreground">Stable Token:</span>
                          <span className="font-mono text-xs">{config.tokens.stable.slice(0, 10)}...{config.tokens.stable.slice(-8)}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-secondary rounded">
                          <span className="text-muted-foreground">RWA Token:</span>
                          <span className="font-mono text-xs">{config.tokens.rwa.slice(0, 10)}...{config.tokens.rwa.slice(-8)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Admin Actions Tab */}
            <TabsContent value="admin" className="space-y-6">
              {/* Action Result Toast */}
              {actionResult && (
                <div
                  className={`p-4 rounded-lg flex items-center gap-2 ${
                    actionResult.type === "success"
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-red-500/10 text-red-500 border border-red-500/20"
                  }`}
                >
                  {actionResult.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm">{actionResult.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Set Virtual Reserves */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-500" />
                      Set Virtual Reserves
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vRwa">Virtual RWA Amount</Label>
                      <Input
                        id="vRwa"
                        placeholder="e.g., 1000"
                        value={vReservesForm.vRwa}
                        onChange={(e) => setVReservesForm({ ...vReservesForm, vRwa: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vStable">Virtual Stable Amount</Label>
                      <Input
                        id="vStable"
                        placeholder="e.g., 100000"
                        value={vReservesForm.vStable}
                        onChange={(e) => setVReservesForm({ ...vReservesForm, vStable: e.target.value })}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleSetVirtualReserves}
                      disabled={actionLoading === "vReserves"}
                    >
                      {actionLoading === "vReserves" ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Update Virtual Reserves
                    </Button>
                  </CardContent>
                </Card>

                {/* Set Fee */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Percent className="h-4 w-4 text-green-500" />
                      Set Fee
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="feeBps">Fee (basis points)</Label>
                      <Input
                        id="feeBps"
                        placeholder="e.g., 30 (= 0.3%)"
                        value={feeForm.feeBps}
                        onChange={(e) => setFeeForm({ feeBps: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Current: {Number(poolState?.feeBps || 0)} bps ({Number(poolState?.feeBps || 0) / 100}%)
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleSetFee}
                      disabled={actionLoading === "fee"}
                    >
                      {actionLoading === "fee" ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Update Fee
                    </Button>
                  </CardContent>
                </Card>

                {/* Set Adapter */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-orange-500" />
                      Manage Adapter
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="baseToken">Base Token Address</Label>
                      <Input
                        id="baseToken"
                        placeholder="0x..."
                        value={adapterForm.baseToken}
                        onChange={(e) => setAdapterForm({ ...adapterForm, baseToken: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adapter">Adapter Address</Label>
                      <Input
                        id="adapter"
                        placeholder="0x..."
                        value={adapterForm.adapter}
                        onChange={(e) => setAdapterForm({ ...adapterForm, adapter: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Label>Status:</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={adapterForm.supported ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAdapterForm({ ...adapterForm, supported: true })}
                        >
                          Supported
                        </Button>
                        <Button
                          variant={!adapterForm.supported ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAdapterForm({ ...adapterForm, supported: false })}
                        >
                          Unsupported
                        </Button>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleSetAdapter}
                      disabled={actionLoading === "adapter"}
                    >
                      {actionLoading === "adapter" ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Update Adapter
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Blocks Demo Tab */}
            <TabsContent value="blocks" className="space-y-8">
              {/* Live Monitor Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Live Monitor Preview</h3>
                  <div className="flex gap-2">
                    <Button
                      variant={activeBlockView === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveBlockView("table")}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Table
                    </Button>
                    <Button
                      variant={activeBlockView === "search" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveBlockView("search")}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
                {activeBlockView === "table" && (
                  <StreamingTableMonitor
                    name="Pool_State_Monitor"
                    source="RWA_Pool_Stream"
                    totalRecords={100}
                    visibleFields="4/6"
                    lastUpdate={lastUpdate || "..."}
                    updateSpeed="5s"
                    currentPage={1}
                    totalPages={10}
                    viewMode="card"
                  />
                )}
                {activeBlockView === "search" && (
                  <StreamingSearchMonitor
                    name="Reservation_Search"
                    source="RWA_Pool_Stream"
                    searchPlaceholder="Search reservations by address..."
                    currentPage={1}
                    totalPages={10}
                    totalRecords={100}
                    viewMode="card"
                  />
                )}
              </div>

              {/* Block Components */}
              <div className="space-y-6 pt-4 border-t border-border">
                {/* Streaming Blocks */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Radio className="h-4 w-4 text-green-500" />
                    <h3 className="text-sm font-medium">Streaming Blocks</h3>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <StreamingBlock
                      name="RWA_Pool_Stream"
                      fields={["realRWA", "realStable", "virtualRWA", "virtualStable"]}
                      updateMode="periodic"
                      updateInterval={5000}
                    />
                    <StreamingBlock
                      name="Price_Feed"
                      fields={["price", "timestamp", "feeBps"]}
                      updateMode="live"
                    />
                  </div>
                </section>

                {/* Monitoring Blocks */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-4 w-4 text-purple-500" />
                    <h3 className="text-sm font-medium">Monitoring Blocks</h3>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <MonitoringBlock
                      name="Pool_State_Monitor"
                      type="table"
                      connectedStream="RWA_Pool_Stream"
                      fields={["realRWA", "realStable", "effectiveRWA", "effectiveStable"]}
                    />
                    <MonitoringBlock
                      name="Reservation_Search"
                      type="search"
                      connectedStream="RWA_Pool_Stream"
                      fields={["user", "reservedStable", "timestamp"]}
                    />
                  </div>
                </section>

                {/* Action Blocks */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <h3 className="text-sm font-medium">Action Blocks</h3>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <ActionBlock
                      name="Swap_RWA"
                      actionType="dex"
                      web3Function="swapToRwaExactIn"
                      parameters={[
                        { name: "tokenIn", value: "", placeholder: "Token address" },
                        { name: "amountIn", value: "", placeholder: "Amount" },
                        { name: "minRwaOut", value: "", placeholder: "Min output" },
                      ]}
                    />
                    <ActionBlock
                      name="Add_Liquidity"
                      actionType="dex"
                      web3Function="addLiquidity"
                      parameters={[
                        { name: "rwaAmount", value: "", placeholder: "RWA amount" },
                        { name: "stableAmount", value: "", placeholder: "Stable amount" },
                      ]}
                    />
                  </div>
                </section>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
