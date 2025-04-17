
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AllocationItem {
  name: string;
  value: number;
  color: string;
}

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  price: number;
  type: "stock" | "reit" | "fixed_income" | "international";
  change?: number;
  quantity?: number;
}

export interface Portfolio {
  id: number;
  name: string;
  value: number;
  returnPercentage: number;
  returnValue: number;
  allocationData: AllocationItem[];
  assets?: Asset[];
  assetRatings?: Record<string, number>;
}

export const usePortfolio = (portfolioId: string | undefined) => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [allocationItems, setAllocationItems] = useState<AllocationItem[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [assetQuantities, setAssetQuantities] = useState<Record<string, number>>({});
  const [assetRatings, setAssetRatings] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const fetchPortfolio = () => {
      setLoading(true);
      try {
        const savedPortfolios = localStorage.getItem('portfolios');
        if (savedPortfolios) {
          const portfolios: Portfolio[] = JSON.parse(savedPortfolios);
          const foundPortfolio = portfolios.find(p => p.id === Number(portfolioId));
          
          if (foundPortfolio) {
            setPortfolio(foundPortfolio);
            setAllocationItems([...foundPortfolio.allocationData]);
            
            // Initialize selected assets and quantities if they exist
            if (foundPortfolio.assets) {
              setSelectedAssets([...foundPortfolio.assets]);
              
              // Create quantities object from assets
              const quantities: Record<string, number> = {};
              foundPortfolio.assets.forEach(asset => {
                quantities[asset.id] = asset.quantity || 0;
              });
              setAssetQuantities(quantities);
              
              // Initialize ratings if they exist
              if (foundPortfolio.assetRatings) {
                setAssetRatings(foundPortfolio.assetRatings);
              } else {
                // Default rating of 5 for all assets
                const defaultRatings: Record<string, number> = {};
                foundPortfolio.assets.forEach(asset => {
                  defaultRatings[asset.id] = 5;
                });
                setAssetRatings(defaultRatings);
              }
            }
          } else {
            toast("Carteira não encontrada");
            navigate("/portfolios");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar carteira:", error);
        toast("Erro ao carregar carteira");
      } finally {
        setLoading(false);
      }
    };

    if (portfolioId) {
      fetchPortfolio();
    }
  }, [portfolioId, navigate]);

  const updateAllocationItem = (index: number, field: keyof AllocationItem, value: string | number) => {
    const newItems = [...allocationItems];
    
    if (field === "value") {
      // Ensure value is a number
      newItems[index][field] = Number(value);
    } else {
      // For name and color, value will be a string
      newItems[index][field] = value as string;
    }
    
    setAllocationItems(newItems);
  };

  const removeAllocationItem = (index: number) => {
    setAllocationItems(allocationItems.filter((_, i) => i !== index));
  };

  const addAllocationItem = () => {
    const newItem: AllocationItem = {
      name: "Nova Classe",
      value: 0,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
    };
    
    setAllocationItems([...allocationItems, newItem]);
  };
  
  const handleAddAsset = (asset: Asset) => {
    // If asset already exists, remove it
    if (selectedAssets.some(a => a.ticker === asset.ticker)) {
      setSelectedAssets(selectedAssets.filter(a => a.ticker !== asset.ticker));
      
      // Remove quantity data
      const newQuantities = { ...assetQuantities };
      delete newQuantities[asset.id];
      setAssetQuantities(newQuantities);
      
      // Remove rating data
      const newRatings = { ...assetRatings };
      delete newRatings[asset.id];
      setAssetRatings(newRatings);
      
      toast(`${asset.ticker} removido da carteira`);
      return;
    }
    
    // Add the asset
    setSelectedAssets([...selectedAssets, asset]);
    
    // Initialize with default rating of 5
    setAssetRatings(prev => ({
      ...prev,
      [asset.id]: 5
    }));
    
    // Distribute percentages among assets of the same type
    distributeAllocationByType();
    
    toast(`${asset.ticker} adicionado à carteira`);
  };

  const handleRemoveAsset = (assetId: string) => {
    const assetToRemove = selectedAssets.find(asset => asset.id === assetId);
    if (!assetToRemove) return;
    
    setSelectedAssets(selectedAssets.filter(asset => asset.id !== assetId));
    
    // Remove quantity data
    const newQuantities = { ...assetQuantities };
    delete newQuantities[assetId];
    setAssetQuantities(newQuantities);
    
    // Remove rating data
    const newRatings = { ...assetRatings };
    delete newRatings[assetId];
    setAssetRatings(newRatings);
    
    // Redistribute percentages among remaining assets
    distributeAllocationByType();
  };

  const handleUpdateQuantity = (assetId: string, quantity: number) => {
    setAssetQuantities(prev => ({
      ...prev,
      [assetId]: quantity
    }));
  };
  
  const handleUpdateRating = (assetId: string, rating: number) => {
    setAssetRatings(prev => ({
      ...prev,
      [assetId]: rating
    }));
  };
  
  const distributeAllocationByType = () => {
    if (selectedAssets.length === 0) return;
    
    // Group assets by type
    const assetsByType: Record<string, Asset[]> = {};
    selectedAssets.forEach(asset => {
      if (!assetsByType[asset.type]) {
        assetsByType[asset.type] = [];
      }
      assetsByType[asset.type].push(asset);
    });
    
    // Find allocation items for each type
    const typeToAllocationMap: Record<string, string> = {
      "stock": "Ações",
      "reit": "FIIs",
      "fixed_income": "Renda Fixa",
      "international": "Internacional"
    };
    
    // For each asset type, distribute the allocation
    Object.entries(assetsByType).forEach(([type, assets]) => {
      const allocationType = typeToAllocationMap[type] || type;
      const allocationItem = allocationItems.find(item => item.name === allocationType);
      
      if (allocationItem && assets.length > 0) {
        // Get total rating for weighted distribution
        const totalRating = assets.reduce((sum, asset) => sum + (assetRatings[asset.id] || 5), 0);
        
        // If all assets have the same rating (or no ratings), distribute evenly
        if (totalRating === 0 || assets.every(a => assetRatings[a.id] === assetRatings[assets[0].id])) {
          const quantityPerAsset = 100 / assets.length;
          assets.forEach(asset => {
            handleUpdateQuantity(asset.id, quantityPerAsset);
          });
        } else {
          // Distribute based on ratings
          assets.forEach(asset => {
            const rating = assetRatings[asset.id] || 5;
            const weight = rating / totalRating;
            const quantity = (weight * 100);
            handleUpdateQuantity(asset.id, quantity);
          });
        }
      }
    });
  };

  const deletePortfolio = () => {
    try {
      const savedPortfolios = localStorage.getItem('portfolios');
      if (savedPortfolios) {
        const portfolios: Portfolio[] = JSON.parse(savedPortfolios);
        const updatedPortfolios = portfolios.filter(p => p.id !== Number(portfolioId));
        localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios));
        
        toast("Carteira excluída com sucesso");
        
        navigate("/portfolios");
      }
    } catch (error) {
      console.error("Erro ao excluir carteira:", error);
      toast("Erro ao excluir carteira");
    }
  };

  return {
    portfolio,
    loading,
    allocationItems,
    selectedAssets,
    assetQuantities,
    assetRatings,
    updateAllocationItem,
    removeAllocationItem,
    addAllocationItem,
    handleAddAsset,
    handleRemoveAsset,
    handleUpdateQuantity,
    handleUpdateRating,
    deletePortfolio
  };
};
