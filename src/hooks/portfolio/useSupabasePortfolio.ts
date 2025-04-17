
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Portfolio } from "./types";
import { toast } from "sonner";

export const useSupabasePortfolio = (portfolioId?: string) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPortfolio = async () => {
    try {
      if (!portfolioId) return null;

      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId)
        .single();

      if (portfolioError) throw portfolioError;

      if (!portfolioData) return null;

      // Fetch portfolio assets
      const { data: assetsData, error: assetsError } = await supabase
        .from('portfolio_assets')
        .select('*')
        .eq('portfolio_id', portfolioId);

      if (assetsError) throw assetsError;

      return {
        ...portfolioData,
        assets: assetsData || []
      };
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast.error('Error fetching portfolio');
      return null;
    }
  };

  const deletePortfolio = async () => {
    try {
      if (!portfolioId) return;

      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);

      if (error) throw error;

      toast.success('Portfolio deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast.error('Error deleting portfolio');
      return false;
    }
  };

  const refreshPrices = async () => {
    setIsUpdating(true);
    try {
      if (!portfolioId || !portfolio?.assets) return false;

      // Here you would implement your price update logic
      // For now, we'll just refresh the portfolio data
      const updatedPortfolio = await fetchPortfolio();
      if (updatedPortfolio) {
        setPortfolio(updatedPortfolio);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating prices:', error);
      toast.error('Error updating prices');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const loadPortfolio = async () => {
      setLoading(true);
      try {
        const data = await fetchPortfolio();
        setPortfolio(data);
      } catch (error) {
        console.error('Error loading portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    if (portfolioId) {
      loadPortfolio();
    }
  }, [portfolioId]);

  return {
    portfolio,
    loading,
    isUpdating,
    deletePortfolio,
    refreshPrices,
  };
};
