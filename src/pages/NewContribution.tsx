import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAllPortfoliosFromStorage } from "@/hooks/portfolio/portfolioUtils";
import { AllocationItem } from "@/hooks/portfolio/types";

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

interface Portfolio {
  id: number;
  name: string;
  allocationData?: AllocationItem[];
  assets?: any[];
  assetRatings?: Record<string, number>;
}

interface AssetSuggestion {
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

const NewContribution = () => {
  const navigate = useNavigate();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [userPortfolios, setUserPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortfolioName, setSelectedPortfolioName] = useState("");
  const [suggestedAllocation, setSuggestedAllocation] = useState<AssetSuggestion[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioId: "",
      amount: "",
    },
  });

  useEffect(() => {
    const loadUserPortfolios = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (userId) {
          const portfolios = getAllPortfoliosFromStorage(userId);
          setUserPortfolios(portfolios.map(p => ({ 
            id: p.id, 
            name: p.name, 
            allocationData: p.allocationData,
            assets: p.assets,
            assetRatings: p.assetRatings
          })));
        }
      } catch (error) {
        console.error("Error loading portfolios:", error);
        toast.error("Erro ao carregar carteiras");
      } finally {
        setLoading(false);
      }
    };

    loadUserPortfolios();
  }, []);

  const calculateSuggestions = (portfolioId: string, amount: number) => {
    const portfolio = userPortfolios.find(p => p.id.toString() === portfolioId);
    if (!portfolio) return [];
    
    setSelectedPortfolio(portfolio);

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
    
    return suggestions.sort((a, b) => b.amount - a.amount);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const portfolio = userPortfolios.find(p => p.id.toString() === values.portfolioId);
    setSelectedPortfolioName(portfolio?.name || "");
    
    const contributionAmount = parseFloat(values.amount.replace(",", "."));
    const calculatedSuggestions = calculateSuggestions(values.portfolioId, contributionAmount);
    
    setSuggestedAllocation(calculatedSuggestions);
    setShowSuggestion(true);
  }

  const handleConfirm = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para registrar um aporte");
        return;
      }
      
      const values = form.getValues();
      const portfolioId = values.portfolioId;
      const amount = values.amount.replace(",", ".");
      
      const newContribution = {
        id: Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        portfolio: selectedPortfolioName,
        portfolioId: parseInt(portfolioId),
        amount: parseFloat(amount).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        status: "Concluído",
        allocations: suggestedAllocation.map(item => ({
          asset: item.ticker || item.asset,
          class: item.class,
          value: item.amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
          quantity: item.quantity || 0
        }))
      };
      
      const storageKey = `contributions_${userId}`;
      const existingContributions = localStorage.getItem(storageKey);
      let contributions = [];
      
      if (existingContributions) {
        contributions = JSON.parse(existingContributions);
      }
      
      contributions.push(newContribution);
      localStorage.setItem(storageKey, JSON.stringify(contributions));
      
      if (selectedPortfolio && selectedPortfolio.assets) {
        const updatedPortfolio = {...selectedPortfolio};
        
        suggestedAllocation.forEach(suggestion => {
          if (suggestion.ticker && suggestion.quantity) {
            const assetIndex = updatedPortfolio.assets.findIndex(a => a.ticker === suggestion.ticker);
            if (assetIndex !== -1) {
              updatedPortfolio.assets[assetIndex].quantity += suggestion.quantity;
            }
          }
        });
        
        const portfolios = getAllPortfoliosFromStorage(userId);
        const portfolioIndex = portfolios.findIndex(p => p.id.toString() === updatedPortfolio.id.toString());
        
        if (portfolioIndex !== -1) {
          portfolios[portfolioIndex] = updatedPortfolio;
          localStorage.setItem(`portfolios_${userId}`, JSON.stringify(portfolios));
        }
      }
      
      toast.success("Aporte realizado com sucesso!", {
        description: "O aporte foi registrado e os ativos foram alocados conforme sugerido."
      });
  
      navigate("/contributions");
    } catch (error) {
      console.error("Erro ao salvar aporte:", error);
      toast.error("Erro ao salvar aporte");
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
          <CardHeader>
            <CardTitle>Informações do Aporte</CardTitle>
            <CardDescription>
              Selecione a carteira e informe o valor do aporte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="portfolioId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carteira</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma carteira" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userPortfolios.length > 0 ? (
                            userPortfolios.map((portfolio) => (
                              <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
                                {portfolio.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-portfolios" disabled>
                              Nenhuma carteira encontrada
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {userPortfolios.length > 0 
                          ? "Selecione a carteira na qual você deseja realizar o aporte."
                          : (
                            <div className="text-amber-600">
                              Você ainda não possui carteiras. {" "}
                              <Link to="/portfolio/new" className="underline font-medium">
                                Criar uma carteira
                              </Link>
                            </div>
                          )
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Aporte (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: 1000,00" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9,]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Informe o valor total que deseja aportar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-between">
                  <Button type="button" variant="outline" asChild>
                    <Link to="/contributions">Cancelar</Link>
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={userPortfolios.length === 0 || loading}
                  >
                    {loading ? "Carregando..." : "Calcular Sugestão de Alocação"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="gradient-card max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle>Sugestão de Alocação Inteligente</CardTitle>
            <CardDescription>
              Com base na sua estratégia atual e nas diferenças entre alocação atual e desejada, 
              sugerimos a seguinte alocação para o seu aporte de{' '}
              {parseFloat(form.getValues().amount.replace(',', '.')).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}{' '}
              na {selectedPortfolioName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {suggestedAllocation.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-card p-4 rounded-md border shadow-sm"
                  style={{ borderLeft: `4px solid ${item.classColor || '#cbd5e0'}` }}
                >
                  <div className="mb-1 text-sm font-medium text-muted-foreground">{item.class}</div>
                  <div className="text-lg font-bold text-foreground">{item.ticker || item.asset}</div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                    <span className="font-medium text-primary">
                      {item.amount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                    </span>
                  </div>
                  {item.quantity !== undefined && (
                    <div className="mt-2 pt-2 border-t border-border flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Quantidade a comprar:</span>
                      <span className="font-bold">{item.quantity} cotas</span>
                    </div>
                  )}
                  {(item.currentPercentage !== undefined && item.targetPercentage !== undefined) && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Atual:</span>
                        <span>{item.currentPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Após aporte:</span>
                        <span>{item.targetPercentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowSuggestion(false)}>
              Voltar e Ajustar
            </Button>
            <Button onClick={handleConfirm}>
              Confirmar Alocação
            </Button>
          </CardFooter>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default NewContribution;
