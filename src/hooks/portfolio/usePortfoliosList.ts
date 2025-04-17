
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Portfolio, jsonToAllocationItems, calculatePortfolioValue } from "./types";
import { toast } from "sonner";

export const usePortfoliosList = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setError('You must be logged in to view portfolios');
        setPortfolios([]);
        return;
      }

      // Fetch portfolios
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', session.session.user.id);

      if (portfoliosError) throw portfoliosError;

      if (!portfoliosData || portfoliosData.length === 0) {
        setPortfolios([]);
        return;
      }

      // Fetch assets for all portfolios
      const { data: assetsData, error: assetsError } = await supabase
        .from('portfolio_assets')
        .select('*')
        .in('portfolio_id', portfoliosData.map(p => p.id));

      if (assetsError) throw assetsError;

      // Transform data to match our Portfolio type
      const transformedPortfolios = portfoliosData.map(portfolio => {
        const portfolioAssets = assetsData?.filter(asset => asset.portfolio_id === portfolio.id) || [];
        
        const assets = portfolioAssets.map(asset => ({
          id: asset.id,
          ticker: asset.ticker,
          name: asset.name,
          type: asset.type || '',
          price: Number(asset.price) || 0,
          quantity: Number(asset.quantity) || 0
        }));

        const allocationData = jsonToAllocationItems(portfolio.allocation_data);
        const portfolioValue = calculatePortfolioValue(assets);
        
        // For now, we'll use placeholder values for return data
        const returnPercentage = 0;
        const returnValue = 0;

        return {
          id: portfolio.id,
          name: portfolio.name,
          value: portfolioValue,
          returnPercentage: returnPercentage,
          returnValue: returnValue,
          allocationData: allocationData,
          assets: assets,
          assetRatings: {} // Default empty ratings
        };
      });

      setPortfolios(transformedPortfolios);
    } catch (err) {
      console.error('Error fetching portfolios:', err);
      setError('Error fetching portfolios');
      toast.error('Error fetching portfolios');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPortfolios().finally(() => setLoading(false));

    // Set up a real-time subscription for portfolios
    const channel = supabase
      .channel('portfolio-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'portfolios' }, 
        () => {
          fetchPortfolios();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'portfolio_assets' }, 
        () => {
          fetchPortfolios();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    portfolios,
    loading,
    error,
    refreshPortfolios: fetchPortfolios
  };
};
