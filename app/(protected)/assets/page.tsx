"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Asset, AssetType, WhoType, GeoType } from "@/lib/types";
import {
  formatCurrency,
  formatPercent,
  calculatePerformance,
} from "@/lib/calculations";
import { PEOPLE, WHO_COLORS } from "@/lib/people";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  RefreshCw,
  ArrowUpDown,
  Search,
  Loader2,
  Trash2,
  AlertCircle,
  Wallet,
  Zap,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SortKey = "name" | "current_amount" | "perf" | "asset_type" | "who";
type SortOrder = "asc" | "desc";

const TYPE_COLORS: Record<AssetType, string> = {
  Stock: "oklch(0.78 0.14 75)",
  Crypto: "oklch(0.70 0.18 155)",
  "Start-up": "oklch(0.72 0.18 320)",
  Livret: "oklch(0.68 0.16 250)",
  "Active Cash": "oklch(0.75 0.15 35)",
};

function SkeletonRow() {
  return (
    <TableRow>
      {[...Array(12)].map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 bg-muted/50 rounded animate-shimmer" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<AssetType | "all">("all");
  const [filterWho, setFilterWho] = useState<WhoType | "all">("all");
  const [filterGeo, setFilterGeo] = useState<GeoType | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("current_amount");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showManualOnly, setShowManualOnly] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await fetch("/api/assets");
      const data = await res.json();
      setAssets(data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPrices = async () => {
    setRefreshing(true);
    try {
      await fetch("/api/prices/refresh", { method: "POST" });
      await fetchAssets();
    } catch (error) {
      console.error("Error refreshing prices:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/assets/${deleteId}`, { method: "DELETE" });
      setAssets(assets.filter((a) => a.id !== deleteId));
    } catch (error) {
      console.error("Error deleting asset:", error);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const filteredAssets = assets
    .filter((a) => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (filterType !== "all" && a.asset_type !== filterType) {
        return false;
      }
      if (filterWho !== "all" && a.who !== filterWho) {
        return false;
      }
      if (filterGeo !== "all" && a.geo !== filterGeo) {
        return false;
      }
      if (showManualOnly && a.auto_refresh) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortKey) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "current_amount":
          aVal = a.current_amount;
          bVal = b.current_amount;
          break;
        case "perf":
          aVal = calculatePerformance(a.buying_amount, a.current_amount);
          bVal = calculatePerformance(b.buying_amount, b.current_amount);
          break;
        case "asset_type":
          aVal = a.asset_type;
          bVal = b.asset_type;
          break;
        case "who":
          aVal = a.who;
          bVal = b.who;
          break;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const totalAmount = filteredAssets.reduce(
    (sum, a) => sum + a.current_amount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-0 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gold/10">
            <Wallet className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold text-gradient-gold">
              Assets
            </h1>
            <p className="text-sm text-muted-foreground">
              {assets.length} actifs dans votre portefeuille
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleRefreshPrices}
            disabled={refreshing}
            className="border-border/50 hover:border-gold/50 hover:bg-gold/5 transition-all shrink-0"
          >
            {refreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            <span className="hidden sm:inline">Actualiser</span>
            <span className="sm:hidden">Actu.</span>
          </Button>
          <Button asChild className="btn-gold text-background shrink-0">
            <Link href="/assets/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ajouter</span>
              <span className="sm:hidden">Ajout.</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 opacity-0 animate-fade-up stagger-1">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un actif..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input border-border/50 focus:border-gold/50 input-glow"
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v as AssetType | "all")}
        >
          <SelectTrigger className="w-[120px] bg-input border-border/50">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            <SelectItem value="Stock">Stock</SelectItem>
            <SelectItem value="Crypto">Crypto</SelectItem>
            <SelectItem value="Start-up">Start-up</SelectItem>
            <SelectItem value="Livret">Livret</SelectItem>
            <SelectItem value="Active Cash">Active Cash</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterWho}
          onValueChange={(v) => setFilterWho(v as WhoType | "all")}
        >
          <SelectTrigger className="w-[120px] bg-input border-border/50">
            <SelectValue placeholder="Qui" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {PEOPLE.map((person) => (
              <SelectItem key={person} value={person}>
                {person}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterGeo || "all"}
          onValueChange={(v) =>
            setFilterGeo(v === "all" ? "all" : (v as GeoType))
          }
        >
          <SelectTrigger className="w-[120px] bg-input border-border/50">
            <SelectValue placeholder="Geo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="FR">FR</SelectItem>
            <SelectItem value="US">US</SelectItem>
            <SelectItem value="EU">EU</SelectItem>
            <SelectItem value="OTHER">OTHER</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border/50 bg-input whitespace-nowrap">
          <Checkbox
            id="manual-only"
            checked={showManualOnly}
            onCheckedChange={(checked) => setShowManualOnly(checked as boolean)}
          />
          <label
            htmlFor="manual-only"
            className="text-sm text-muted-foreground cursor-pointer select-none"
          >
            <span className="hidden sm:inline">À mettre à jour manuellement</span>
            <span className="sm:hidden">Manuel</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm opacity-0 animate-fade-up stagger-2">
        <div className="overflow-x-auto -mx-px">
          <Table className="w-full min-w-max">
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead
                  className="cursor-pointer hover:text-gold transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Nom
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-gold transition-colors"
                  onClick={() => handleSort("who")}
                >
                  <div className="flex items-center gap-1">
                    Qui
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-gold transition-colors"
                  onClick={() => handleSort("asset_type")}
                >
                  <div className="flex items-center gap-1">
                    Type
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Geo</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">PRU</TableHead>
                <TableHead className="text-right">Cours</TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:text-gold transition-colors"
                  onClick={() => handleSort("perf")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Perf
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:text-gold transition-colors"
                  onClick={() => handleSort("current_amount")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Montant
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-right">%</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Aucun actif trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => {
                  const perf = calculatePerformance(
                    asset.buying_amount,
                    asset.current_amount
                  );
                  const distribution =
                    totalAmount > 0
                      ? (asset.current_amount / totalAmount) * 100
                      : 0;
                  const isAlertHigh =
                    asset.alert_high && asset.current_value >= asset.alert_high;
                  const isAlertLow =
                    asset.alert_low && asset.current_value <= asset.alert_low;

                  return (
                    <TableRow
                      key={asset.id}
                      className={`table-row-hover border-border/30 ${
                        isAlertHigh
                          ? "bg-emerald/5"
                          : isAlertLow
                            ? "bg-rose/5"
                            : ""
                      }`}
                    >
                      <TableCell className="font-medium">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="hover:text-gold transition-colors"
                        >
                          {asset.name}
                        </Link>
                        {(isAlertHigh || isAlertLow) && (
                          <AlertCircle className="inline ml-1.5 h-3.5 w-3.5 text-gold" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {asset.ticker && (
                            <Badge
                              variant="outline"
                              className="font-mono text-xs border-border/50"
                            >
                              {asset.ticker}
                            </Badge>
                          )}
                          {asset.auto_refresh && (
                            <Zap className="h-3 w-3 text-gold" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="text-xs border-0 font-medium"
                          style={{
                            backgroundColor: `color-mix(in oklch, ${WHO_COLORS[asset.who]}, transparent 85%)`,
                            color: WHO_COLORS[asset.who],
                          }}
                        >
                          {asset.who}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="text-xs border-0 font-medium"
                          style={{
                            backgroundColor: `color-mix(in oklch, ${TYPE_COLORS[asset.asset_type]}, transparent 85%)`,
                            color: TYPE_COLORS[asset.asset_type],
                          }}
                        >
                          {asset.asset_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {asset.geo || "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {asset.quantity.toLocaleString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {formatCurrency(asset.buying_value)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(asset.current_value)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono text-sm font-medium ${
                          perf >= 0 ? "text-emerald" : "text-rose"
                        }`}
                      >
                        {perf >= 0 ? "+" : ""}
                        {formatPercent(perf)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold">
                        {formatCurrency(asset.current_amount)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {formatPercent(distribution)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-rose/10 hover:text-rose"
                          onClick={() => setDeleteId(asset.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex justify-between items-center text-sm opacity-0 animate-fade-up stagger-3">
        <span className="text-muted-foreground">
          {filteredAssets.length} actif{filteredAssets.length > 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-mono font-semibold text-gold">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Supprimer cet asset ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;asset sera définitivement
              supprimé de votre portefeuille.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-rose hover:bg-rose/90 text-white"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
