
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
        // Get the current authenticated user
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        // Only load portfolios if we have a user ID and portfolio ID
        if (userId && portfolioId) {
          const storageKey = `portfolios_${userId}`;
          const savedPortfolios = localStorage.getItem(storageKey);
          
          if (savedPortfolios) {
            const portfolios = JSON.parse(savedPortfolios);
            const foundPortfolio = portfolios.find((p: any) => p.id.toString() === portfolioId);
            
            if (foundPortfolio) {
              setPortfolio(foundPortfolio);
              setAllocationItems([...foundPortfolio.allocationData]);
              
              // Initialize selected assets and quantities if they exist
              if (foundPortfolio.assets) {
                // Atualizar preços dos ativos (agora usando o hook)
                await updatePortfolioPrices(portfolioId);
                
                // Recarregar a carteira com os preços atualizados
                const updatedPortfolios = localStorage.getItem(storageKey);
                if (updatedPortfolios) {
                  const parsedPortfolios = JSON.parse(updatedPortfolios);
                  const updatedPortfolio = parsedPortfolios.find((p: any) => p.id.toString() === portfolioId);
                  
                  if (updatedPortfolio) {
                    setPortfolio(updatedPortfolio);
                    setSelectedAssets(updatedPortfolio.assets);
                    
                    // Create quantities object from assets
                    const quantities: Record<string, number> = {};
                    updatedPortfolio.assets.forEach((asset: any) => {
                      quantities[asset.id] = asset.quantity || 0;
                    });
                    setAssetQuantities(quantities);
                    
                    // Initialize ratings if they exist
                    if (updatedPortfolio.assetRatings) {
                      setAssetRatings(updatedPortfolio.assetRatings);
                    } else {
                      // Default rating of 5 for all assets
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
          // No user or portfolio ID, redirect to portfolios list
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
  
  // Adicionar atualização periódica dos preços
  useEffect(() => {
    if (!portfolio || !portfolioId) return;
    
    // Atualizar preços a cada 5 minutos
    const interval = setInterval(() => {
      updatePortfolioPrices(portfolioId)
        .then(updated => {
          if (updated) {
            // Recarregar a carteira do localStorage
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
    }, 300000); // 5 minutos
    
    return () => clearInterval(interval);
  }, [portfolio, portfolioId, updatePortfolioPrices]);

  const deletePortfolio = async () => {
    try {
      // Get the current authenticated user
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

  // Função para atualizar manualmente os preços
  const refreshPrices = async () => {
    if (!portfolioId) return;
    
    toast("Atualizando preços dos ativos...");
    const updated = await updatePortfolioPrices(portfolioId);
    
    if (updated) {
      // Recarregar a carteira com os preços atualizados
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
