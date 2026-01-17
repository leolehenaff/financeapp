"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Asset, DashboardStats, Snapshot, AllocationObjective } from "@/lib/types";
import { ObjectivesModal } from "@/components/objectives/objectives-modal";
import { PieWithTarget } from "@/components/charts/pie-with-target";
import {
  formatCurrency,
  formatPercent,
  calculatePerformance,
} from "@/lib/calculations";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  Bell,
  Sparkles,
  Scale,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
// Note: PieChart, Pie, Cell only used for "By Person" chart
import Link from "next/link";
import { WHO_COLORS } from "@/lib/people";

const CHART_COLORS = [
  "oklch(0.78 0.14 75)",
  "oklch(0.70 0.18 155)",
  "oklch(0.68 0.16 250)",
  "oklch(0.72 0.18 320)",
  "oklch(0.75 0.15 35)",
  "oklch(0.65 0.12 200)",
];

function SkeletonCard() {
  return (
    <div className="stat-card p-6 animate-shimmer">
      <div className="h-4 w-24 bg-muted/50 rounded mb-4" />
      <div className="h-8 w-32 bg-muted/50 rounded mb-2" />
      <div className="h-3 w-20 bg-muted/50 rounded" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="h-5 w-32 bg-muted/50 rounded animate-shimmer" />
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        <div className="w-40 h-40 rounded-full bg-muted/30 animate-shimmer" />
      </CardContent>
    </Card>
  );
}

