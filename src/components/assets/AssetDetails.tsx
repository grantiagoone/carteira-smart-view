
import { useState } from "react";
import { Asset } from "./AssetSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Trash } from "lucide-react";

interface AssetDetailsProps {
  asset: Asset;
  onRemove: (assetId: string) => void;
  onUpdateQuantity: (assetId: string, quantity: number) => void;
  onUpdateRating?: (assetId: string, rating: number) => void;
  rating?: number;
}

const AssetDetails = ({
  asset,
  onRemove,
  onUpdateQuantity,
  onUpdateRating,
  rating = 5
}: AssetDetailsProps) => {
  const [quantity, setQuantity] = useState(asset.quantity || 0);
  const [assetRating, setAssetRating] = useState(rating);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseFloat(e.target.value) || 0;
    setQuantity(newQuantity);
    onUpdateQuantity(asset.id, newQuantity);
  };

  const handleRatingChange = (value: number[]) => {
    const newRating = value[0];
    setAssetRating(newRating);
    if (onUpdateRating) {
      onUpdateRating(asset.id, newRating);
    }
  };

  return (
    <div className="border rounded-md p-4 mb-4" style={{
      borderLeft: `4px solid ${
        asset.type === "stock" ? "#ea384c" :
        asset.type === "reit" ? "#0D9488" :
        asset.type === "fixed_income" ? "#F59E0B" : 
        asset.type === "international" ? "#222" : "#6B7280"
      }`
    }}>
      <div className="flex flex-col sm:flex-row justify-between">
        <div>
          <div className="flex gap-2 items-center mb-2">
            <h3 className="font-semibold">{asset.ticker}</h3>
            <span className="text-sm text-muted-foreground">{asset.name}</span>
          </div>
          <p className="text-sm mb-2">
            Preço: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.price)}
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Tipo: {
              asset.type === "stock" ? "Ações" :
              asset.type === "reit" ? "FIIs" :
              asset.type === "fixed_income" ? "Renda Fixa" :
              asset.type === "international" ? "Internacional" : 
              asset.type
            }
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8" 
          onClick={() => onRemove(asset.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`quantity-${asset.id}`}>Quantidade</Label>
          <Input
            id={`quantity-${asset.id}`}
            type="number"
            min="0"
            step="0.01"
            value={quantity}
            onChange={handleQuantityChange}
          />
        </div>
        
        {onUpdateRating && (
          <div>
            <div className="flex justify-between mb-2">
              <Label>Classificação (0-10)</Label>
              <span className="font-medium">{assetRating}</span>
            </div>
            <Slider
              defaultValue={[assetRating]}
              max={10}
              step={1}
              onValueChange={handleRatingChange}
            />
          </div>
        )}
      </div>
      
      <p className="text-sm mt-2">
        <span className="text-muted-foreground">Valor Total:</span> {' '}
        <span className="font-medium">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.price * quantity)}
        </span>
      </p>
    </div>
  );
};

export default AssetDetails;
