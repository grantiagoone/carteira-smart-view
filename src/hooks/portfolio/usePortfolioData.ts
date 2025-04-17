import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAllocation } from "./useAllocation";
import { useAssets } from "./useAssets";
import { loadPortfolioFromStorage, deletePortfolioFromStorage } from "./portfolioUtils";
import { Portfolio } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { usePortfolioPriceUpdater } from "./usePortfolioPriceUpdater";

export const usePortfolioData = (portfolioId: string | undefined) => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const { updatePortfolioPrices, isUpdating } = usePortfolioPriceUpdater();
  
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
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (userId && portfolioId) {
          const storageKey = `portfolios_${userId}`;
          const savedPortfolios = localStorage.getItem(storageKey);
          
          if (savedPortfolios) {
            const portfolios = JSON.parse(savedPortfolios);
            const foundPortfolio = portfolios.find((p: any) => p.id.toString() === portfolioId);
            
            if (foundPortfolio) {
              setPortfolio(foundPortfolio);
              setAllocationItems([...foundPortfolio.allocationData]);
              
              if (foundPortfolio.assets) {
                await updatePortfolioPrices(portfolioId);
                
                const updatedPortfolios = localStorage.getItem(storageKey);
                if (updatedPortfolios) {
                  const parsedPortfolios = JSON.parse(updatedPortfolios);
                  const updatedPortfolio = parsedPortfolios.find((p: any) => p.id.toString() === portfolioId);
                  
                  if (updatedPortfolio) {
                    setPortfolio(updatedPortfolio);
                    setSelectedAssets(updatedPortfolio.assets);
                    
                    const quantities: Record<string, number> = {};
                    updatedPortfolio.assets.forEach((asset: any) => {
                      quantities[asset.id] = asset.quantity || 0;
                    });
                    setAssetQuantities(quantities);
                    
                    if (updatedPortfolio.assetRatings) {
                      setAssetRatings(updatedPortfolio.assetRatings);
                    } else {
                      const defaultRatings: Record<string, number> = {};
                      updatedPortfolio.assets.forEach((asset: any) => {
                        defaultRatings[asset.id] = 5;
                      });
                      setAssetRatings(defaultRatings);
                    }
                  }
                }
              }
            } else {
              toast("Carteira não encontrada");
              navigate("/portfolios");
            }
          } else {
            toast("Carteira não encontrada");
            navigate("/portfolios");
          }
        } else {
          toast("Você precisa estar logado para acessar esta carteira");
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
  }, [portfolioId, navigate, setAllocationItems, setSelectedAssets, setAssetQuantities, setAssetRatings, updatePortfolioPrices]);
  
  useEffect(() => {
    if (!portfolio || !portfolioId) return;
    
    const interval = setInterval(() => {
      updatePortfolioPrices(portfolioId)
        .then(updated => {
          if (updated) {
            const fetchUpdatedPortfolio = async () => {
              try {
                const { data: { session } } = await supabase.auth.getSession();
                const userId = session?.user?.id;
                
                if (userId) {
                  const storageKey = `portfolios_${userId}`;
                  const savedPortfolios = localStorage.getItem(storageKey);
                  
                  if (savedPortfolios) {
                    const portfolios = JSON.parse(savedPortfolios);
                    const updatedPortfolio = portfolios.find((p: any) => p.id.toString() === portfolioId);
                    
                    if (updatedPortfolio) {
                      setPortfolio(updatedPortfolio);
                      if (updatedPortfolio.assets) {
                        setSelectedAssets(updatedPortfolio.assets);
                      }
                    }
                  }
                }
              } catch (error) {
                console.error("Erro ao atualizar carteira:", error);
              }
            };
            
            fetchUpdatedPortfolio();
          }
        });
    }, 10800000);
    
    return () => clearInterval(interval);
  }, [portfolio, portfolioId, updatePortfolioPrices]);

  const deletePortfolio = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (userId && portfolioId) {
        if (deletePortfolioFromStorage(portfolioId, userId)) {
          toast("Carteira excluída com sucesso");
          navigate("/portfolios");
        } else {
          toast("Erro ao excluir carteira");
        }
      } else {
        toast("Você precisa estar logado para excluir esta carteira");
      }
    } catch (error) {
      console.error("Erro ao excluir carteira:", error);
      toast("Erro ao excluir carteira");
    }
  };

  const refreshPrices = async () => {
    if (!portfolioId) return;
    
    toast("Atualizando preços dos ativos...");
    const updated = await updatePortfolioPrices(portfolioId);
    
    if (updated) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (userId) {
          const storageKey = `portfolios_${userId}`;
          const savedPortfolios = localStorage.getItem(storageKey);
          
          if (savedPortfolios) {
            const portfolios = JSON.parse(savedPortfolios);
            const updatedPortfolio = portfolios.find((p: any) => p.id.toString() === portfolioId);
            
            if (updatedPortfolio) {
              setPortfolio(updatedPortfolio);
              if (updatedPortfolio.assets) {
                setSelectedAssets(updatedPortfolio.assets);
              }
              toast.success("Preços atualizados com sucesso!");
            }
          }
        }
      } catch (error) {
        console.error("Erro ao atualizar carteira:", error);
        toast.error("Erro ao atualizar preços");
      }
    } else {
      toast("Nenhum preço foi alterado");
    }
  };

  return {
    portfolio,
    loading,
    isUpdating,
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
    deletePortfolio,
    refreshPrices
  };
};
