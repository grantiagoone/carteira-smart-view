
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Portfolio, AllocationItem, jsonToAllocationItems, normalizeAssetType, calculatePortfolioValue } from "./types";
import { toast } from "sonner";

export const usePortfoliosList = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPortfolios = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return [];
      }

      // Fetch all portfolios for the current user
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', session.session.user.id);

      if (portfoliosError) throw portfoliosError;

      // Fetch assets for all portfolios
      const { data: assetsData, error: assetsError } = await supabase
        .from('portfolio_assets')
        .select('*')
        .in('portfolio_id', portfoliosData.map(p => p.id));

      if (assetsError) throw assetsError;

      // Group assets by portfolio_id
      const assetsByPortfolio: Record<string, any[]> = {};
      assetsData?.forEach(asset => {
        if (!assetsByPortfolio[asset.portfolio_id]) {
          assetsByPortfolio[asset.portfolio_id] = [];
        }
        assetsByPortfolio[asset.portfolio_id].push({
          id: asset.id,
          ticker: asset.ticker,
          name: asset.name,
          type: normalizeAssetType(asset.type), // Normalize the asset type
          price: Number(asset.price) || 0,
          quantity: Number(asset.quantity) || 0
        });
      });

      // Transform data to Portfolio objects
      const transformedPortfolios: Portfolio[] = portfoliosData.map(portfolioData => {
        const portfolioAssets = assetsByPortfolio[portfolioData.id] || [];
        const allocationData = jsonToAllocationItems(portfolioData.allocation_data);
        const value = calculatePortfolioValue(portfolioAssets);

        // Placeholder values for return data (could be calculated from historical data)
        const returnPercentage = 0;
        const returnValue = 0;

        return {
          id: portfolioData.id,
          name: portfolioData.name,
          value,
          returnPercentage,
          returnValue,
          allocationData,
          assets: portfolioAssets,
          assetRatings: {}
        };
      });

      setPortfolios(transformedPortfolios);
      return transformedPortfolios;

    } catch (error) {
      console.error('Error loading portfolios:', error);
      toast.error('Error loading portfolios');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolios();
  }, []);

  return {
    portfolios,
    loading,
    refreshPortfolios: loadPortfolios
  };
};
