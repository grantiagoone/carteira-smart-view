
import { useSupabasePortfolio } from "./portfolio/useSupabasePortfolio";
import { usePortfolioData } from "./portfolio/usePortfolioData";

export type { Asset } from "./portfolio/types";
export type { Portfolio, AllocationItem } from "./portfolio/types";

export const usePortfolio = (portfolioId: string | undefined) => {
  const {
    portfolio,
    loading,
    isUpdating,
    deletePortfolio,
    refreshPrices,
  } = useSupabasePortfolio(portfolioId);
  
  // For non-editing use cases
  if (!portfolioId) {
    return {
      portfolio,
      loading,
      isUpdating,
      deletePortfolio,
      refreshPrices
    };
  }
  
  // For the edit page, we need more functionality
  const {
    portfolio: portfolioData,
    loading: loadingData,
    isUpdating: isUpdatingData,
    allocationItems,
    selectedAssets,
    assetQuantities,
    assetRatings,
    updateAllocationItem,
    removeAllocationItem: deleteAllocationItem,
    addAllocationItem,
    handleAddAsset,
    handleRemoveAsset,
    handleUpdateQuantity,
    handleUpdateRating,
    deletePortfolio: deletePortfolioData,
    refreshPrices: refreshPricesData
  } = usePortfolioData(portfolioId);

  return {
    portfolio: portfolioData || portfolio,
    loading: loadingData || loading,
    isUpdating: isUpdatingData || isUpdating,
    deletePortfolio: deletePortfolioData || deletePortfolio,
    refreshPrices: refreshPricesData || refreshPrices,
    allocationItems,
    selectedAssets,
    assetQuantities, 
    assetRatings,
    updateAllocationItem,
    deleteAllocationItem,
    addAllocationItem,
    handleAddAsset,
    handleRemoveAsset,
    handleUpdateQuantity,
    handleUpdateRating
  };
};
