export type AssetType = "Stock" | "Crypto" | "Start-up" | "Livret" | "Active Cash";
export type GeoType = "FR" | "US" | "EU" | "OTHER" | null;
export type WhoType = string;

export interface Asset {
  id: number;
  name: string;
  ticker: string | null;
  isin: string | null;
  who: WhoType;
  asset_type: AssetType;
  geo: GeoType;
  quantity: number;
  buying_value: number;
  buying_amount: number;
  current_value: number;
  current_amount: number;
  auto_refresh: boolean;
  dividend_per_share: number;
  notes: string | null;
  startup_rating: string | null;
  ir_reduction: string | null;
  alert_high: number | null;
  alert_low: number | null;
  created_at: string;
  updated_at: string;
}

export interface AssetRow {
  id: number;
  name: string;
  ticker: string | null;
  isin: string | null;
  who: string;
  asset_type: string;
  geo: string | null;
  quantity: number;
  buying_value: number;
  buying_amount: number;
  current_value: number;
  current_amount: number;
  auto_refresh: number;
  dividend_per_share: number;
  notes: string | null;
  startup_rating: string | null;
  ir_reduction: string | null;
  alert_high: number | null;
  alert_low: number | null;
  created_at: string;
  updated_at: string;
}

export function rowToAsset(row: AssetRow): Asset {
  return {
    ...row,
    who: row.who as WhoType,
    asset_type: row.asset_type as AssetType,
    geo: row.geo as GeoType,
    auto_refresh: row.auto_refresh === 1,
  };
}

export interface Hypothesis {
  id: number;
  asset_type: AssetType;
  pessimistic_rate: number;
  avg_rate: number;
  optimistic_rate: number;
  monthly_contribution_leo: number;
  monthly_contribution_julie: number;
  updated_at: string;
}

export interface Snapshot {
  id: number;
  snapshot_date: string;
  total_value: number;
  data_json: string;
  created_at: string;
}

export interface SnapshotData {
  assets: Asset[];
  by_type: Record<AssetType, number>;
  by_who: Record<WhoType, number>;
  by_geo: Record<string, number>;
}

export interface Dividend {
  id: number;
  asset_id: number;
  year: number;
  amount: number;
  created_at: string;
}

export interface ProjectionYear {
  year: number;
  pessimistic: number;
  average: number;
  optimistic: number;
  breakdown: Record<AssetType, { pessimistic: number; average: number; optimistic: number }>;
}

export interface DashboardStats {
  totalValue: number;
  totalBuyingAmount: number;
  totalPerformance: number;
  valueChange30d: number;
  percentChange30d: number;
  byType: Record<string, number>;
  byWho: Record<string, number>;
  byGeo: Record<string, number>;
  topPerformers: Asset[];
  worstPerformers: Asset[];
  alerts: Asset[];
  totalDividendsAnnual: number;
}

export interface CreateAssetInput {
  name: string;
  ticker?: string | null;
  isin?: string | null;
  who: WhoType;
  asset_type: AssetType;
  geo?: GeoType;
  quantity: number;
  buying_value: number;
  buying_amount: number;
  current_value: number;
  current_amount: number;
  auto_refresh?: boolean;
  dividend_per_share?: number;
  notes?: string | null;
  startup_rating?: string | null;
  ir_reduction?: string | null;
  alert_high?: number | null;
  alert_low?: number | null;
}

export type UpdateAssetInput = Partial<CreateAssetInput>;

// Allocation Objectives
export type AllocationCategory = "type" | "geo";

export interface AllocationObjective {
  id: number;
  category: AllocationCategory;
  key: string;
  target_percent: number;
  created_at: string;
  updated_at: string;
}

export interface AllocationObjectiveRow {
  id: number;
  category: string;
  key: string;
  target_percent: number;
  created_at: string;
  updated_at: string;
}

export function rowToAllocationObjective(row: AllocationObjectiveRow): AllocationObjective {
  return {
    ...row,
    category: row.category as AllocationCategory,
  };
}

export interface BulkAllocationObjectiveUpdate {
  category: AllocationCategory;
  objectives: { key: string; target_percent: number }[];
}
