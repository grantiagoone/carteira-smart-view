
import { useState } from "react";
import { Asset } from "@/services/brapiService";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AssetDetails from "./AssetDetails";

interface AssetListProps {
  assets: Asset[];
  onRemoveAsset: (assetId: string) => void;
  onUpdateQuantity: (assetId: string, quantity: number) => void;
  onUpdateRating?: (assetId: string, rating: number) => void;
  assetRatings?: Record<string, number>;
}

export const AssetList = ({ 
  assets, 
  onRemoveAsset, 
  onUpdateQuantity,
  onUpdateRating,
  assetRatings = {}
}: AssetListProps) => {
  if (assets.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md">
        <p className="text-muted-foreground">Nenhum ativo adicionado</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <p className="font-medium mb-1">Ativos ({assets.length})</p>
        <p className="text-sm text-muted-foreground">Defina a quantidade de cada ativo na carteira</p>
      </div>

      <div className="space-y-4">
        {assets.map((asset) => (
          <AssetDetails
            key={asset.id}
            asset={asset}
            onRemove={onRemoveAsset}
            onUpdateQuantity={onUpdateQuantity}
            onUpdateRating={onUpdateRating}
            rating={assetRatings[asset.id] || 5}
          />
        ))}
      </div>
    </div>
  );
};
