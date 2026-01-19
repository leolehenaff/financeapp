"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Snapshot, SnapshotData } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { History, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

type TimeRange = "3m" | "6m" | "1y" | "all";

const COLORS = {
  Stock: "oklch(0.78 0.14 75)",
  Crypto: "oklch(0.70 0.18 155)",
  "Start-up": "oklch(0.72 0.18 320)",
  Livret: "oklch(0.68 0.16 250)",
  "Active Cash": "oklch(0.75 0.15 35)",
};

export default function HistoryPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("6m");

  useEffect(() => {
    recomputeAndFetchSnapshots();
  }, []);

  const recomputeAndFetchSnapshots = async () => {
    try {
      // First, recompute today's snapshot
      await fetch("/api/snapshots", {
        method: "POST",
      });

      // Then fetch all snapshots including the updated one
      const res = await fetch("/api/snapshots?limit=500");
      const data = await res.json();
      setSnapshots(data);
    } catch (error) {
      console.error("Error fetching snapshots:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSnapshots = () => {
    const now = new Date();
    let cutoffDate: Date;

    switch (timeRange) {
      case "3m":
        cutoffDate = subMonths(now, 3);
        break;
      case "6m":
        cutoffDate = subMonths(now, 6);
        break;
      case "1y":
        cutoffDate = subMonths(now, 12);
        break;
      default:
        cutoffDate = new Date(0);
    }

    return snapshots
      .filter((s) => new Date(s.snapshot_date) >= cutoffDate)
      .sort(
        (a, b) =>
          new Date(a.snapshot_date).getTime() -
          new Date(b.snapshot_date).getTime()
      );
  };

  const filteredSnapshots = getFilteredSnapshots();

  const chartData = filteredSnapshots.map((s) => {
    let data: SnapshotData | null = null;
    try {
      data = JSON.parse(s.data_json);
    } catch {
      // ignore
    }

    return {
      date: format(new Date(s.snapshot_date), "dd MMM yy", { locale: fr }),
      Total: s.total_value,
      Stock: data?.by_type?.Stock || 0,
      Crypto: data?.by_type?.Crypto || 0,
      "Start-up": data?.by_type?.["Start-up"] || 0,
      Livret: data?.by_type?.Livret || 0,
      "Active Cash": data?.by_type?.["Active Cash"] || 0,
    };
  });

  const latestValue = snapshots[0]?.total_value || 0;
  const oldestInRange = filteredSnapshots[0]?.total_value || latestValue;
  const changeValue = latestValue - oldestInRange;
  const changePercent =
    oldestInRange > 0 ? (changeValue / oldestInRange) * 100 : 0;

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass glass-border rounded-lg px-4 py-3">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-mono font-medium">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-48 bg-muted/50 rounded animate-shimmer" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="stat-card p-6 h-32 animate-shimmer" />
          ))}
        </div>
        <div className="stat-card p-6 h-96 animate-shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-0 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gold/10">
            <History className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold text-gradient-gold">
              Historique
            </h1>
            <p className="text-sm text-muted-foreground">
              Évolution de votre patrimoine dans le temps
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {(["3m", "6m", "1y", "all"] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={
                timeRange === range
                  ? "btn-gold text-background"
                  : "border-border/50 hover:border-gold/50 hover:bg-gold/5"
              }
            >
              {range === "all" ? "Tout" : range.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 opacity-0 animate-fade-up stagger-1">
        <div className="stat-card card-shine p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <BarChart3 className="h-4 w-4 text-gold" />
            </div>
            <span className="text-sm text-muted-foreground">
              Valeur actuelle
            </span>
          </div>
          <p className="text-2xl font-bold font-mono">
            {formatCurrency(latestValue)}
          </p>
        </div>

        <div className="stat-card card-shine p-6">
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`p-2 rounded-lg ${changeValue >= 0 ? "bg-emerald/10" : "bg-rose/10"}`}
            >
              {changeValue >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald" />
              ) : (
                <TrendingDown className="h-4 w-4 text-rose" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              Évolution ({timeRange === "all" ? "total" : timeRange})
            </span>
          </div>
          <p
            className={`text-2xl font-bold font-mono ${changeValue >= 0 ? "text-emerald" : "text-rose"}`}
          >
            {changeValue >= 0 ? "+" : ""}
            {formatCurrency(changeValue)}
          </p>
          <p
            className={`text-sm font-mono ${changePercent >= 0 ? "text-emerald" : "text-rose"}`}
          >
            {changePercent >= 0 ? "+" : ""}
            {formatPercent(changePercent)}
          </p>
        </div>

        <div className="stat-card card-shine p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-chart-3" />
            <span className="text-sm text-muted-foreground">Snapshots</span>
          </div>
          <p className="text-2xl font-bold font-mono">
            {filteredSnapshots.length}
          </p>
          <p className="text-sm text-muted-foreground">sur la période</p>
        </div>
      </div>

      {/* Total Value Chart */}
      <Card className="premium-card opacity-0 animate-fade-up stagger-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold" />
            Évolution du patrimoine total
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Aucun snapshot disponible pour cette période
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="gradientTotal"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="oklch(0.78 0.14 75)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.78 0.14 75)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.28 0.015 260)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="oklch(0.55 0.02 260)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="oklch(0.55 0.02 260)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value >= 1000000
                      ? `${(value / 1000000).toFixed(1)}M`
                      : `${(value / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Total"
                  stroke="oklch(0.78 0.14 75)"
                  fill="url(#gradientTotal)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Breakdown by Type Chart */}
      <Card className="premium-card opacity-0 animate-fade-up stagger-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald" />
            Répartition par type d&apos;asset
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Aucun snapshot disponible pour cette période
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.28 0.015 260)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="oklch(0.55 0.02 260)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="oklch(0.55 0.02 260)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value >= 1000000
                      ? `${(value / 1000000).toFixed(1)}M`
                      : `${(value / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">
                      {value}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="Stock"
                  stackId="1"
                  stroke={COLORS.Stock}
                  fill={COLORS.Stock}
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="Crypto"
                  stackId="1"
                  stroke={COLORS.Crypto}
                  fill={COLORS.Crypto}
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="Start-up"
                  stackId="1"
                  stroke={COLORS["Start-up"]}
                  fill={COLORS["Start-up"]}
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="Livret"
                  stackId="1"
                  stroke={COLORS.Livret}
                  fill={COLORS.Livret}
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="Active Cash"
                  stackId="1"
                  stroke={COLORS["Active Cash"]}
                  fill={COLORS["Active Cash"]}
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
