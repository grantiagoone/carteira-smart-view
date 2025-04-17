
import { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  price: number;
  type: "stock" | "reit" | "fixed_income" | "international";
  change?: number;
}

// Sample asset data (in a real app, this would come from an API)
const sampleAssets: Asset[] = [
  { id: "1", ticker: "PETR4", name: "Petrobras PN", price: 38.42, type: "stock", change: 1.2 },
  { id: "2", ticker: "VALE3", name: "Vale ON", price: 67.80, type: "stock", change: -0.5 },
  { id: "3", ticker: "BBAS3", name: "Banco do Brasil ON", price: 56.78, type: "stock", change: 0.8 },
  { id: "4", ticker: "BBDC4", name: "Bradesco PN", price: 15.32, type: "stock", change: -0.3 },
  { id: "5", ticker: "ITUB4", name: "Itaú Unibanco PN", price: 32.90, type: "stock", change: 0.2 },
  { id: "6", ticker: "ABEV3", name: "Ambev ON", price: 14.82, type: "stock", change: 1.5 },
  { id: "7", ticker: "MXRF11", name: "Maxi Renda FII", price: 10.15, type: "reit", change: 0.1 },
  { id: "8", ticker: "HGLG11", name: "CSHG Logística FII", price: 180.45, type: "reit", change: -0.2 },
  { id: "9", ticker: "KNRI11", name: "Kinea Renda Imobiliária FII", price: 145.80, type: "reit", change: 0.4 },
  { id: "10", ticker: "XPLG11", name: "XP Log FII", price: 112.30, type: "reit", change: -0.6 },
];

interface AssetSearchProps {
  onAddAsset: (asset: Asset) => void;
  selectedAssets: Asset[];
}

export const AssetSearch = ({ onAddAsset, selectedAssets }: AssetSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const results = sampleAssets.filter(
        asset => 
          asset.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(results);
      setIsSearching(false);
      
      if (results.length === 0) {
        toast("Nenhum ativo encontrado com esse termo");
      }
    }, 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const isAssetSelected = (asset: Asset) => {
    return selectedAssets.some(a => a.ticker === asset.ticker);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar por ticker ou nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="pr-10"
          />
          {searchQuery && (
            <button
              className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setSearchQuery("")}
              type="button"
            >
              <X size={16} />
            </button>
          )}
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={handleSearch}
            type="button"
          >
            <Search size={16} />
          </button>
        </div>
        <Button type="button" onClick={handleSearch}>Buscar</Button>
      </div>

      {isSearching && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {searchResults.length > 0 && !isSearching && (
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variação</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {searchResults.map((asset) => {
                const isSelected = isAssetSelected(asset);
                return (
                  <tr key={asset.id} className={isSelected ? "bg-primary/5" : ""}>
                    <td className="px-4 py-3 text-sm font-medium">{asset.ticker}</td>
                    <td className="px-4 py-3 text-sm">{asset.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.price)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={asset.change && asset.change > 0 ? "text-green-600" : "text-red-600"}>
                        {asset.change && asset.change > 0 ? "+" : ""}{asset.change?.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? "destructive" : "default"}
                        onClick={() => onAddAsset(asset)}
                        className="flex items-center gap-1"
                      >
                        {isSelected ? (
                          <>
                            <X size={14} /> Remover
                          </>
                        ) : (
                          <>
                            <Plus size={14} /> Adicionar
                          </>
                        )}
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
