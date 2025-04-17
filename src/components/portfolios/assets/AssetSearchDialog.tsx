
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { AssetSearch, Asset } from "@/components/assets/AssetSearch";

interface AssetSearchDialogProps {
  onAddAsset: (asset: Asset) => void;
  selectedAssets: Asset[];
}

export const AssetSearchDialog = ({ onAddAsset, selectedAssets }: AssetSearchDialogProps) => {
  return (
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
  );
};
