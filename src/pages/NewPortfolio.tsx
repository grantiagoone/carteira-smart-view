
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome da carteira deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
});

const NewPortfolio = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Carregar carteiras existentes ou inicializar com array vazio
    const existingPortfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    
    // Criar nova carteira com ID único e dados padrão
    const newPortfolio = {
      id: Date.now(), // Usar timestamp como ID único
      name: values.name,
      description: values.description || "",
      value: 0,
      returnPercentage: 0,
      returnValue: 0,
      allocationData: [
        { name: 'Ações', value: 40, color: '#1E40AF' },
        { name: 'FIIs', value: 20, color: '#0D9488' },
        { name: 'Renda Fixa', value: 30, color: '#F59E0B' },
        { name: 'Internacional', value: 10, color: '#6B7280' }
      ]
    };
    
    // Adicionar nova carteira e salvar no localStorage
    const updatedPortfolios = [...existingPortfolios, newPortfolio];
    localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios));
    
    console.log("Nova carteira criada:", newPortfolio);
    
    toast({
      title: "Carteira criada com sucesso!",
      description: `A carteira ${values.name} foi criada.`,
    });

    // Navegar para a página de definição de estratégia
    navigate("/strategies");
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link to="/portfolios" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar para Carteiras
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">Nova Carteira</h1>
        <p className="text-muted-foreground">Crie uma nova carteira de investimentos</p>
      </div>

      <Card className="gradient-card max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Informações da Carteira</CardTitle>
          <CardDescription>
            Defina as informações básicas da sua nova carteira de investimentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Carteira</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Carteira Principal" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este será o nome exibido para identificar sua carteira.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Carteira de longo prazo para aposentadoria" {...field} />
                    </FormControl>
                    <FormDescription>
                      Uma breve descrição sobre o objetivo desta carteira.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit">Próximo: Definir Estratégia</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default NewPortfolio;
