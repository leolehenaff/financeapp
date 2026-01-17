"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Asset, AssetType, WhoType, GeoType, CreateAssetInput } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { PEOPLE, PERSON_1 } from "@/lib/people";

// Add Textarea component inline since we didn't install it
function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }) {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

interface AssetFormProps {
  asset?: Asset;
  onSuccess?: () => void;
}

export function AssetForm({ asset, onSuccess }: AssetFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<CreateAssetInput>({
    name: asset?.name || "",
    ticker: asset?.ticker || "",
    isin: asset?.isin || "",
    who: asset?.who || PERSON_1,
    asset_type: asset?.asset_type || "Stock",
    geo: asset?.geo || null,
    quantity: asset?.quantity || 0,
    buying_value: asset?.buying_value || 0,
    buying_amount: asset?.buying_amount || 0,
    current_value: asset?.current_value || 0,
    current_amount: asset?.current_amount || 0,
    auto_refresh: asset?.auto_refresh || false,
    dividend_per_share: asset?.dividend_per_share || 0,
    notes: asset?.notes || "",
    startup_rating: asset?.startup_rating || "",
    ir_reduction: asset?.ir_reduction || "",
    alert_high: asset?.alert_high || null,
    alert_low: asset?.alert_low || null,
  });

  const handleChange = (field: keyof CreateAssetInput, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-calculate amounts
    if (field === "quantity" || field === "buying_value") {
      const qty = field === "quantity" ? (value as number) : formData.quantity;
      const buyVal = field === "buying_value" ? (value as number) : formData.buying_value;
      setFormData((prev) => ({
        ...prev,
        buying_amount: qty * buyVal,
      }));
    }

    if (field === "quantity" || field === "current_value") {
      const qty = field === "quantity" ? (value as number) : formData.quantity;
      const curVal = field === "current_value" ? (value as number) : formData.current_value;
      setFormData((prev) => ({
        ...prev,
        current_amount: qty * curVal,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = asset ? `/api/assets/${asset.id}` : "/api/assets";
      const method = asset ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save asset");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/assets");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isStartup = formData.asset_type === "Start-up";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticker">Ticker (Yahoo Finance)</Label>
            <Input
              id="ticker"
              value={formData.ticker || ""}
              onChange={(e) => handleChange("ticker", e.target.value || null)}
              placeholder="ex: EPA:CAP, BTC-EUR"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="isin">ISIN</Label>
            <Input
              id="isin"
              value={formData.isin || ""}
              onChange={(e) => handleChange("isin", e.target.value || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="who">Propriétaire *</Label>
            <Select
              value={formData.who}
              onValueChange={(v) => handleChange("who", v as WhoType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PEOPLE.map((person) => (
                  <SelectItem key={person} value={person}>
                    {person}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset_type">Type *</Label>
            <Select
              value={formData.asset_type}
              onValueChange={(v) => handleChange("asset_type", v as AssetType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Stock">Stock</SelectItem>
                <SelectItem value="Crypto">Crypto</SelectItem>
                <SelectItem value="Start-up">Start-up</SelectItem>
                <SelectItem value="Livret">Livret</SelectItem>
                <SelectItem value="Active Cash">Active Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="geo">Géographie</Label>
            <Select
              value={formData.geo || "none"}
              onValueChange={(v) => handleChange("geo", v === "none" ? null : (v as GeoType))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-</SelectItem>
                <SelectItem value="FR">FR</SelectItem>
                <SelectItem value="US">US</SelectItem>
                <SelectItem value="EU">EU</SelectItem>
                <SelectItem value="OTHER">OTHER</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valorisation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité *</Label>
            <Input
              id="quantity"
              type="number"
              step="any"
              value={formData.quantity}
              onChange={(e) => handleChange("quantity", parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buying_value">Prix d&apos;achat unitaire (€) *</Label>
            <Input
              id="buying_value"
              type="number"
              step="any"
              value={formData.buying_value}
              onChange={(e) => handleChange("buying_value", parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buying_amount">Montant investi (€)</Label>
            <Input
              id="buying_amount"
              type="number"
              step="any"
              value={formData.buying_amount}
              onChange={(e) => handleChange("buying_amount", parseFloat(e.target.value) || 0)}
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_value">Valeur actuelle unitaire (€) *</Label>
            <Input
              id="current_value"
              type="number"
              step="any"
              value={formData.current_value}
              onChange={(e) => handleChange("current_value", parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_amount">Valeur totale actuelle (€)</Label>
            <Input
              id="current_amount"
              type="number"
              step="any"
              value={formData.current_amount}
              onChange={(e) => handleChange("current_amount", parseFloat(e.target.value) || 0)}
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dividend_per_share">Dividende/action (€)</Label>
            <Input
              id="dividend_per_share"
              type="number"
              step="any"
              value={formData.dividend_per_share || ""}
              onChange={(e) =>
                handleChange("dividend_per_share", parseFloat(e.target.value) || 0)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto_refresh"
              checked={formData.auto_refresh}
              onCheckedChange={(checked) => handleChange("auto_refresh", checked)}
            />
            <Label htmlFor="auto_refresh">
              Actualisation automatique des prix (nécessite un ticker)
            </Label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="alert_high">Alerte seuil haut (€)</Label>
              <Input
                id="alert_high"
                type="number"
                step="any"
                value={formData.alert_high || ""}
                onChange={(e) =>
                  handleChange("alert_high", e.target.value ? parseFloat(e.target.value) : null)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alert_low">Alerte seuil bas (€)</Label>
              <Input
                id="alert_low"
                type="number"
                step="any"
                value={formData.alert_low || ""}
                onChange={(e) =>
                  handleChange("alert_low", e.target.value ? parseFloat(e.target.value) : null)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isStartup && (
        <Card>
          <CardHeader>
            <CardTitle>Start-up</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startup_rating">Note</Label>
              <Select
                value={formData.startup_rating || "none"}
                onValueChange={(v) =>
                  handleChange("startup_rating", v === "none" ? null : v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-</SelectItem>
                  <SelectItem value="5/5">5/5</SelectItem>
                  <SelectItem value="4/5">4/5</SelectItem>
                  <SelectItem value="3/5">3/5</SelectItem>
                  <SelectItem value="2.5/5">2.5/5</SelectItem>
                  <SelectItem value="2/5">2/5</SelectItem>
                  <SelectItem value="1/5">1/5</SelectItem>
                  <SelectItem value="NA">NA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ir_reduction">Réduction IR</Label>
              <Input
                id="ir_reduction"
                value={formData.ir_reduction || ""}
                onChange={(e) => handleChange("ir_reduction", e.target.value || null)}
                placeholder="ex: 18% IR, 50% IR"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value || null)}
            placeholder="Notes libres..."
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {asset ? "Enregistrer" : "Créer"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
