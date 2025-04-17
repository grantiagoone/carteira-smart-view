
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Portfolio } from "@/hooks/portfolio/types";

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

type ContributionFormProps = {
  userPortfolios: Portfolio[];
  loading: boolean;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
};

export const ContributionForm = ({ userPortfolios, loading, onSubmit }: ContributionFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioId: "",
      amount: "",
    },
  });

  return (
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
  );
};

export default ContributionForm;
