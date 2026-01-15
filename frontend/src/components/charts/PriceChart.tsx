"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface PriceChartProps {
  tokenSymbol?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { time: string; price: number };
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#191919] border border-[#222222] rounded-lg px-3 py-2 text-xs">
        <div className="text-muted-foreground mb-1">{label}</div>
        <div className="text-foreground font-medium">${payload[0].value.toFixed(2)}</div>
      </div>
    );
  }
  return null;
}

const generateMockPriceData = () => {
  const data = [];
  let price = 245;
  const now = Date.now();

  for (let i = 30; i >= 0; i--) {
    const change = (Math.random() - 0.48) * 8;
    price = Math.max(200, Math.min(300, price + change));
    data.push({
      time: new Date(now - i * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: parseFloat(price.toFixed(2)),
    });
  }
  return data;
};

const timeframes = ["24H", "7D", "30D", "ALL"];

export function PriceChart({ tokenSymbol = "rTSLA" }: PriceChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState("30D");
  const data = generateMockPriceData();

  const currentPrice = data[data.length - 1]?.price || 0;
  const startPrice = data[0]?.price || 0;
  const priceChange = ((currentPrice - startPrice) / startPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="bg-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-muted-foreground">{tokenSymbol} Price</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">${currentPrice.toFixed(2)}</span>
            <span className={`text-sm ${isPositive ? "text-foreground" : "text-muted-foreground"}`}>
              {isPositive ? "+" : ""}{priceChange.toFixed(2)}%
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

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8b8b8b", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["dataMin - 10", "dataMax + 10"]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8b8b8b", fontSize: 10 }}
              width={45}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={startPrice} stroke="#333333" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#f5f5f5"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: "#f5f5f5" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
