"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Hypothesis, ProjectionYear } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { PERSON_1, PERSON_2 } from "@/lib/people";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { Loader2, Save, TrendingUp, Target, Calendar } from "lucide-react";

export default function ProjectionsPage() {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [projections, setProjections] = useState<ProjectionYear[]>([]);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [years, setYears] = useState(20);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [showPessimistic, setShowPessimistic] = useState(true);
  const [showAverage, setShowAverage] = useState(true);
  const [showOptimistic, setShowOptimistic] = useState(true);

  useEffect(() => {
    fetchProjections();
  }, [years]);

  const fetchProjections = async () => {
    try {
      const res = await fetch(`/api/projections?years=${years}`);
      const data = await res.json();
      setProjections(data.projections);
      setCurrentTotal(data.currentTotal);
      setHypotheses(data.hypotheses);
    } catch (error) {
      console.error("Error fetching projections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHypothesisChange = (
    id: number,
    field: keyof Hypothesis,
    value: number
  ) => {
    setHypotheses((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const handleSaveHypothesis = async (hypothesis: Hypothesis) => {
    setSaving(hypothesis.id);
    try {
      await fetch(`/api/hypotheses/${hypothesis.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pessimistic_rate: hypothesis.pessimistic_rate,
          avg_rate: hypothesis.avg_rate,
          optimistic_rate: hypothesis.optimistic_rate,
          monthly_contribution_leo: hypothesis.monthly_contribution_leo,
          monthly_contribution_julie: hypothesis.monthly_contribution_julie,
        }),
      });
      await fetchProjections();
    } catch (error) {
      console.error("Error saving hypothesis:", error);
    } finally {
      setSaving(null);
    }
  };

  const chartData = projections.map((p) => ({
    year: p.year === 0 ? "Auj." : `${p.year}`,
    Pessimiste: showPessimistic ? p.pessimistic : null,
    Moyen: showAverage ? p.average : null,
    Optimiste: showOptimistic ? p.optimistic : null,
  }));

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
          <p className="text-sm font-medium mb-2">
            {label === "Auj." ? "Aujourd'hui" : `Année ${label}`}
          </p>
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
        <div className="stat-card p-6 h-96 animate-shimmer" />
        <div className="stat-card p-6 h-64 animate-shimmer" />
      </div>
    );
  }

  const finalPessimistic =
    projections[projections.length - 1]?.pessimistic || 0;
  const finalAverage = projections[projections.length - 1]?.average || 0;
  const finalOptimistic = projections[projections.length - 1]?.optimistic || 0;

  const previousPessimistic =
    projections[projections.length - 2]?.pessimistic || 0;
  const previousAverage = projections[projections.length - 2]?.average || 0;
  const previousOptimistic = projections[projections.length - 2]?.optimistic || 0;

  const yoyPessimisticMonthly = (finalPessimistic - previousPessimistic) / 12;
  const yoyAverageMonthly = (finalAverage - previousAverage) / 12;
  const yoyOptimisticMonthly = (finalOptimistic - previousOptimistic) / 12;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 opacity-0 animate-fade-up">
        <div className="p-2 rounded-xl bg-gold/10">
          <TrendingUp className="h-6 w-6 text-gold" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold text-gradient-gold">
            Projections
          </h1>
          <p className="text-sm text-muted-foreground">
            Simulez l&apos;évolution de votre patrimoine
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 opacity-0 animate-fade-up stagger-1">
        <div className="stat-card card-shine p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-rose" />
            <span className="text-sm text-muted-foreground">Pessimiste</span>
          </div>
          <p className="text-2xl font-bold font-mono text-rose">
            {formatCurrency(finalPessimistic)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            +{formatPercent((finalPessimistic / currentTotal - 1) * 100)} en{" "}
            {years} ans
          </p>
          <p className="text-xs text-rose font-mono mt-1">
            +{formatCurrency(yoyPessimisticMonthly)} par mois en Année {years}
          </p>
        </div>

        <div className="stat-card card-shine p-6 glow-gold">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-gold" />
            <span className="text-sm text-muted-foreground">Moyen</span>
          </div>
          <p className="text-2xl font-bold font-mono text-gold">
            {formatCurrency(finalAverage)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            +{formatPercent((finalAverage / currentTotal - 1) * 100)} en {years}{" "}
            ans
          </p>
          <p className="text-xs text-gold font-mono mt-1">
            +{formatCurrency(yoyAverageMonthly)} par mois en Année {years}
          </p>
        </div>

        <div className="stat-card card-shine p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald" />
            <span className="text-sm text-muted-foreground">Optimiste</span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald">
            {formatCurrency(finalOptimistic)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            +{formatPercent((finalOptimistic / currentTotal - 1) * 100)} en{" "}
            {years} ans
          </p>
          <p className="text-xs text-emerald font-mono mt-1">
            +{formatCurrency(yoyOptimisticMonthly)} par mois en Année {years}
          </p>
        </div>
      </div>

      {/* Chart */}
      <Card className="premium-card opacity-0 animate-fade-up stagger-2">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gold" />
              Projection sur {years} ans
            </CardTitle>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-pessimistic"
                  checked={showPessimistic}
                  onCheckedChange={(checked) =>
                    setShowPessimistic(checked as boolean)
                  }
                  className="border-rose/50 data-[state=checked]:bg-rose data-[state=checked]:border-rose"
                />
                <Label
                  htmlFor="show-pessimistic"
                  className="text-sm text-rose cursor-pointer"
                >
                  Pessimiste
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-average"
                  checked={showAverage}
                  onCheckedChange={(checked) =>
                    setShowAverage(checked as boolean)
                  }
                  className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                />
                <Label
                  htmlFor="show-average"
                  className="text-sm text-gold cursor-pointer"
                >
                  Moyen
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-optimistic"
                  checked={showOptimistic}
                  onCheckedChange={(checked) =>
                    setShowOptimistic(checked as boolean)
                  }
                  className="border-emerald/50 data-[state=checked]:bg-emerald data-[state=checked]:border-emerald"
                />
                <Label
                  htmlFor="show-optimistic"
                  className="text-sm text-emerald cursor-pointer"
                >
                  Optimiste
                </Label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Slider */}
          <div className="flex items-center gap-4">
            <Label className="text-sm text-muted-foreground w-20">
              Horizon:
            </Label>
            <Slider
              value={[years]}
              onValueChange={([v]) => setYears(v)}
              min={10}
              max={30}
              step={1}
              className="flex-1"
            />
            <span className="w-20 text-right font-mono text-sm text-gold">
              {years} ans
            </span>
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="gradientPessimiste"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="oklch(0.65 0.20 15)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.65 0.20 15)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="gradientMoyen"
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
                  <linearGradient
                    id="gradientOptimiste"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="oklch(0.70 0.18 155)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.70 0.18 155)"
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
                  dataKey="year"
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
                {showPessimistic && (
                  <Area
                    type="monotone"
                    dataKey="Pessimiste"
                    stroke="oklch(0.65 0.20 15)"
                    strokeWidth={2}
                    fill="url(#gradientPessimiste)"
                  />
                )}
                {showAverage && (
                  <Area
                    type="monotone"
                    dataKey="Moyen"
                    stroke="oklch(0.78 0.14 75)"
                    strokeWidth={2}
                    fill="url(#gradientMoyen)"
                  />
                )}
                {showOptimistic && (
                  <Area
                    type="monotone"
                    dataKey="Optimiste"
                    stroke="oklch(0.70 0.18 155)"
                    strokeWidth={2}
                    fill="url(#gradientOptimiste)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Hypotheses Table */}
      <Card className="premium-card opacity-0 animate-fade-up stagger-3">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-gold" />
            Hypothèses de croissance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Type d&apos;asset</TableHead>
                  <TableHead className="text-center text-rose">
                    Pessimiste (%)
                  </TableHead>
                  <TableHead className="text-center text-gold">
                    Moyen (%)
                  </TableHead>
                  <TableHead className="text-center text-emerald">
                    Optimiste (%)
                  </TableHead>
                  <TableHead className="text-center">{PERSON_1} (€/mois)</TableHead>
                  <TableHead className="text-center">{PERSON_2} (€/mois)</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hypotheses.map((h) => (
                  <TableRow
                    key={h.id}
                    className="table-row-hover border-border/30"
                  >
                    <TableCell className="font-medium">{h.asset_type}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={h.pessimistic_rate}
                        onChange={(e) =>
                          handleHypothesisChange(
                            h.id,
                            "pessimistic_rate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-20 text-center mx-auto bg-input border-border/50 font-mono text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={h.avg_rate}
                        onChange={(e) =>
                          handleHypothesisChange(
                            h.id,
                            "avg_rate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-20 text-center mx-auto bg-input border-border/50 font-mono text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={h.optimistic_rate}
                        onChange={(e) =>
                          handleHypothesisChange(
                            h.id,
                            "optimistic_rate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-20 text-center mx-auto bg-input border-border/50 font-mono text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="50"
                        value={h.monthly_contribution_leo}
                        onChange={(e) =>
                          handleHypothesisChange(
                            h.id,
                            "monthly_contribution_leo",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-24 text-center mx-auto bg-input border-border/50 font-mono text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="50"
                        value={h.monthly_contribution_julie}
                        onChange={(e) =>
                          handleHypothesisChange(
                            h.id,
                            "monthly_contribution_julie",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-24 text-center mx-auto bg-input border-border/50 font-mono text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleSaveHypothesis(h)}
                        disabled={saving === h.id}
                        className="btn-gold text-background"
                      >
                        {saving === h.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Projection Table */}
      <Card className="premium-card opacity-0 animate-fade-up stagger-4">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">
            Détail année par année
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Année</TableHead>
                  <TableHead className="text-right text-rose">
                    Pessimiste
                  </TableHead>
                  <TableHead className="text-right text-gold">Moyen</TableHead>
                  <TableHead className="text-right text-emerald">
                    Optimiste
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projections.map((p) => (
                  <TableRow
                    key={p.year}
                    className="table-row-hover border-border/30"
                  >
                    <TableCell className="font-medium">
                      {p.year === 0 ? "Aujourd'hui" : `Année ${p.year}`}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(p.pessimistic)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-gold">
                      {formatCurrency(p.average)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(p.optimistic)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
