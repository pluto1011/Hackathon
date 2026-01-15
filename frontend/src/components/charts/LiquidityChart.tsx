"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface LiquidityChartProps {
  realReserve?: number;
  virtualReserve?: number;
  tokenSymbol?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { name: string; value: number };
  }>;
  tokenSymbol: string;
}

function CustomTooltip({ active, payload, tokenSymbol }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#191919] border border-[#222222] rounded-lg px-3 py-2 text-xs">
        <div className="text-muted-foreground mb-1">{payload[0].payload.name}</div>
        <div className="text-foreground font-medium">
          {payload[0].value.toLocaleString()} {tokenSymbol}
        </div>
      </div>
    );
  }
  return null;
}

export function LiquidityChart({
  realReserve = 1250,
  virtualReserve = 3750,
  tokenSymbol = "rTSLA",
}: LiquidityChartProps) {
  const total = realReserve + virtualReserve;
  const realPercent = ((realReserve / total) * 100).toFixed(1);
  const virtualPercent = ((virtualReserve / total) * 100).toFixed(1);

  const data = [
    { name: "Real Reserve", value: realReserve },
    { name: "Virtual Reserve", value: virtualReserve },
  ];

  const COLORS = ["#f5f5f5", "#333333"];

  return (
    <div className="bg-card rounded-xl p-4">
      <div className="text-sm text-muted-foreground mb-4">Pool Liquidity</div>

      <div className="flex items-center gap-6">
        <div className="h-[140px] w-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
                label={false}
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip tokenSymbol={tokenSymbol} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2.5 w-2.5 rounded-sm bg-foreground" />
              <span className="text-sm">Real Reserve</span>
            </div>
            <div className="text-lg font-medium">
              {realReserve.toLocaleString()} {tokenSymbol}
            </div>
            <div className="text-xs text-muted-foreground">{realPercent}% of total</div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#333333]" />
              <span className="text-sm">Virtual Reserve</span>
            </div>
            <div className="text-lg font-medium">
              {virtualReserve.toLocaleString()} {tokenSymbol}
            </div>
            <div className="text-xs text-muted-foreground">{virtualPercent}% of total</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Effective Reserve</span>
          <span className="font-medium">{total.toLocaleString()} {tokenSymbol}</span>
        </div>
      </div>
    </div>
  );
}
