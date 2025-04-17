
import { useSupabasePortfolio } from "./portfolio/useSupabasePortfolio";
export { type Asset } from "@/services/brapiService";
export type { Portfolio, AllocationItem } from "./portfolio/types";

export const usePortfolio = (portfolioId: string | undefined) => {
  const {
    portfolio,
    loading,
    isUpdating,
    deletePortfolio,
    refreshPrices,
  } = useSupabasePortfolio(portfolioId);
  
  return {
    portfolio,
    loading,
    isUpdating,
    deletePortfolio,
    refreshPrices
  };
};
