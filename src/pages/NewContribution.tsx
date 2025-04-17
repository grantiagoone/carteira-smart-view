
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useContributionManagement } from "@/features/contributions/hooks/useContributionManagement";
import { useContributionCalculation } from "@/features/contributions/hooks/useContributionCalculation";
import ContributionForm from "@/features/contributions/components/ContributionForm";
import AllocationSuggestions from "@/features/contributions/components/AllocationSuggestions";

const formSchema = z.object({
  portfolioId: z.string({
    required_error: "Selecione uma carteira.",
  }),
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val.replace(",", "."))) && parseFloat(val.replace(",", ".")) > 0,
    {
      message: "O valor deve ser um número positivo.",
    }
  ),
});

const NewContribution = () => {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const { userPortfolios, loading, saveContribution } = useContributionManagement();
  const { 
    suggestedAllocation, 
    selectedPortfolio, 
    selectedPortfolioName,
    calculateSuggestions
  } = useContributionCalculation();

  function onSubmit(values: z.infer<typeof formSchema>) {
    const portfolio = userPortfolios.find(p => p.id.toString() === values.portfolioId);
    const contributionAmount = parseFloat(values.amount.replace(",", "."));
    
    calculateSuggestions(values.portfolioId, contributionAmount, userPortfolios);
    setShowSuggestion(true);
  }

  const handleConfirm = async () => {
    const values = {
      portfolioId: selectedPortfolio?.id.toString() || "",
      amount: ""
    };
    
    if (selectedPortfolio) {
      // Calculate the contribution amount from the suggestions
      const totalAmount = suggestedAllocation.reduce((sum, item) => sum + item.amount, 0);
      values.amount = totalAmount.toString().replace(".", ",");
      
      await saveContribution(
        values.portfolioId,
        values.amount,
        selectedPortfolioName,
        suggestedAllocation,
        selectedPortfolio
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link to="/contributions" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar para Aportes
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">Novo Aporte</h1>
        <p className="text-muted-foreground">Registre um novo aporte e receba sugestões de alocação</p>
      </div>

      {!showSuggestion ? (
        <Card className="gradient-card max-w-2xl mx-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Informações do Aporte</h2>
            <p className="text-muted-foreground mb-6">
              Selecione a carteira e informe o valor do aporte.
            </p>
            <ContributionForm 
              userPortfolios={userPortfolios}
              loading={loading}
              onSubmit={onSubmit}
            />
          </div>
        </Card>
      ) : (
        <AllocationSuggestions
          amount={selectedPortfolio ? suggestedAllocation.reduce((sum, item) => sum + item.amount, 0).toString() : "0"}
          portfolioName={selectedPortfolioName}
          suggestions={suggestedAllocation}
          onBack={() => setShowSuggestion(false)}
          onConfirm={handleConfirm}
        />
      )}
    </DashboardLayout>
  );
};

export default NewContribution;
