
import { Asset } from "./AssetSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useState } from "react";

interface AssetListProps {
  assets: Asset[];
  onRemoveAsset: (assetId: string) => void;
  onUpdateQuantity: (assetId: string, quantity: number) => void;
  title?: string;
}

export const AssetList = ({
  assets,
  onRemoveAsset,
  onUpdateQuantity,
  title = "Ativos Selecionados"
}: AssetListProps) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (assetId: string, value: string) => {
    const quantity = parseFloat(value) || 0;
    setQuantities(prev => ({
      ...prev,
      [assetId]: quantity
    }));
    onUpdateQuantity(assetId, quantity);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">{title}</h3>
      
      {assets.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">Nenhum ativo selecionado</p>
          <p className="text-xs text-muted-foreground mt-1">Use a busca acima para adicionar ativos</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.map((asset) => {
                const quantity = quantities[asset.id] || 0;
                const total = asset.price * quantity;
                
                return (
                  <tr key={asset.id}>
                    <td className="px-4 py-3 text-sm font-medium">{asset.ticker}</td>
                    <td className="px-4 py-3 text-sm">{asset.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.price)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={quantity || ""}
                        onChange={(e) => handleQuantityChange(asset.id, e.target.value)}
                        className="w-24"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveAsset(asset.id)}
                      >
                        <X size={16} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
