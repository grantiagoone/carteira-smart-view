
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { AssetList } from "@/components/assets/AssetList";
import { AssetSearchDialog } from "./assets/AssetSearchDialog";
import { EmptyAssetsState } from "./assets/EmptyAssetsState";
import { Asset } from "@/services/brapiService";

interface PortfolioAssetsProps {
  selectedAssets: Asset[];
  onAddAsset: (asset: Asset) => void;
  onRemoveAsset: (assetId: string) => void;
  onUpdateQuantity: (assetId: string, quantity: number) => void;
  onUpdateRating?: (assetId: string, rating: number) => void;
  assetRatings?: Record<string, number>;
}

const PortfolioAssets = ({
  selectedAssets,
  onAddAsset,
  onRemoveAsset,
  onUpdateQuantity,
  onUpdateRating,
  assetRatings = {}
}: PortfolioAssetsProps) => {
  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ativos</CardTitle>
        <AssetSearchDialog 
          onAddAsset={onAddAsset} 
          selectedAssets={selectedAssets} 
        />
      </CardHeader>
      <CardContent>
        {selectedAssets.length > 0 ? (
          <AssetList 
            assets={selectedAssets} 
            onRemoveAsset={onRemoveAsset} 
            onUpdateQuantity={onUpdateQuantity}
            onUpdateRating={onUpdateRating}
            assetRatings={assetRatings}
          />
        ) : (
          <EmptyAssetsState />
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioAssets;
