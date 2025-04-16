
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Trash, X } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AllocationItem {
  name: string;
  value: number;
  color: string;
}

interface Portfolio {
  id: number;
  name: string;
  value: number;
  returnPercentage: number;
  returnValue: number;
  allocationData: AllocationItem[];
}

const formSchema = z.object({
  name: z.string().min(2, "Nome da carteira deve ter pelo menos 2 caracteres"),
  value: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Valor deve ser um número positivo",
  }),
  returnPercentage: z.string().refine((val) => !isNaN(Number(val)), {
    message: "O retorno deve ser um número válido",
  }),
});

const PortfolioEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [allocationItems, setAllocationItems] = useState<AllocationItem[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: "0",
      returnPercentage: "0",
    },
  });

  useEffect(() => {
    const fetchPortfolio = () => {
      setLoading(true);
      try {
        const savedPortfolios = localStorage.getItem('portfolios');
        if (savedPortfolios) {
          const portfolios: Portfolio[] = JSON.parse(savedPortfolios);
          const foundPortfolio = portfolios.find(p => p.id === Number(id));
          
          if (foundPortfolio) {
            setPortfolio(foundPortfolio);
            setAllocationItems([...foundPortfolio.allocationData]);
            
            // Populate form with portfolio data
            form.reset({
              name: foundPortfolio.name,
              value: foundPortfolio.value.toString(),
              returnPercentage: foundPortfolio.returnPercentage.toString(),
            });
          } else {
            toast({
              title: "Carteira não encontrada",
              description: "A carteira solicitada não foi encontrada",
              variant: "destructive"
            });
            navigate("/portfolios");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar carteira:", error);
        toast({
          title: "Erro ao carregar carteira",
          description: "Ocorreu um erro ao tentar carregar os dados da carteira",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPortfolio();
    }
  }, [id, navigate, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!portfolio) return;
    
    try {
      const savedPortfolios = localStorage.getItem('portfolios');
      if (savedPortfolios) {
        const portfolios: Portfolio[] = JSON.parse(savedPortfolios);
        const portfolioIndex = portfolios.findIndex(p => p.id === Number(id));
        
        if (portfolioIndex !== -1) {
          // Update the portfolio
          portfolios[portfolioIndex] = {
            ...portfolios[portfolioIndex],
            name: values.name,
            value: Number(values.value),
            returnPercentage: Number(values.returnPercentage),
            returnValue: (Number(values.value) * Number(values.returnPercentage)) / 100,
            allocationData: allocationItems,
          };
          
          localStorage.setItem('portfolios', JSON.stringify(portfolios));
          
          toast({
            title: "Carteira atualizada",
            description: "As alterações foram salvas com sucesso",
          });
          
          navigate(`/portfolio/${id}`);
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar carteira:", error);
      toast({
        title: "Erro ao atualizar carteira",
        description: "Ocorreu um erro ao tentar salvar as alterações",
        variant: "destructive"
      });
    }
  };

  const deletePortfolio = () => {
    try {
      const savedPortfolios = localStorage.getItem('portfolios');
      if (savedPortfolios) {
        const portfolios: Portfolio[] = JSON.parse(savedPortfolios);
        const updatedPortfolios = portfolios.filter(p => p.id !== Number(id));
        localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios));
        
        toast({
          title: "Carteira excluída",
          description: "A carteira foi excluída com sucesso",
        });
        
        navigate("/portfolios");
      }
    } catch (error) {
      console.error("Erro ao excluir carteira:", error);
      toast({
        title: "Erro ao excluir carteira",
        description: "Ocorreu um erro ao tentar excluir a carteira",
        variant: "destructive"
      });
    }
  };

  const updateAllocationItem = (index: number, field: keyof AllocationItem, value: string | number) => {
    const newItems = [...allocationItems];
    
    if (field === "value") {
      // Ensure value is a number
      newItems[index][field] = Number(value);
    } else {
      // For name and color, value will be a string
      newItems[index][field] = value as string;
    }
    
    setAllocationItems(newItems);
  };

  const removeAllocationItem = (index: number) => {
    setAllocationItems(allocationItems.filter((_, i) => i !== index));
  };

  const addAllocationItem = () => {
    const newItem: AllocationItem = {
      name: "Nova Classe",
      value: 0,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
    };
    
    setAllocationItems([...allocationItems, newItem]);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!portfolio) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h2 className="text-2xl font-medium mb-2">Carteira não encontrada</h2>
          <Button asChild>
            <Link to="/portfolios">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Carteiras
            </Link>
          </Button>
        </div>
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4 sm:mt-0">
              <Trash className="mr-2 h-4 w-4" />
              Excluir Carteira
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente a carteira
                e todos os seus dados associados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={deletePortfolio} className="bg-destructive text-destructive-foreground">
                Sim, excluir carteira
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Carteira</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da Carteira" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Total (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="returnPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retorno (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Alocação</CardTitle>
                <Button type="button" variant="outline" onClick={addAllocationItem}>
                  Adicionar Classe de Ativo
                </Button>
              </CardHeader>
              <CardContent>
                {allocationItems.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Nenhuma alocação definida</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addAllocationItem}
                      className="mt-2"
                    >
                      Adicionar Classe de Ativo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allocationItems.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-md"
                        style={{ borderLeft: `4px solid ${item.color}` }}
                      >
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <FormLabel className="text-xs">Nome</FormLabel>
                            <Input 
                              value={item.name} 
                              onChange={(e) => updateAllocationItem(index, "name", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <FormLabel className="text-xs">Alocação (%)</FormLabel>
                            <Input 
                              type="number" 
                              value={item.value} 
                              onChange={(e) => updateAllocationItem(index, "value", e.target.value)}
                              min="0" 
                              max="100"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <FormLabel className="text-xs">Cor</FormLabel>
                            <div className="flex items-center mt-1 gap-2">
                              <Input 
                                type="color" 
                                value={item.color} 
                                onChange={(e) => updateAllocationItem(index, "color", e.target.value)}
                                className="w-12 h-8 p-0 cursor-pointer"
                              />
                              <Input 
                                type="text" 
                                value={item.color} 
                                onChange={(e) => updateAllocationItem(index, "color", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeAllocationItem(index)}
                          className="min-w-[40px]"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link to={`/portfolio/${id}`}>Cancelar</Link>
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default PortfolioEdit;
