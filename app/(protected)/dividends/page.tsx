"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Asset, Dividend } from "@/lib/types";
import { formatCurrency, calculateAnnualDividend } from "@/lib/calculations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus, Loader2, Trash2, DollarSign, PiggyBank, Wallet } from "lucide-react";

interface DividendRow extends Dividend {
  asset_name: string;
  ticker: string;
  asset_type: string;
}

export default function DividendsPage() {
  const [dividends, setDividends] = useState<DividendRow[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Form state
  const [newAssetId, setNewAssetId] = useState<number | null>(null);
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newAmount, setNewAmount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [divRes, assetsRes] = await Promise.all([
        fetch("/api/dividends"),
        fetch("/api/assets"),
      ]);
      const divData = await divRes.json();
      const assetsData = await assetsRes.json();
      setDividends(divData);
      setAssets(assetsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDividend = async () => {
    if (!newAssetId) return;
    setSaving(true);
    try {
      await fetch("/api/dividends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_id: newAssetId,
          year: newYear,
          amount: newAmount,
        }),
      });
      await fetchData();
      setDialogOpen(false);
      setNewAssetId(null);
      setNewAmount(0);
    } catch (error) {
      console.error("Error saving dividend:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDividend = async (id: number) => {
    try {
      await fetch(`/api/dividends/${id}`, { method: "DELETE" });
      setDividends((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Error deleting dividend:", error);
    }
  };

  // Calculate estimated annual dividends from assets
  const estimatedDividends = assets
    .filter((a) => a.dividend_per_share && a.dividend_per_share > 0)
    .map((a) => ({
      asset: a,
      annual: calculateAnnualDividend(a.quantity, a.dividend_per_share || 0),
    }));

  const totalEstimatedAnnual = estimatedDividends.reduce(
    (sum, d) => sum + d.annual,
    0
  );

  // Group dividends by year for chart
  const years = [...new Set(dividends.map((d) => d.year))].sort((a, b) => a - b);
  const chartData = years.map((year) => {
    const yearDividends = dividends.filter((d) => d.year === year);
    return {
      year: year.toString(),
      total: yearDividends.reduce((sum, d) => sum + d.amount, 0),
    };
  });

  // Filter dividends by selected year
  const yearDividends = dividends.filter((d) => d.year === selectedYear);
  const totalYearDividends = yearDividends.reduce((sum, d) => sum + d.amount, 0);

  // Available years for filter
  const availableYears = [
    ...new Set([...years, new Date().getFullYear()]),
  ].sort((a, b) => b - a);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass glass-border rounded-lg px-4 py-3">
          <p className="text-sm font-medium mb-1">{label}</p>
          <p className="text-sm text-emerald font-mono">
            {formatCurrency(payload[0].value)}
          </p>
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
        <div className="stat-card p-6 h-64 animate-shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-0 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald/10">
            <DollarSign className="h-6 w-6 text-emerald" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold text-gradient-gold">
              Dividendes
            </h1>
            <p className="text-sm text-muted-foreground">
              Suivi de vos revenus passifs
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gold text-background">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle className="font-display">
                Ajouter un dividende reçu
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Asset</Label>
                <Select
                  value={newAssetId?.toString() || ""}
                  onValueChange={(v) => setNewAssetId(parseInt(v))}
                >
                  <SelectTrigger className="bg-input border-border/50">
                    <SelectValue placeholder="Sélectionner un asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets
                      .filter((a) => a.asset_type === "Stock")
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id.toString()}>
                          {a.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Année</Label>
                <Select
                  value={newYear.toString()}
                  onValueChange={(v) => setNewYear(parseInt(v))}
                >
                  <SelectTrigger className="bg-input border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Montant reçu (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                  className="bg-input border-border/50 font-mono"
                />
              </div>
              <Button
                onClick={handleSaveDividend}
                disabled={!newAssetId || saving}
                className="w-full btn-gold text-background"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 opacity-0 animate-fade-up stagger-1">
        <div className="stat-card card-shine p-6 glow-emerald">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-emerald/10">
              <PiggyBank className="h-4 w-4 text-emerald" />
            </div>
            <span className="text-sm text-muted-foreground">
              Dividendes estimés (annuels)
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald">
            {formatCurrency(totalEstimatedAnnual)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCurrency(totalEstimatedAnnual / 12)}/mois
          </p>
        </div>

        <div className="stat-card card-shine p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <DollarSign className="h-4 w-4 text-gold" />
            </div>
            <span className="text-sm text-muted-foreground">
              Dividendes reçus ({selectedYear})
            </span>
          </div>
          <p className="text-2xl font-bold font-mono">
            {formatCurrency(totalYearDividends)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {yearDividends.length} versement(s)
          </p>
        </div>

        <div className="stat-card card-shine p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-chart-3/20">
              <Wallet className="h-4 w-4 text-chart-3" />
            </div>
            <span className="text-sm text-muted-foreground">
              Assets avec dividendes
            </span>
          </div>
          <p className="text-2xl font-bold font-mono">{estimatedDividends.length}</p>
          <p className="text-sm text-muted-foreground mt-1">
            sur {assets.filter((a) => a.asset_type === "Stock").length} actions
          </p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="premium-card opacity-0 animate-fade-up stagger-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald" />
              Évolution des dividendes reçus
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
                  tickFormatter={(value) => `${value}€`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="total"
                  fill="oklch(0.70 0.18 155)"
                  name="Total reçu"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Estimated Dividends Table */}
      <Card className="premium-card opacity-0 animate-fade-up stagger-3">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold" />
            Dividendes estimés par asset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Asset</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Div/action</TableHead>
                  <TableHead className="text-right">Annuel estimé</TableHead>
                  <TableHead className="text-right">Mensuel estimé</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimatedDividends.map(({ asset, annual }) => (
                  <TableRow key={asset.id} className="table-row-hover border-border/30">
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {asset.ticker}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {asset.quantity.toLocaleString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(asset.dividend_per_share || 0)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium text-emerald">
                      {formatCurrency(annual)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {formatCurrency(annual / 12)}
                    </TableCell>
                  </TableRow>
                ))}
                {estimatedDividends.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      Aucun asset avec dividendes configurés
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Received Dividends Table */}
      <Card className="premium-card opacity-0 animate-fade-up stagger-4">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald" />
            Dividendes reçus
          </CardTitle>
          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-32 bg-input border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Montant reçu</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearDividends.map((d) => (
                  <TableRow key={d.id} className="table-row-hover border-border/30">
                    <TableCell className="font-medium">{d.asset_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {d.asset_type}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium text-emerald">
                      {formatCurrency(d.amount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDividend(d.id)}
                        className="h-8 w-8 hover:bg-rose/10 hover:text-rose"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {yearDividends.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      Aucun dividende enregistré pour {selectedYear}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
