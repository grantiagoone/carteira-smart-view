
import { Asset } from "@/services/brapiService";
import { AllocationItem, AssetRatings, AssetQuantities } from "./types";

/**
 * Distributes allocation percentages by asset type based on ratings
 */
export const distributeAllocationByType = (
  selectedAssets: Asset[],
  allocationItems: AllocationItem[],
  assetRatings: AssetRatings,
  handleUpdateQuantity: (assetId: string, quantity: number) => void
) => {
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

/**
 * Loads a portfolio by ID from localStorage
 */
export const loadPortfolioFromStorage = (portfolioId: string | undefined) => {
  if (!portfolioId) return null;
  
  const savedPortfolios = localStorage.getItem('portfolios');
  if (!savedPortfolios) return null;
  
  const portfolios = JSON.parse(savedPortfolios);
  return portfolios.find((p: any) => p.id === Number(portfolioId)) || null;
};

/**
 * Deletes a portfolio from localStorage
 */
export const deletePortfolioFromStorage = (portfolioId: string | undefined) => {
  if (!portfolioId) return false;
  
  const savedPortfolios = localStorage.getItem('portfolios');
  if (!savedPortfolios) return false;
  
  const portfolios = JSON.parse(savedPortfolios);
  const updatedPortfolios = portfolios.filter((p: any) => p.id !== Number(portfolioId));
  localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios));
  
  return true;
};