type PerformanceTimespan = "7d" | "30d" | "1y" | "all";
type PerformanceDisplay = "percentage" | "absolute";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeObjectives, setTypeObjectives] = useState<AllocationObjective[]>([]);
  const [geoObjectives, setGeoObjectives] = useState<AllocationObjective[]>([]);
  const [performanceTimespan, setPerformanceTimespan] = useState<PerformanceTimespan>("all");
  const [performanceDisplay, setPerformanceDisplay] = useState<PerformanceDisplay>("percentage");
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [allSnapshots, setAllSnapshots] = useState<Snapshot[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (allAssets.length > 0) {
      calculatePerformers();
    }
  }, [performanceTimespan, performanceDisplay, allAssets, allSnapshots]);

  const fetchDashboardData = async () => {
    try {
      const [assetsRes, snapshotsRes, objectivesRes] = await Promise.all([
        fetch("/api/assets"),
        fetch("/api/snapshots?limit=400"),
        fetch("/api/objectives"),
      ]);

      const assets: Asset[] = await assetsRes.json();
      const snapshots: Snapshot[] = await snapshotsRes.json();
      const objectives: AllocationObjective[] = await objectivesRes.json();

      setAllAssets(assets);
      setAllSnapshots(snapshots);
      setTypeObjectives(objectives.filter((o) => o.category === "type"));
      setGeoObjectives(objectives.filter((o) => o.category === "geo"));

      const totalValue = assets.reduce((sum, a) => sum + a.current_amount, 0);
      const totalBuyingAmount = assets.reduce(
        (sum, a) => sum + a.buying_amount,
        0
      );
      const totalPerformance = calculatePerformance(
        totalBuyingAmount,
        totalValue
      );

      let valueChange30d = 0;
      let percentChange30d = 0;
      if (snapshots.length > 0) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const oldSnapshot = snapshots.find(
          (s) => new Date(s.snapshot_date) <= thirtyDaysAgo
        );
        if (oldSnapshot) {
          valueChange30d = totalValue - oldSnapshot.total_value;
          percentChange30d = (valueChange30d / oldSnapshot.total_value) * 100;
        }
      }

      const byType: Record<string, number> = {};
      const byWho: Record<string, number> = {};
      const byGeo: Record<string, number> = {};

      for (const asset of assets) {
        byType[asset.asset_type] =
          (byType[asset.asset_type] || 0) + asset.current_amount;
        byWho[asset.who] = (byWho[asset.who] || 0) + asset.current_amount;
        if (asset.geo) {
          byGeo[asset.geo] = (byGeo[asset.geo] || 0) + asset.current_amount;
        }
      }

      const alerts = assets.filter(
        (a) =>
          (a.alert_high && a.current_value >= a.alert_high) ||
          (a.alert_low && a.current_value <= a.alert_low)
      );

      const totalDividendsAnnual = assets.reduce(
        (sum, a) => sum + a.quantity * (a.dividend_per_share || 0),
        0
      );

      setStats({
        totalValue,
        totalBuyingAmount,
        totalPerformance,
        valueChange30d,
        percentChange30d,
        byType,
        byWho,
        byGeo,
        topPerformers: [],
        worstPerformers: [],
        alerts,
        totalDividendsAnnual,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformers = () => {
    if (!stats) return;

    let sortedByPerf: Array<Asset & { perf: number; perfAbsolute: number }> = [];

    if (performanceTimespan === "all") {
      // All-time performance: compare to buying amount
      sortedByPerf = [...allAssets]
        .filter((a) => a.buying_amount > 0)
        .map((a) => ({
          ...a,
          perf: calculatePerformance(a.buying_amount, a.current_amount),
          perfAbsolute: a.current_amount - a.buying_amount,
        }))
        .sort((a, b) =>
          performanceDisplay === "percentage"
            ? b.perf - a.perf
            : b.perfAbsolute - a.perfAbsolute
        );
    } else {
      // Time-based performance: compare to historical snapshot
      const daysAgo =
        performanceTimespan === "7d" ? 7 : performanceTimespan === "30d" ? 30 : 365;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - daysAgo);

      const historicalSnapshot = allSnapshots.find(
        (s) => new Date(s.snapshot_date) <= targetDate
      );

      if (historicalSnapshot) {
        const historicalData = JSON.parse(historicalSnapshot.data_json);
        const historicalAssets = historicalData.assets || [];

        sortedByPerf = [...allAssets]
          .map((currentAsset) => {
            const historicalAsset = historicalAssets.find(
              (h: Asset) => h.id === currentAsset.id
            );
            if (!historicalAsset || historicalAsset.current_amount === 0) {
              return null;
            }

            const perf = calculatePerformance(
              historicalAsset.current_amount,
              currentAsset.current_amount
            );
            const perfAbsolute = currentAsset.current_amount - historicalAsset.current_amount;
            return {
              ...currentAsset,
              perf,
              perfAbsolute,
            };
          })
          .filter((a): a is Asset & { perf: number; perfAbsolute: number } => a !== null)
          .sort((a, b) =>
            performanceDisplay === "percentage"
              ? b.perf - a.perf
              : b.perfAbsolute - a.perfAbsolute
          );
      }
    }

    // For top performers: take top 5 (already sorted descending)
    const topPerformers = sortedByPerf.slice(0, 5);

    // For worst performers: take bottom 5, but keep them sorted by the same metric
    // so the worst one is first
    const worstPerformers = sortedByPerf
      .slice()
      .sort((a, b) =>
        performanceDisplay === "percentage"
          ? a.perf - b.perf  // Ascending: lowest percentage first
          : a.perfAbsolute - b.perfAbsolute  // Ascending: biggest loss first
      )
      .slice(0, 5);

    setStats({
      ...stats,
      topPerformers,
      worstPerformers,
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-48 bg-muted/50 rounded animate-shimmer" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <SkeletonChart key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Erreur lors du chargement des données
        </p>
      </div>
    );
  }

  const typeChartData = Object.entries(stats.byType).map(([name, value]) => ({
    name,
    value,
  }));

  const geoChartData = Object.entries(stats.byGeo).map(([name, value]) => ({
    name,
    value,
  }));

  const whoChartData = Object.entries(stats.byWho).map(([name, value]) => ({
    name,
    value,
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass glass-border rounded-lg px-3 py-2">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm text-gold font-mono">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 opacity-0 animate-fade-up">
        <div className="p-2 rounded-xl bg-gold/10">
          <Sparkles className="h-6 w-6 text-gold" />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-semibold text-gradient-gold">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Vue d&apos;ensemble de votre patrimoine
          </p>
        </div>
        <ObjectivesModal onSave={fetchDashboardData} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Net Worth */}
        <div className="stat-card card-shine p-6 opacity-0 animate-fade-up stagger-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 rounded-lg bg-gold/10">
              <Wallet className="h-5 w-5 text-gold" />
            </div>
            {stats.percentChange30d >= 0 ? (
              <div className="flex items-center gap-1 text-emerald text-sm">
                <TrendingUp className="h-4 w-4" />
                <span className="font-mono">
                  +{formatPercent(stats.percentChange30d)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-rose text-sm">
                <TrendingDown className="h-4 w-4" />
                <span className="font-mono">
                  {formatPercent(stats.percentChange30d)}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">Net Worth</p>
          <p className="text-3xl font-bold font-mono tracking-tight">
            {formatCurrency(stats.totalValue)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.valueChange30d >= 0 ? "+" : ""}
            {formatCurrency(stats.valueChange30d)} sur 30j
          </p>
        </div>

        {/* Performance */}
        <div className="stat-card card-shine p-6 opacity-0 animate-fade-up stagger-2">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`p-2 rounded-lg ${stats.totalPerformance >= 0 ? "bg-emerald/10" : "bg-rose/10"}`}
            >
              {stats.totalPerformance >= 0 ? (
                <ArrowUpRight className="h-5 w-5 text-emerald" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-rose" />
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Performance</p>
          <p
            className={`text-3xl font-bold font-mono tracking-tight ${stats.totalPerformance >= 0 ? "text-emerald" : "text-rose"}`}
          >
            {stats.totalPerformance >= 0 ? "+" : ""}
            {formatPercent(stats.totalPerformance)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Investi: {formatCurrency(stats.totalBuyingAmount)}
          </p>
        </div>

        {/* Dividends */}
        <div className="stat-card card-shine p-6 opacity-0 animate-fade-up stagger-3">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 rounded-lg bg-emerald/10">
              <PiggyBank className="h-5 w-5 text-emerald" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Dividendes annuels</p>
          <p className="text-3xl font-bold font-mono tracking-tight text-emerald">
            {formatCurrency(stats.totalDividendsAnnual)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatCurrency(stats.totalDividendsAnnual / 12)}/mois
          </p>
        </div>

        {/* Alerts */}
        <div className="stat-card card-shine p-6 opacity-0 animate-fade-up stagger-4">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`p-2 rounded-lg ${stats.alerts.length > 0 ? "bg-gold/10" : "bg-muted"}`}
            >
              <Bell
                className={`h-5 w-5 ${stats.alerts.length > 0 ? "text-gold" : "text-muted-foreground"}`}
              />
            </div>
            {stats.alerts.length > 0 && (
              <Badge className="badge-gold">{stats.alerts.length}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">Alertes</p>
          <p className="text-3xl font-bold font-mono tracking-tight">
            {stats.alerts.length}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.alerts.length === 0
              ? "Aucune alerte active"
              : `${stats.alerts.length} asset(s) en alerte`}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* By Type */}
        <Card className="premium-card opacity-0 animate-fade-up stagger-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />
              Répartition par type
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <PieWithTarget
              data={typeChartData}
              targets={typeObjectives.map((o) => ({
                name: o.key,
                target_percent: o.target_percent,
              }))}
              colors={CHART_COLORS}
            />
          </CardContent>
        </Card>

        {/* By Geography */}
        <Card className="premium-card opacity-0 animate-fade-up stagger-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald" />
              Répartition géographique
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <PieWithTarget
              data={geoChartData}
              targets={geoObjectives.map((o) => ({
                name: o.key,
                target_percent: o.target_percent,
              }))}
              colors={CHART_COLORS}
            />
          </CardContent>
        </Card>

        {/* By Person */}
        <Card className="premium-card opacity-0 animate-fade-up stagger-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-3" />
              Répartition par personne
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={whoChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="oklch(0.13 0.005 260)"
                  strokeWidth={2}
                >
                  {whoChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={WHO_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rebalancing Actions */}
      {(() => {
        const totalValue = stats.totalValue;
        const rebalanceActions: Array<{
          name: string;
          category: "type" | "geo";
          current: number;
          target: number;
          diff: number;
          amount: number;
        }> = [];

        // Calculate type differences
        const typeTotal = Object.values(stats.byType).reduce((a, b) => a + b, 0);
        for (const obj of typeObjectives) {
          const currentValue = stats.byType[obj.key] || 0;
          const currentPercent = typeTotal > 0 ? (currentValue / typeTotal) * 100 : 0;
          const diff = currentPercent - obj.target_percent;
          const amountDiff = (diff / 100) * totalValue;
          rebalanceActions.push({
            name: obj.key,
            category: "type",
            current: currentPercent,
            target: obj.target_percent,
            diff,
            amount: amountDiff,
          });
        }

        // Calculate geo differences
        const geoTotal = Object.values(stats.byGeo).reduce((a, b) => a + b, 0);
        for (const obj of geoObjectives) {
          const currentValue = stats.byGeo[obj.key] || 0;
          const currentPercent = geoTotal > 0 ? (currentValue / geoTotal) * 100 : 0;
          const diff = currentPercent - obj.target_percent;
          const amountDiff = (diff / 100) * totalValue;
          rebalanceActions.push({
            name: obj.key,
            category: "geo",
            current: currentPercent,
            target: obj.target_percent,
            diff,
            amount: amountDiff,
          });
        }

        // Sort by absolute difference and take top 5
        const topActions = rebalanceActions
          .filter((a) => Math.abs(a.diff) >= 3) // Only show significant differences
          .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
          .slice(0, 5);

        if (topActions.length === 0) return null;

        return (
          <Card className="premium-card opacity-0 animate-fade-up stagger-5">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gold/10">
                  <Scale className="h-4 w-4 text-gold" />
                </div>
                Actions de rééquilibrage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topActions.map((action, index) => (
                  <div
                    key={`${action.category}-${action.name}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-card/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-4">
                        {index + 1}.
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{action.name}</p>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {action.category === "type" ? "Type" : "Geo"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          {formatPercent(action.current)} → {formatPercent(action.target)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={
                          action.diff > 0
                            ? "badge-rose font-mono"
                            : "badge-emerald font-mono"
                        }
                      >
                        {action.diff > 0 ? "Surpondéré" : "Sous-pondéré"}
                      </Badge>
                      <p
                        className={`text-sm font-mono font-bold mt-1 ${
                          action.diff > 0 ? "text-rose" : "text-emerald"
                        }`}
                      >
                        {action.diff > 0 ? "+" : ""}
                        {formatPercent(action.diff)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Performers and Alerts */}
      <div className="flex items-center justify-between mb-4 opacity-0 animate-fade-up stagger-6">
        <h2 className="text-lg font-semibold">Performance</h2>
        <div className="flex gap-3">
          {/* Display Toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setPerformanceDisplay("percentage")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                performanceDisplay === "percentage"
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              %
            </button>
            <button
              onClick={() => setPerformanceDisplay("absolute")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                performanceDisplay === "absolute"
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              €
            </button>
          </div>
          {/* Timespan Toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["7d", "30d", "1y", "all"] as const).map((span) => (
              <button
                key={span}
                onClick={() => setPerformanceTimespan(span)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  performanceTimespan === span
                    ? "bg-gold text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {span === "all" ? "Tout" : span}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Performers */}
        <Card className="premium-card opacity-0 animate-fade-up stagger-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald/10">
                <TrendingUp className="h-4 w-4 text-emerald" />
              </div>
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topPerformers.map((asset, index) => (
                <Link
                  key={asset.id}
                  href={`/assets/${asset.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">
                      {index + 1}.
                    </span>
                    <div>
                      <p className="font-medium text-sm group-hover:text-emerald transition-colors">
                        {asset.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {asset.ticker}
                      </p>
                    </div>
                  </div>
                  <Badge className="badge-emerald font-mono">
                    {performanceDisplay === "percentage" ? (
                      <>
                        {(asset as Asset & { perf: number }).perf >= 0 ? "+" : ""}
                        {formatPercent((asset as Asset & { perf: number }).perf)}
                      </>
                    ) : (
                      <>
                        {(asset as Asset & { perfAbsolute: number }).perfAbsolute >= 0 ? "+" : ""}
                        {formatCurrency((asset as Asset & { perfAbsolute: number }).perfAbsolute)}
                      </>
                    )}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Worst Performers */}
        <Card className="premium-card opacity-0 animate-fade-up stagger-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose/10">
                <TrendingDown className="h-4 w-4 text-rose" />
              </div>
              Worst Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.worstPerformers.map((asset, index) => (
                <Link
                  key={asset.id}
                  href={`/assets/${asset.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-rose/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">
                      {index + 1}.
                    </span>
                    <div>
                      <p className="font-medium text-sm group-hover:text-rose transition-colors">
                        {asset.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {asset.ticker}
                      </p>
                    </div>
                  </div>
                  <Badge className="badge-rose font-mono">
                    {performanceDisplay === "percentage" ? (
                      formatPercent((asset as Asset & { perf: number }).perf)
                    ) : (
                      <>
                        {(asset as Asset & { perfAbsolute: number }).perfAbsolute >= 0 ? "+" : ""}
                        {formatCurrency((asset as Asset & { perfAbsolute: number }).perfAbsolute)}
                      </>
                    )}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card className="premium-card opacity-0 animate-fade-up stagger-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gold/10">
                <AlertTriangle className="h-4 w-4 text-gold" />
              </div>
              Alertes actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-3 rounded-full bg-muted/50 mb-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Aucune alerte</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Tous vos actifs sont dans les limites
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.alerts.map((asset) => {
                  const isHigh =
                    asset.alert_high && asset.current_value >= asset.alert_high;
                  return (
                    <Link
                      key={asset.id}
                      href={`/assets/${asset.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gold/5 transition-colors group"
                    >
                      <div>
                        <p className="font-medium text-sm group-hover:text-gold transition-colors">
                          {asset.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {formatCurrency(asset.current_value)}
                        </p>
                      </div>
                      <Badge className={isHigh ? "badge-emerald" : "badge-rose"}>
                        {isHigh ? "Seuil haut" : "Seuil bas"}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
