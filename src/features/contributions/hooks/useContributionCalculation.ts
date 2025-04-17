
import { useState } from "react";
import { Portfolio, AllocationItem } from "@/hooks/portfolio/types";
import { Asset } from "@/services/brapiService";

export interface AssetSuggestion {
  asset: string;
  ticker?: string;  
  class: string;
  percentage: number;
  amount: number;
  currentValue?: number;
  targetValue?: number;
  quantity?: number;
  price?: number;
  currentPercentage?: number;
  targetPercentage?: number;
  classColor?: string;
}

export const useContributionCalculation = () => {
  const [suggestedAllocation, setSuggestedAllocation] = useState<AssetSuggestion[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [selectedPortfolioName, setSelectedPortfolioName] = useState("");

  const calculateSuggestions = (portfolioId: string, amount: number, userPortfolios: Portfolio[]) => {
    const portfolio = userPortfolios.find(p => p.id.toString() === portfolioId);
    if (!portfolio) return [];
    
    setSelectedPortfolio(portfolio);
    setSelectedPortfolioName(portfolio.name || "");

    const portfolioAssets = portfolio.assets || [];
    const totalPortfolioValue = portfolioAssets.reduce((sum, asset) => {
      return sum + (asset.price * (asset.quantity || 0));
    }, 0);
    
    const assetsByClass: Record<string, any[]> = {};
    const currentValueByClass: Record<string, number> = {};
    const allocatedPct: Record<string, number> = {};
    
    const classToTypeMap: Record<string, string[]> = {
      "Ações": ["stock"],
      "FIIs": ["reit"],
      "Renda Fixa": ["fixed_income"],
      "Internacional": ["international"]
    };
    
    portfolioAssets.forEach(asset => {
      const assetClass = Object.entries(classToTypeMap).find(([_, types]) => 
        types.includes(asset.type)
      )?.[0] || "Outros";
      
      if (!assetsByClass[assetClass]) {
        assetsByClass[assetClass] = [];
      }
      
      assetsByClass[assetClass].push(asset);
      
      const assetValue = asset.price * (asset.quantity || 0);
      currentValueByClass[assetClass] = (currentValueByClass[assetClass] || 0) + assetValue;
    });
    
    Object.keys(currentValueByClass).forEach(className => {
      allocatedPct[className] = totalPortfolioValue > 0 
        ? (currentValueByClass[className] / totalPortfolioValue) * 100 
        : 0;
    });
    
    const targetAllocation = portfolio.allocationData || [];
    const targetByClass: Record<string, number> = {};
    const classColors: Record<string, string> = {};
    
    targetAllocation.forEach(item => {
      targetByClass[item.name] = item.value;
      classColors[item.name] = item.color;
    });
    
    const suggestions: AssetSuggestion[] = [];
    const totalAmount = amount;
    
    const allocationDiffs: Record<string, number> = {};
    let totalPositiveDiff = 0;
    
    Object.keys(targetByClass).forEach(className => {
      const targetPct = targetByClass[className] || 0;
      const currentPct = allocatedPct[className] || 0;
      const diff = targetPct - currentPct;
      
      allocationDiffs[className] = diff;
      if (diff > 0) totalPositiveDiff += diff;
    });
    
    const allocationAmounts: Record<string, number> = {};
    
    if (totalPositiveDiff > 0) {
      Object.keys(allocationDiffs).forEach(className => {
        const diff = allocationDiffs[className];
        if (diff > 0) {
          allocationAmounts[className] = (diff / totalPositiveDiff) * totalAmount;
        } else {
          allocationAmounts[className] = 0;
        }
      });
    } else {
      Object.keys(targetByClass).forEach(className => {
        allocationAmounts[className] = (targetByClass[className] / 100) * totalAmount;
      });
    }
    
    Object.keys(allocationAmounts).forEach(className => {
      const amountForClass = allocationAmounts[className];
      if (amountForClass <= 0) return;
      
      const assetsInClass = assetsByClass[className] || [];
      
      if (assetsInClass.length > 0) {
        const assetRatings = portfolio.assetRatings || {};
        const totalRating = assetsInClass.reduce((sum, asset) => 
          sum + (assetRatings[asset.id] || 5), 0);
        
        assetsInClass.forEach(asset => {
          const rating = assetRatings[asset.id] || 5;
          const assetWeight = totalRating > 0 ? rating / totalRating : 1 / assetsInClass.length;
          const amountForAsset = amountForClass * assetWeight;
          const currentAssetValue = asset.price * (asset.quantity || 0);
          const currentPercentage = totalPortfolioValue > 0 
            ? (currentAssetValue / totalPortfolioValue) * 100 
            : 0;
          
          const quantityToBuy = asset.price > 0 ? Math.floor(amountForAsset / asset.price) : 0;
          
          suggestions.push({
            asset: asset.name,
            ticker: asset.ticker,
            class: className,
            percentage: (amountForAsset / totalAmount) * 100,
            amount: amountForAsset,
            currentValue: currentAssetValue,
            targetValue: currentAssetValue + amountForAsset,
            quantity: quantityToBuy,
            price: asset.price,
            currentPercentage,
            targetPercentage: currentPercentage + ((amountForAsset / (totalPortfolioValue + totalAmount)) * 100),
            classColor: classColors[className]
          });
        });
      } else {
        suggestions.push({
          asset: `Novo ativo de ${className}`,
          class: className,
          percentage: (amountForClass / totalAmount) * 100,
          amount: amountForClass,
          classColor: classColors[className]
        });
      }
    });
    
    const sortedSuggestions = suggestions.sort((a, b) => b.amount - a.amount);
    setSuggestedAllocation(sortedSuggestions);
    return sortedSuggestions;
  };

  return {
    suggestedAllocation,
    selectedPortfolio,
    selectedPortfolioName,
    calculateSuggestions,
    setSuggestedAllocation
  };
};
