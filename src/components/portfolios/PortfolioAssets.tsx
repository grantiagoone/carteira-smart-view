
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AssetSearch, Asset } from "@/components/assets/AssetSearch";
import { AssetList } from "@/components/assets/AssetList";

interface PortfolioAssetsProps {
  selectedAssets: Asset[];
  onAddAsset: (asset: Asset) => void;
  onRemoveAsset: (assetId: string) => void;
  onUpdateQuantity: (assetId: string, quantity: number) => void;
}

const PortfolioAssets = ({
  selectedAssets,
  onAddAsset,
  onRemoveAsset,
  onUpdateQuantity
}: PortfolioAssetsProps) => {
  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ativos</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              Buscar e Adicionar Ativos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Adicionar Ativos</DialogTitle>
              <DialogDescription>
                Busque por ticker ou nome do ativo para adicionar à sua carteira
              </DialogDescription>
            </DialogHeader>
            <AssetSearch 
              onAddAsset={onAddAsset} 
              selectedAssets={selectedAssets} 
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <AssetList 
          assets={selectedAssets} 
          onRemoveAsset={onRemoveAsset} 
          onUpdateQuantity={onUpdateQuantity}
        />
      </CardContent>
    </Card>
  );
};

export default PortfolioAssets;
