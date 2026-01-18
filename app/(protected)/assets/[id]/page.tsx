"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AssetForm } from "@/components/assets/asset-form";
import { Asset } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Loader2, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/calculations";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface PriceHistory {
  date: string;
  value: number;
  quantity: number;
  current_amount: number;
}

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAsset();
    fetchHistory();
  }, [params.id]);

  const fetchAsset = async () => {
    try {
      const res = await fetch(`/api/assets/${params.id}`);
      if (!res.ok) {
        router.push("/assets");
        return;
      }
      const data = await res.json();
      setAsset(data);
    } catch (error) {
      console.error("Error fetching asset:", error);
      router.push("/assets");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/assets/${params.id}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Error fetching asset history:", error);
    }
  };

  const handleRefreshPrice = async () => {
    if (!asset?.ticker) return;
    setRefreshing(true);
    try {
      await fetch(`/api/prices/refresh/${params.id}`, { method: "POST" });
      await fetchAsset();
    } catch (error) {
      console.error("Error refreshing price:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!asset) {
    return <div>Asset non trouvé</div>;
  }

  const chartData = history.map((h) => ({
    date: format(new Date(h.date), "dd MMM yy", { locale: fr }),
    value: h.value,
    amount: h.current_amount,
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass glass-border rounded-lg px-4 py-3">
          <p className="text-sm font-medium mb-2">{payload[0].name}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Prix unitaire:</span>
              <span className="font-mono font-medium text-gold">
                {formatCurrency(payload[0].value)}
              </span>
            </div>
            {payload[1] && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Montant total:</span>
                <span className="font-mono font-medium">
                  {formatCurrency(payload[1].value)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between opacity-0 animate-fade-up">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/assets")}
            className="hover:bg-gold/10 hover:text-gold"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-semibold text-gradient-gold">
              {asset.name}
            </h1>
            {asset.ticker && (
              <p className="text-sm text-muted-foreground font-mono">
                {asset.ticker}
              </p>
            )}
          </div>
        </div>
        {asset.ticker && (
          <Button
            variant="outline"
            onClick={handleRefreshPrice}
            disabled={refreshing}
            className="border-border/50 hover:border-gold/50 hover:bg-gold/5"
          >
            {refreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Actualiser le prix
          </Button>
        )}
      </div>

      {/* Price Evolution Chart */}
      {history.length > 0 && (
        <Card className="premium-card opacity-0 animate-fade-up stagger-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gold/10">
                <TrendingUp className="h-4 w-4 text-gold" />
              </div>
              Évolution du prix
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradientValue" x1="0" y1="0" x2="0" y2="1">
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
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="date"
                  stroke="oklch(0.78 0.14 75)"
                  fill="url(#gradientValue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="opacity-0 animate-fade-up stagger-2">
        <AssetForm
          asset={asset}
          onSuccess={() => {
            router.push("/assets");
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
