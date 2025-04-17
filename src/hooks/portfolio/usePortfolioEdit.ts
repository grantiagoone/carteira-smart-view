
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Portfolio, AllocationItem } from "./types";
import { Asset } from "@/services/brapiService";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(2, "Nome da carteira deve ter pelo menos 2 caracteres"),
  value: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Valor deve ser um número positivo",
  }),
  returnPercentage: z.string().refine((val) => !isNaN(Number(val)), {
    message: "O retorno deve ser um número válido",
  }),
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
      value: portfolio?.value?.toString() || "0",
      returnPercentage: portfolio?.returnPercentage?.toString() || "0",
    },
  });

  const onSubmit = async (values: PortfolioFormValues) => {
    if (!portfolio) return;
    
    const totalAllocation = allocationItems.reduce((sum, item) => sum + item.value, 0);
    if (totalAllocation !== 100) {
      toast("A alocação total deve ser 100%");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        toast("Você precisa estar logado para salvar alterações");
        return;
      }
      
      const storageKey = `portfolios_${userId}`;
      const savedPortfolios = localStorage.getItem(storageKey);
      
      if (savedPortfolios) {
        const portfolios = JSON.parse(savedPortfolios);
        const portfolioIndex = portfolios.findIndex((p: any) => p.id === Number(portfolio.id));
        
        if (portfolioIndex !== -1) {
          let totalValue = Number(values.value);
          
          const updatedAssets = selectedAssets.map(asset => ({
            ...asset,
            quantity: assetQuantities[asset.id] || 0
          }));
          
          if (updatedAssets.some(a => a.quantity > 0)) {
            totalValue = updatedAssets.reduce((sum, asset) => {
              return sum + (asset.price * (assetQuantities[asset.id] || 0));
            }, 0);
          }
          
          portfolios[portfolioIndex] = {
            ...portfolios[portfolioIndex],
            name: values.name,
            value: totalValue,
            returnPercentage: Number(values.returnPercentage),
            returnValue: (totalValue * Number(values.returnPercentage)) / 100,
            allocationData: allocationItems,
            assets: updatedAssets,
            assetRatings: assetRatings
          };
          
          localStorage.setItem(storageKey, JSON.stringify(portfolios));
          
          toast("Carteira atualizada com sucesso");
          
          navigate(`/portfolio/${portfolio.id}`);
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar carteira:", error);
      toast("Erro ao atualizar carteira");
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
