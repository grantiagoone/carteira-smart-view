
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Portfolio } from "@/hooks/portfolio/types";
import { getAllPortfoliosFromStorage } from "@/hooks/portfolio/portfolioUtils";
import { AssetSuggestion } from "./useContributionCalculation";

export const useContributionManagement = () => {
  const navigate = useNavigate();
  const [userPortfolios, setUserPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadUserPortfolios = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (userId) {
          const portfolios = getAllPortfoliosFromStorage(userId);
          setUserPortfolios(portfolios.map(p => ({ 
            id: p.id, 
            name: p.name, 
            allocationData: p.allocationData,
            assets: p.assets,
            assetRatings: p.assetRatings,
            value: p.value || 0,
            returnPercentage: p.returnPercentage || 0,
            returnValue: p.returnValue || 0
          })));
        }
      } catch (error) {
        console.error("Error loading portfolios:", error);
        toast.error("Erro ao carregar carteiras");
      } finally {
        setLoading(false);
      }
    };

    loadUserPortfolios();
  }, []);

  const saveContribution = async (
    portfolioId: string,
    amount: string,
    portfolioName: string,
    suggestedAllocation: AssetSuggestion[],
    selectedPortfolio: Portfolio | null
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para registrar um aporte");
        return false;
      }
      
      const parsedAmount = amount.replace(",", ".");
      
      const newContribution = {
        id: Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        portfolio: portfolioName,
        portfolioId: parseInt(portfolioId),
        amount: parseFloat(parsedAmount).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        status: "Concluído",
        allocations: suggestedAllocation.map(item => ({
          asset: item.ticker || item.asset,
          class: item.class,
          value: item.amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
          quantity: item.quantity || 0
        }))
      };
      
      const storageKey = `contributions_${userId}`;
      const existingContributions = localStorage.getItem(storageKey);
      let contributions = [];
      
      if (existingContributions) {
        contributions = JSON.parse(existingContributions);
      }
      
      contributions.push(newContribution);
      localStorage.setItem(storageKey, JSON.stringify(contributions));
      
      if (selectedPortfolio && selectedPortfolio.assets) {
        const updatedPortfolio = {...selectedPortfolio};
        
        suggestedAllocation.forEach(suggestion => {
          if (suggestion.ticker && suggestion.quantity) {
            const assetIndex = updatedPortfolio.assets?.findIndex(a => a.ticker === suggestion.ticker);
            if (assetIndex !== -1 && updatedPortfolio.assets) {
              updatedPortfolio.assets[assetIndex].quantity = 
                (updatedPortfolio.assets[assetIndex].quantity || 0) + suggestion.quantity;
            }
          }
        });
        
        const portfolios = getAllPortfoliosFromStorage(userId);
        const portfolioIndex = portfolios.findIndex(p => p.id.toString() === updatedPortfolio.id.toString());
        
        if (portfolioIndex !== -1) {
          portfolios[portfolioIndex] = updatedPortfolio;
          localStorage.setItem(`portfolios_${userId}`, JSON.stringify(portfolios));
        }
      }
      
      toast.success("Aporte realizado com sucesso!", {
        description: "O aporte foi registrado e os ativos foram alocados conforme sugerido."
      });
  
      navigate("/contributions");
      return true;
    } catch (error) {
      console.error("Erro ao salvar aporte:", error);
      toast.error("Erro ao salvar aporte");
      return false;
    }
  };

  return {
    userPortfolios,
    loading,
    saveContribution
  };
};
