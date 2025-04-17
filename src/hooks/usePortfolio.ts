
import { usePortfolioData } from "./portfolio/usePortfolioData";
import { Portfolio, AllocationItem } from "./portfolio/types";
import { Asset } from "@/services/brapiService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export { type Asset } from "@/services/brapiService";
export type { Portfolio, AllocationItem } from "./portfolio/types";

export const usePortfolio = (portfolioId: string | undefined) => {
  const portfolioData = usePortfolioData(portfolioId);
  
  // Add function to delete a specific allocation item
  const deleteAllocationItem = async (allocationName: string) => {
    if (!portfolioId) return false;
    
    try {
      // Get the current authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para excluir uma alocação");
        return false;
      }
      
      // Get current portfolio data
      const storageKey = `portfolios_${userId}`;
      const savedPortfolios = localStorage.getItem(storageKey);
      
      if (!savedPortfolios) {
        toast.error("Carteira não encontrada");
        return false;
      }
      
      const portfolios = JSON.parse(savedPortfolios);
      const portfolioIndex = portfolios.findIndex((p: any) => p.id.toString() === portfolioId);
      
      if (portfolioIndex === -1) {
        toast.error("Carteira não encontrada");
        return false;
      }
      
      // Get current allocation data
      const currentPortfolio = portfolios[portfolioIndex];
      const currentAllocations = currentPortfolio.allocationData || [];
      
      // Find the allocation to delete
      const allocationIndex = currentAllocations.findIndex(
        (item: AllocationItem) => item.name === allocationName
      );
      
      if (allocationIndex === -1) {
        toast.error("Alocação não encontrada");
        return false;
      }
      
      // Remove the allocation
      const updatedAllocations = [...currentAllocations];
      updatedAllocations.splice(allocationIndex, 1);
      
      // If we've removed all allocations, add a default one
      if (updatedAllocations.length === 0) {
        updatedAllocations.push({
          name: "Renda Variável",
          value: 100,
          color: "#4299e1"
        });
      } else {
        // Normalize the remaining allocations to add up to 100%
        const totalValue = updatedAllocations.reduce(
          (sum: number, item: AllocationItem) => sum + item.value, 0
        );
        
        if (totalValue < 100) {
          // Adjust the values proportionally
          updatedAllocations.forEach((item: AllocationItem) => {
            item.value = Math.round((item.value / totalValue) * 100);
          });
          
          // Handle rounding errors to ensure total is exactly 100%
          const adjustedTotal = updatedAllocations.reduce(
            (sum: number, item: AllocationItem) => sum + item.value, 0
          );
          
          if (adjustedTotal !== 100) {
            const diff = 100 - adjustedTotal;
            updatedAllocations[0].value += diff;
          }
        }
      }
      
      // Update the portfolio
      portfolios[portfolioIndex] = {
        ...currentPortfolio,
        allocationData: updatedAllocations
      };
      
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(portfolios));
      
      toast.success("Alocação excluída com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao excluir alocação:", error);
      toast.error("Erro ao excluir alocação");
      return false;
    }
  };
  
  return {
    ...portfolioData,
    deleteAllocationItem
  };
};
