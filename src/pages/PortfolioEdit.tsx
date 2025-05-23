import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Portfolio, AllocationItem, allocationItemsToJson } from "@/hooks/portfolio/types";
import { Asset } from "@/services/brapiService";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { usePortfolio } from "@/hooks/usePortfolio";
import PortfolioBasicInfo from "@/components/portfolios/PortfolioBasicInfo";
import PortfolioAssets from "@/components/portfolios/PortfolioAssets";
import DeletePortfolioDialog from "@/components/portfolios/DeletePortfolioDialog";
import AllocationEditor from "@/components/portfolios/edit/AllocationEditor";
import PortfolioActions from "@/components/portfolios/edit/PortfolioActions";
import { usePortfolioEdit } from "@/hooks/portfolio/usePortfolioEdit";
import { useMemo } from "react";

const PortfolioEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    portfolio,
    loading,
    allocationItems,
    selectedAssets,
    assetQuantities,
    assetRatings,
    updateAllocationItem,
    addAllocationItem,
    handleAddAsset,
    handleRemoveAsset,
    handleUpdateQuantity,
    handleUpdateRating,
    deletePortfolio,
    deleteAllocationItem
  } = usePortfolio(id);

  const { form, onSubmit } = usePortfolioEdit(
    portfolio,
    allocationItems,
    selectedAssets,
    assetQuantities,
    assetRatings
  );

  const handleDeleteAllocation = async (index: number): Promise<boolean> => {
    if (allocationItems && index >= 0 && index < allocationItems.length) {
      const result = await deleteAllocationItem(index);
      return result !== undefined ? result : true;
    }
    return false;
  };

  const handleDeletePortfolio = async (): Promise<boolean> => {
    if (deletePortfolio) {
      const result = await deletePortfolio();
      if (result) {
        navigate('/portfolios');
        toast.success("Carteira excluída com sucesso");
      }
      return !!result;
    }
    return false;
  };

  const loadingState = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
    return null;
  }, [loading]);

  const notFoundState = useMemo(() => {
    if (!portfolio && !loading) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h2 className="text-2xl font-medium mb-2">Carteira não encontrada</h2>
          <Button asChild>
            <Link to="/portfolios">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Carteiras
            </Link>
          </Button>
        </div>
      );
    }
    return null;
  }, [portfolio, loading]);

  if (loading) {
    return (
      <DashboardLayout>
        {loadingState}
      </DashboardLayout>
    );
  }

  if (!portfolio) {
    return (
      <DashboardLayout>
        {notFoundState}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
              <Link to={`/portfolio/${id}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Editar Carteira</h1>
          </div>
          <p className="text-muted-foreground">Modifique os detalhes da sua carteira</p>
        </div>
        <DeletePortfolioDialog 
          portfolioId={id}
          onDelete={handleDeletePortfolio} 
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <PortfolioBasicInfo />
            
            <PortfolioAssets 
              selectedAssets={selectedAssets} 
              onAddAsset={handleAddAsset}
              onRemoveAsset={handleRemoveAsset}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateRating={handleUpdateRating}
              assetRatings={assetRatings}
            />
            
            <AllocationEditor 
              allocationItems={allocationItems}
              updateAllocationItem={updateAllocationItem}
              addAllocationItem={addAllocationItem}
              deleteAllocationItem={handleDeleteAllocation}
            />
            
            <PortfolioActions portfolioId={id} />
          </form>
        </FormProvider>
      </div>
    </DashboardLayout>
  );
};

export default PortfolioEdit;
