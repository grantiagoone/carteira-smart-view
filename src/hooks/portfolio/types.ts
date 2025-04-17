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
  type: 'stock' | 'reit' | 'fixed_income' | 'international' | string;
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

export const calculatePortfolioValue = (assets: Asset[] | undefined): number => {
  if (!assets || assets.length === 0) return 0;
  return assets.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
};

export const normalizeAssetType = (type: string): 'stock' | 'reit' | 'fixed_income' | 'international' => {
  if (type === 'stock' || type === 'reit' || type === 'fixed_income' || type === 'international') {
    return type;
  }
  return 'stock'; // Default to stock if the type is unknown
};

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

  const assetsByType: Record<string, Asset[]> = {};
  portfolio.assets.forEach(asset => {
    if (!assetsByType[asset.type]) {
      assetsByType[asset.type] = [];
    }
    assetsByType[asset.type].push(asset);
  });

  const currentAllocation: Record<string, number> = {};
  Object.entries(assetsByType).forEach(([type, assets]) => {
    const typeValue = assets.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
    currentAllocation[type] = (typeValue / totalValue) * 100;
  });

  const targetAllocation: Record<string, number> = {};
  portfolio.allocationData.forEach(item => {
    targetAllocation[item.name] = item.value;
  });

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

  const assetsByType: Record<string, Asset[]> = {};
  portfolio.assets.forEach(asset => {
    if (!assetsByType[asset.type]) {
      assetsByType[asset.type] = [];
    }
    assetsByType[asset.type].push(asset);
  });

  portfolio.allocationData.forEach(allocation => {
    const assetsOfType = assetsByType[allocation.name] || [];
    const amountForType = (allocation.value / 100) * contributionAmount;
    
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
