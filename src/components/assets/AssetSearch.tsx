
import { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Asset, searchAssets } from "@/services/brapiService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AssetSearchProps {
  onAddAsset: (asset: Asset) => void;
  selectedAssets: Asset[];
}

export { type Asset } from "@/services/brapiService";

export const AssetSearch = ({ onAddAsset, selectedAssets }: AssetSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults([]);
    
    try {
      console.log(`Iniciando busca por: "${searchQuery}"`);
      const results = await searchAssets(searchQuery);
      console.log(`Busca concluída, resultados:`, results);
      
      setSearchResults(results);
      
      if (results.length === 0) {
        setError(`Nenhum ativo encontrado com o termo "${searchQuery}"`);
        toast(`Nenhum ativo encontrado para "${searchQuery}"`);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      setError("Erro ao buscar ativos. Verifique o token da API e tente novamente.");
      toast("Erro ao buscar ativos. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
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
            placeholder="Buscar por ticker ou nome do ativo..."
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

      {error && !isSearching && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
