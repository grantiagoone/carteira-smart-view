
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AssetSearch, Asset } from "@/components/assets/AssetSearch";
import { AssetList } from "@/components/assets/AssetList";

interface PortfolioFormStep2Props {
  selectedAssets: Asset[];
  onAddAsset: (asset: Asset) => void;
  onRemoveAsset: (assetId: string) => void;
  onUpdateQuantity: (assetId: string, quantity: number) => void;
  onUpdateRating: (assetId: string, rating: number) => void;
  assetRatings: Record<string, number>;
  onPreviousStep: () => void;
}

const PortfolioFormStep2 = ({
  selectedAssets,
  onAddAsset,
  onRemoveAsset,
  onUpdateQuantity,
  onUpdateRating,
  assetRatings,
  onPreviousStep
}: PortfolioFormStep2Props) => {
  return (
    <div className="space-y-6">
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

      {selectedAssets.length > 0 ? (
        <AssetList 
          assets={selectedAssets} 
          onRemoveAsset={onRemoveAsset} 
          onUpdateQuantity={onUpdateQuantity}
          onUpdateRating={onUpdateRating}
          assetRatings={assetRatings}
        />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum ativo adicionado. Clique em "Buscar e Adicionar Ativos" para começar.
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPreviousStep}>
          Voltar
        </Button>
        <Button 
          type="submit"
        >
          Finalizar e Criar Carteira
        </Button>
      </div>
    </div>
  );
};

export default PortfolioFormStep2;
