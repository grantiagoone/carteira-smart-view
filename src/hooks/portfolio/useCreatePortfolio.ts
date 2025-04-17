
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Asset, AllocationItem } from "./types";

export const useCreatePortfolio = () => {
  const [loading, setLoading] = useState(false);

  const createPortfolio = async (
    name: string,
    description: string,
    allocationData: AllocationItem[],
    assets: Asset[]
  ) => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to create a portfolio');
        return null;
      }

      // Create portfolio
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .insert({
          name,
          description,
          allocation_data: allocationData,
          user_id: session.session.user.id
        })
        .select()
        .single();

      if (portfolioError) throw portfolioError;

      // Create portfolio assets
      if (assets.length > 0) {
        const portfolioAssets = assets.map(asset => ({
          portfolio_id: portfolio.id,
          user_id: session.session.user.id,
          ticker: asset.ticker,
          name: asset.name,
          type: asset.type,
          price: asset.price,
          quantity: asset.quantity
        }));

        const { error: assetsError } = await supabase
          .from('portfolio_assets')
          .insert(portfolioAssets);

        if (assetsError) throw assetsError;
      }

      toast.success('Portfolio created successfully');
      return portfolio.id;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error('Error creating portfolio');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPortfolio,
    loading
  };
};
