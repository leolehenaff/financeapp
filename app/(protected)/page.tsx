"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Asset, DashboardStats, Snapshot } from "@/lib/types";
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
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [assetsRes, snapshotsRes] = await Promise.all([
        fetch("/api/assets"),
        fetch("/api/snapshots?limit=30"),
      ]);

      const assets: Asset[] = await assetsRes.json();
      const snapshots: Snapshot[] = await snapshotsRes.json();

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

      const sortedByPerf = [...assets]
        .filter((a) => a.buying_amount > 0)
        .map((a) => ({
          ...a,
          perf: calculatePerformance(a.buying_amount, a.current_amount),
        }))
        .sort((a, b) => b.perf - a.perf);

      const topPerformers = sortedByPerf.slice(0, 5);
      const worstPerformers = sortedByPerf.slice(-5).reverse();

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
        topPerformers,
        worstPerformers,
        alerts,
        totalDividendsAnnual,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
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
        <div>
          <h1 className="font-display text-3xl font-semibold text-gradient-gold">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Vue d&apos;ensemble de votre patrimoine
          </p>
        </div>
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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="oklch(0.13 0.005 260)"
                  strokeWidth={2}
                >
                  {typeChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
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

        {/* By Geography */}
        <Card className="premium-card opacity-0 animate-fade-up stagger-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald" />
              Répartition géographique
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={geoChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="oklch(0.13 0.005 260)"
                  strokeWidth={2}
                >
                  {geoChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
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

      {/* Performers and Alerts */}
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
                    +
                    {formatPercent(
                      calculatePerformance(
                        asset.buying_amount,
                        asset.current_amount
                      )
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
                    {formatPercent(
                      calculatePerformance(
                        asset.buying_amount,
                        asset.current_amount
                      )
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
