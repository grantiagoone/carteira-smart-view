
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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getAllPortfoliosFromStorage } from "@/hooks/portfolio/portfolioUtils";
import { toast } from "sonner";

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
}

const NewContribution = () => {
  const { toast: useToastFn } = useToast();
  const navigate = useNavigate();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [userPortfolios, setUserPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortfolioName, setSelectedPortfolioName] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioId: "",
      amount: "",
    },
  });

  // Load user portfolios on component mount
  useEffect(() => {
    const loadUserPortfolios = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (userId) {
          // Load portfolios for the current user
          const portfolios = getAllPortfoliosFromStorage(userId);
          setUserPortfolios(portfolios.map(p => ({ id: p.id, name: p.name })));
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Find the selected portfolio name for display
    const selectedPortfolio = userPortfolios.find(p => p.id.toString() === values.portfolioId);
    setSelectedPortfolioName(selectedPortfolio?.name || "");
    
    // Format the amount for display
    const formattedAmount = parseFloat(values.amount.replace(",", ".")).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    // Save to state for the next screen
    console.log(values);
    
    // Show the allocation suggestion
    setShowSuggestion(true);
  }

  const handleConfirm = async () => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para registrar um aporte");
        return;
      }
      
      // Get form values
      const values = form.getValues();
      const portfolioId = values.portfolioId;
      const amount = values.amount.replace(",", ".");
      
      // Create contribution object
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
          asset: item.asset,
          class: item.class,
          value: item.amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })
        }))
      };
      
      // Save to localStorage
      const storageKey = `contributions_${userId}`;
      const existingContributions = localStorage.getItem(storageKey);
      let contributions = [];
      
      if (existingContributions) {
        contributions = JSON.parse(existingContributions);
      }
      
      contributions.push(newContribution);
      localStorage.setItem(storageKey, JSON.stringify(contributions));
      
      toast({
        title: "Aporte realizado com sucesso!",
        description: `O aporte foi registrado e os ativos foram alocados conforme sugerido.`,
      });
  
      navigate("/contributions");
    } catch (error) {
      console.error("Erro ao salvar aporte:", error);
      toast.error("Erro ao salvar aporte");
    }
  };

  // Dummy data for suggested allocation
  const suggestedAllocation = [
    { asset: "PETR4", class: "Ações", percentage: 15, amount: 300 },
    { asset: "ITSA4", class: "Ações", percentage: 10, amount: 200 },
    { asset: "MXRF11", class: "FIIs", percentage: 12.5, amount: 250 },
    { asset: "KNRI11", class: "FIIs", percentage: 12.5, amount: 250 },
    { asset: "Tesouro IPCA+", class: "Renda Fixa", percentage: 15, amount: 300 },
    { asset: "CDB", class: "Renda Fixa", percentage: 15, amount: 300 },
    { asset: "IVVB11", class: "Internacional", percentage: 10, amount: 200 },
    { asset: "GOLD11", class: "Internacional", percentage: 10, amount: 200 },
  ];

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
                            // Format the input to handle currency
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
        <Card className="gradient-card max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Sugestão de Alocação</CardTitle>
            <CardDescription>
              Com base na sua estratégia atual, sugerimos a seguinte alocação para o seu aporte de{' '}
              {parseFloat(form.getValues().amount.replace(',', '.')).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}{' '}
              na {selectedPortfolioName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {suggestedAllocation.map((item, index) => (
                <div key={index} className="bg-card p-4 rounded-md border shadow-sm">
                  <div className="mb-1 text-sm font-medium text-muted-foreground">{item.class}</div>
                  <div className="text-lg font-bold text-foreground">{item.asset}</div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                    <span className="font-medium text-primary">R$ {item.amount},00</span>
                  </div>
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
