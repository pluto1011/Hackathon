"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface VolumeChartProps {
  tokenSymbol?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { date: string; volume: number };
  }>;
  label?: string;
  formatVolume: (value: number) => string;
}

function CustomTooltip({ active, payload, label, formatVolume }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#191919] border border-[#222222] rounded-lg px-3 py-2 text-xs">
        <div className="text-muted-foreground mb-1">{label}</div>
        <div className="text-foreground font-medium">{formatVolume(payload[0].value)}</div>
      </div>
    );
  }
  return null;
}

const generateMockVolumeData = () => {
  const data = [];
  const now = Date.now();

  for (let i = 14; i >= 0; i--) {
    const volume = Math.random() * 500000 + 100000;
    data.push({
      date: new Date(now - i * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      volume: parseFloat(volume.toFixed(0)),
    });
  }
  return data;
};

const timeframes = ["7D", "14D", "30D"];

export function VolumeChart({ tokenSymbol = "rTSLA" }: VolumeChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState("14D");
  const data = generateMockVolumeData();

  const totalVolume = data.reduce((sum, d) => sum + d.volume, 0);
  const avgVolume = totalVolume / data.length;

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="bg-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-muted-foreground">Trading Volume</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{formatVolume(totalVolume)}</span>
            <span className="text-sm text-muted-foreground">
              ({activeTimeframe})
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                activeTimeframe === tf
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8b8b8b", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8b8b8b", fontSize: 10 }}
              width={50}
              tickFormatter={formatVolume}
            />
            <Tooltip
              content={<CustomTooltip formatVolume={formatVolume} />}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar
              dataKey="volume"
              fill="#f5f5f5"
              radius={[2, 2, 0, 0]}
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex gap-6 text-sm">
        <div>
          <div className="text-muted-foreground mb-0.5">Avg. Daily</div>
          <div className="font-medium">{formatVolume(avgVolume)}</div>
        </div>
        <div>
          <div className="text-muted-foreground mb-0.5">Total Trades</div>
          <div className="font-medium">{(Math.random() * 1000 + 500).toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
}
