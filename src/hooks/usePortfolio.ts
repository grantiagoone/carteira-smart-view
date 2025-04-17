
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
}

export const usePortfolio = (portfolioId: string | undefined) => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [allocationItems, setAllocationItems] = useState<AllocationItem[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [assetQuantities, setAssetQuantities] = useState<Record<string, number>>({});
  
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
      
      toast(`${asset.ticker} removido da carteira`);
      return;
    }
    
    // Add the asset
    setSelectedAssets([...selectedAssets, asset]);
    toast(`${asset.ticker} adicionado à carteira`);
  };

  const handleRemoveAsset = (assetId: string) => {
    setSelectedAssets(selectedAssets.filter(asset => asset.id !== assetId));
    
    // Remove quantity data
    const newQuantities = { ...assetQuantities };
    delete newQuantities[assetId];
    setAssetQuantities(newQuantities);
  };

  const handleUpdateQuantity = (assetId: string, quantity: number) => {
    setAssetQuantities(prev => ({
      ...prev,
      [assetId]: quantity
    }));
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
    updateAllocationItem,
    removeAllocationItem,
    addAllocationItem,
    handleAddAsset,
    handleRemoveAsset,
    handleUpdateQuantity,
    deletePortfolio
  };
};
