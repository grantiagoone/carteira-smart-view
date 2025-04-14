
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showSuggestion, setShowSuggestion] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioId: "",
      amount: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, we would save this to a database
    console.log(values);
    
    // Show the allocation suggestion
    setShowSuggestion(true);
  }

  const handleConfirm = () => {
    toast({
      title: "Aporte realizado com sucesso!",
      description: `O aporte foi registrado e os ativos foram alocados conforme sugerido.`,
    });

    navigate("/contributions");
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
                          <SelectItem value="1">Carteira Principal</SelectItem>
                          <SelectItem value="2">Aposentadoria</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Selecione a carteira na qual você deseja realizar o aporte.
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
                <div className="flex justify-end">
                  <Button type="submit">Calcular Sugestão de Alocação</Button>
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
              Com base na sua estratégia atual, sugerimos a seguinte alocação para o seu aporte de R$ 2.000,00 na Carteira Principal
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
