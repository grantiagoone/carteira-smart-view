
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Asset, getAssetPrice } from "@/services/brapiService";
import { useAllocation } from "./useAllocation";
import { useAssets } from "./useAssets";
import { loadPortfolioFromStorage, deletePortfolioFromStorage } from "./portfolioUtils";
import { Portfolio } from "./types";

export const usePortfolioData = (portfolioId: string | undefined) => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize allocation and assets hooks with empty values
  // We'll update them when the portfolio loads
  const {
    allocationItems,
    setAllocationItems,
    updateAllocationItem,
    removeAllocationItem,
    addAllocationItem
  } = useAllocation([]);
  
  const {
    selectedAssets,
    setSelectedAssets,
    assetQuantities,
    setAssetQuantities,
    assetRatings,
    setAssetRatings,
    handleAddAsset,
    handleRemoveAsset,
    handleUpdateQuantity,
    handleUpdateRating
  } = useAssets([], {}, {}, allocationItems);
  
  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        const foundPortfolio = loadPortfolioFromStorage(portfolioId);
        
        if (foundPortfolio) {
          setPortfolio(foundPortfolio);
          setAllocationItems([...foundPortfolio.allocationData]);
          
          // Initialize selected assets and quantities if they exist
          if (foundPortfolio.assets) {
            // Atualizar preços dos ativos
            const updatedAssets = [...foundPortfolio.assets];
            
            for (let i = 0; i < updatedAssets.length; i++) {
              const asset = updatedAssets[i];
              // Tentar atualizar o preço do ativo
              try {
                const latestPrice = await getAssetPrice(asset.ticker);
                if (latestPrice !== null) {
                  updatedAssets[i] = {
                    ...asset,
                    price: latestPrice
                  };
                }
              } catch (error) {
                console.error(`Erro ao atualizar preço do ativo ${asset.ticker}:`, error);
              }
            }
            
            setSelectedAssets(updatedAssets);
            
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
  }, [portfolioId, navigate, setAllocationItems, setSelectedAssets, setAssetQuantities, setAssetRatings]);
  
  const deletePortfolio = () => {
    try {
      if (deletePortfolioFromStorage(portfolioId)) {
        toast("Carteira excluída com sucesso");
        navigate("/portfolios");
      } else {
        toast("Erro ao excluir carteira");
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
