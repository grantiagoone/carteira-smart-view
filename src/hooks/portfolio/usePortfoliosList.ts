
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Portfolio } from "./types";
import { toast } from "sonner";

export const usePortfoliosList = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolios = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setPortfolios([]);
        return;
      }

      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select('*');

      if (portfoliosError) throw portfoliosError;

      // Fetch assets for all portfolios
      const portfoliosWithAssets = await Promise.all(
        portfoliosData.map(async (portfolio) => {
          const { data: assetsData } = await supabase
            .from('portfolio_assets')
            .select('*')
            .eq('portfolio_id', portfolio.id);

          return {
            ...portfolio,
            assets: assetsData || []
          };
        })
      );

      setPortfolios(portfoliosWithAssets);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast.error('Error fetching portfolios');
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();

    // Subscribe to changes
    const channel = supabase
      .channel('portfolio-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolios'
        },
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
    refreshPortfolios: fetchPortfolios
  };
};
