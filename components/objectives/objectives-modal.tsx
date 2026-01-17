"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllocationObjective } from "@/lib/types";
import { Target, Loader2, AlertCircle } from "lucide-react";

interface ObjectivesModalProps {
  onSave?: () => void;
}

export function ObjectivesModal({ onSave }: ObjectivesModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [typeObjectives, setTypeObjectives] = useState<AllocationObjective[]>([]);
  const [geoObjectives, setGeoObjectives] = useState<AllocationObjective[]>([]);

  useEffect(() => {
    if (open) {
      fetchObjectives();
    }
  }, [open]);

  const fetchObjectives = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/objectives");
      const data: AllocationObjective[] = await res.json();
      setTypeObjectives(data.filter((o) => o.category === "type"));
      setGeoObjectives(data.filter((o) => o.category === "geo"));
    } catch (error) {
      console.error("Error fetching objectives:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (key: string, value: number) => {
    setTypeObjectives((prev) =>
      prev.map((o) => (o.key === key ? { ...o, target_percent: value } : o))
    );
  };

  const handleGeoChange = (key: string, value: number) => {
    setGeoObjectives((prev) =>
      prev.map((o) => (o.key === key ? { ...o, target_percent: value } : o))
    );
  };

  const typeTotal = typeObjectives.reduce((sum, o) => sum + o.target_percent, 0);
  const geoTotal = geoObjectives.reduce((sum, o) => sum + o.target_percent, 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/objectives/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "type",
          objectives: typeObjectives.map((o) => ({
            key: o.key,
            target_percent: o.target_percent,
          })),
        }),
      });

      await fetch("/api/objectives/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "geo",
          objectives: geoObjectives.map((o) => ({
            key: o.key,
            target_percent: o.target_percent,
          })),
        }),
      });

      onSave?.();
      setOpen(false);
    } catch (error) {
      console.error("Error saving objectives:", error);
    } finally {
      setSaving(false);
    }
  };

  const isValid = Math.abs(typeTotal - 100) < 0.01 && Math.abs(geoTotal - 100) < 0.01;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Target className="h-4 w-4" />
          Objectifs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-gold" />
            Objectifs d&apos;allocation
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : (
          <Tabs defaultValue="type" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="type">Par Type</TabsTrigger>
              <TabsTrigger value="geo">Par Geo</TabsTrigger>
            </TabsList>

            <TabsContent value="type" className="space-y-4 mt-4">
              {typeObjectives.map((obj) => (
                <ObjectiveSlider
                  key={obj.id}
                  label={obj.key}
                  value={obj.target_percent}
                  onChange={(v) => handleTypeChange(obj.key, v)}
                />
              ))}
              <TotalIndicator total={typeTotal} />
            </TabsContent>

            <TabsContent value="geo" className="space-y-4 mt-4">
              {geoObjectives.map((obj) => (
                <ObjectiveSlider
                  key={obj.id}
                  label={obj.key}
                  value={obj.target_percent}
                  onChange={(v) => handleGeoChange(obj.key, v)}
                />
              ))}
              <TotalIndicator total={geoTotal} />
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !isValid}
            className="btn-gold text-background"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ObjectiveSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-16 text-center font-mono text-sm"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />
    </div>
  );
}

function TotalIndicator({ total }: { total: number }) {
  const isValid = Math.abs(total - 100) < 0.01;
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        isValid ? "bg-emerald/10" : "bg-rose/10"
      }`}
    >
      <span className="text-sm font-medium">Total</span>
      <div className="flex items-center gap-2">
        {!isValid && <AlertCircle className="h-4 w-4 text-rose" />}
        <span
          className={`font-mono font-bold ${isValid ? "text-emerald" : "text-rose"}`}
        >
          {total.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
