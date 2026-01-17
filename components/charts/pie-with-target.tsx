"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency, formatPercent } from "@/lib/calculations";

interface DataItem {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface TargetItem {
  name: string;
  target_percent: number;
}

interface PieWithTargetProps {
  data: DataItem[];
  targets?: TargetItem[];
  colors: string[];
}

const TARGET_RING_OPACITY = 0.35;

export function PieWithTarget({ data, targets, colors }: PieWithTargetProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Sort data alphabetically by name for consistent ordering
  const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));

  // Create target ring data matching the sorted data order
  const targetData = targets
    ? sortedData.map((d) => {
        const target = targets.find((t) => t.name === d.name);
        return {
          name: d.name,
          value: target?.target_percent || 0,
          isTarget: true,
        };
      })
    : [];

  // Create current allocation percentages for comparison
  const currentPercentages = sortedData.map((d) => ({
    name: d.name,
    percent: total > 0 ? (d.value / total) * 100 : 0,
  }));

  // Create color map based on sorted order
  const colorMap: Record<string, string> = {};
  sortedData.forEach((d, index) => {
    colorMap[d.name] = colors[index % colors.length];
  });

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      payload: { isTarget?: boolean; name: string };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const isTarget = item.payload?.isTarget;
      const name = item.payload?.name || item.name;
      const current = currentPercentages.find((c) => c.name === name);
      const target = targets?.find((t) => t.name === name);

      return (
        <div className="glass glass-border rounded-lg px-3 py-2 min-w-[140px]">
          <p className="text-sm font-medium mb-1">{name}</p>
          {isTarget ? (
            <p className="text-sm text-muted-foreground">
              Objectif: <span className="text-gold font-mono">{item.value}%</span>
            </p>
          ) : (
            <>
              <p className="text-sm text-gold font-mono">
                {formatCurrency(item.value)}
              </p>
              {current && (
                <p className="text-xs text-muted-foreground mt-1">
                  Actuel: <span className="font-mono">{formatPercent(current.percent)}</span>
                </p>
              )}
              {target && (
                <p className="text-xs text-muted-foreground">
                  Objectif: <span className="font-mono">{target.target_percent}%</span>
                </p>
              )}
              {current && target && (
                <p
                  className={`text-xs font-mono mt-1 ${
                    current.percent >= target.target_percent
                      ? "text-emerald"
                      : "text-rose"
                  }`}
                >
                  {current.percent >= target.target_percent ? "+" : ""}
                  {formatPercent(current.percent - target.target_percent)} vs objectif
                </p>
              )}
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        {/* Outer ring: Target allocation */}
        {targetData.length > 0 && (
          <Pie
            data={targetData}
            cx="50%"
            cy="50%"
            innerRadius={92}
            outerRadius={102}
            paddingAngle={2}
            dataKey="value"
            stroke="oklch(0.13 0.005 260)"
            strokeWidth={1}
            strokeDasharray="3 2"
            legendType="none"
          >
            {targetData.map((entry, index) => (
              <Cell
                key={`target-${index}`}
                fill={colorMap[entry.name] || colors[index % colors.length]}
                fillOpacity={TARGET_RING_OPACITY}
              />
            ))}
          </Pie>
        )}

        {/* Inner pie: Current allocation */}
        <Pie
          data={sortedData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={88}
          paddingAngle={3}
          dataKey="value"
          stroke="oklch(0.13 0.005 260)"
          strokeWidth={2}
        >
          {sortedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colorMap[entry.name] || colors[index % colors.length]}
            />
          ))}
        </Pie>

        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
