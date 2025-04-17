
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Portfolio, AllocationItem, allocationItemsToJson } from "./types";
import { Asset } from "@/services/brapiService";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(2, "Nome da carteira deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
});

export type PortfolioFormValues = z.infer<typeof formSchema>;

export const usePortfolioEdit = (
  portfolio: Portfolio | null,
  allocationItems: AllocationItem[],
  selectedAssets: Asset[],
  assetQuantities: Record<string, number>,
  assetRatings: Record<string, number>
) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: portfolio?.name || "",
      description: "",
    },
  });

  const onSubmit = async (values: PortfolioFormValues) => {
    if (!portfolio) return;
    
    const totalAllocation = allocationItems.reduce((sum, item) => sum + item.value, 0);
    if (totalAllocation !== 100) {
      toast.error("A alocação total deve ser 100%");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Você precisa estar logado para salvar alterações");
        return;
      }

      // Update portfolio data in Supabase
      const { error: portfolioError } = await supabase
        .from('portfolios')
        .update({
          name: values.name,
          allocation_data: allocationItemsToJson(allocationItems),
          updated_at: new Date().toISOString()
        })
        .eq('id', String(portfolio.id)); // Ensure portfolio.id is cast to string

      if (portfolioError) throw portfolioError;

      // Handle assets
      if (selectedAssets.length > 0) {
        // First delete all existing assets for this portfolio
        const { error: deleteError } = await supabase
          .from('portfolio_assets')
          .delete()
          .eq('portfolio_id', String(portfolio.id)); // Ensure portfolio.id is cast to string

        if (deleteError) throw deleteError;

        // Then insert the updated assets
        const portfolioAssets = selectedAssets.map(asset => ({
          portfolio_id: String(portfolio.id), // Ensure portfolio.id is cast to string
          user_id: session.session.user.id,
          ticker: asset.ticker,
          name: asset.name,
          type: asset.type,
          price: asset.price,
          quantity: assetQuantities[asset.id] || 0
        }));

        const { error: insertError } = await supabase
          .from('portfolio_assets')
          .insert(portfolioAssets);

        if (insertError) throw insertError;
      }
      
      toast.success("Carteira atualizada com sucesso");
      navigate(`/portfolio/${portfolio.id}`);
    } catch (error) {
      console.error("Erro ao atualizar carteira:", error);
      toast.error("Erro ao atualizar carteira");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    onSubmit
  };
};
