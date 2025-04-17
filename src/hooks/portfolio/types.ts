
import { Json } from "@/integrations/supabase/types";

export interface AllocationItem {
  name: string;
  value: number;
  color: string;
}

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  price: number;
  type: 'stock' | 'reit' | 'fixed_income' | 'international';
  quantity: number;
}

export interface Portfolio {
  id: number | string;
  name: string;
  value: number;
  returnPercentage: number;
  returnValue: number;
  allocationData: AllocationItem[];
  assets?: Asset[];
  assetRatings: Record<string, number>;
}

export type AssetQuantities = Record<string, number>;
export type AssetRatings = Record<string, number>;

export const allocationItemsToJson = (items: AllocationItem[]): Json => {
  return items as unknown as Json;
};

export const jsonToAllocationItems = (json: Json): AllocationItem[] => {
  return json as unknown as AllocationItem[];
};

// Function to calculate portfolio value from assets
export const calculatePortfolioValue = (assets: Asset[] | undefined): number => {
  if (!assets || assets.length === 0) return 0;
  return assets.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
};

// Function to calculate rebalancing suggestions
export interface RebalancingSuggestion {
  asset: Asset;
  currentAllocation: number;
  targetAllocation: number;
  differencePct: number;
  amountToAdjust: number;
  action: 'buy' | 'sell';
  quantityToAdjust: number;
}

export const calculateRebalancingSuggestions = (
  portfolio: Portfolio
): RebalancingSuggestion[] => {
  if (!portfolio.assets || portfolio.assets.length === 0) return [];

  const totalValue = calculatePortfolioValue(portfolio.assets);
  const suggestions: RebalancingSuggestion[] = [];

  // Map assets to their allocation types
  const assetsByType: Record<string, Asset[]> = {};
  portfolio.assets.forEach(asset => {
    if (!assetsByType[asset.type]) {
      assetsByType[asset.type] = [];
    }
    assetsByType[asset.type].push(asset);
  });

  // Calculate current allocation by type
  const currentAllocation: Record<string, number> = {};
  Object.entries(assetsByType).forEach(([type, assets]) => {
    const typeValue = assets.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
    currentAllocation[type] = (typeValue / totalValue) * 100;
  });

  // Create target allocation map
  const targetAllocation: Record<string, number> = {};
  portfolio.allocationData.forEach(item => {
    targetAllocation[item.name] = item.value;
  });

  // Calculate suggestions for each asset
  portfolio.assets.forEach(asset => {
    const assetValue = asset.price * asset.quantity;
    const currentPct = (assetValue / totalValue) * 100;
    const targetPct = targetAllocation[asset.type] / 
      (assetsByType[asset.type]?.length || 1);
    
    const differencePct = targetPct - currentPct;
    const amountToAdjust = Math.abs((differencePct / 100) * totalValue);
    
    suggestions.push({
      asset,
      currentAllocation: currentPct,
      targetAllocation: targetPct,
      differencePct,
      amountToAdjust,
      action: differencePct > 0 ? 'buy' : 'sell',
      quantityToAdjust: Math.floor(amountToAdjust / asset.price)
    });
  });

  return suggestions;
};

// Function to calculate contribution suggestions
export interface ContributionSuggestion {
  asset: Asset;
  amount: number;
  quantity: number;
}

export const calculateContributionSuggestions = (
  portfolio: Portfolio,
  contributionAmount: number
): ContributionSuggestion[] => {
  if (!portfolio.assets || portfolio.assets.length === 0) return [];

  const suggestions: ContributionSuggestion[] = [];
  const totalValue = calculatePortfolioValue(portfolio.assets);

  // Map assets by type
  const assetsByType: Record<string, Asset[]> = {};
  portfolio.assets.forEach(asset => {
    if (!assetsByType[asset.type]) {
      assetsByType[asset.type] = [];
    }
    assetsByType[asset.type].push(asset);
  });

  // Calculate current allocation percentages
  portfolio.allocationData.forEach(allocation => {
    const assetsOfType = assetsByType[allocation.name] || [];
    const amountForType = (allocation.value / 100) * contributionAmount;
    
    // Distribute amount among assets based on ratings
    assetsOfType.forEach(asset => {
      const rating = portfolio.assetRatings[asset.id] || 5;
      const totalRatings = assetsOfType.reduce((sum, a) => sum + (portfolio.assetRatings[a.id] || 5), 0);
      const assetAmount = (rating / totalRatings) * amountForType;
      const quantity = Math.floor(assetAmount / asset.price);

      if (quantity > 0) {
        suggestions.push({
          asset,
          amount: assetAmount,
          quantity
        });
      }
    });
  });

  return suggestions;
};
