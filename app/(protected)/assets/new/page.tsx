"use client";

import { AssetForm } from "@/components/assets/asset-form";

export default function NewAssetPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold">Nouvel asset</h1>
      <AssetForm />
    </div>
  );
}
