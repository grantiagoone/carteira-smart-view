
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { setBrapiToken } from "@/services/brapiService";
import { ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BrapiTokenSetting = () => {
  const [token, setToken] = useState("");
  
  useEffect(() => {
    // Load token from localStorage when component mounts
    const savedToken = localStorage.getItem('BRAPI_TOKEN') || "";
    setToken(savedToken);
  }, []);

  const handleSaveToken = () => {
    setBrapiToken(token);
    toast("Token da BRAPI salvo com sucesso!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API BRAPI</CardTitle>
        <CardDescription>
          Configure seu token para usar a API BRAPI (Brasil API para dados financeiros)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Alert>
            <AlertDescription>
              A BRAPI é uma API brasileira que fornece dados de mercado para ações, FIIs e outros investimentos. 
              A API é gratuita para uso pessoal com limites de requisições.
            </AlertDescription>
          </Alert>
          
          <p className="text-sm text-muted-foreground">
            Configure seu token da API BRAPI para obter dados de mercado atualizados.
            Você pode obter um token gratuito em <a href="https://brapi.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center">brapi.dev <ExternalLink className="ml-1 h-3 w-3" /></a>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Cole seu token BRAPI aqui"
              className="flex-1"
            />
            <Button onClick={handleSaveToken}>
              Salvar Token
            </Button>
          </div>
          
          {token && (
            <p className="text-xs text-muted-foreground mt-2">
              ✓ Token configurado
            </p>
          )}
          
          <div className="mt-4 text-sm">
            <h4 className="font-medium">Como usar:</h4>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Acesse <a href="https://brapi.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">brapi.dev</a> e crie uma conta gratuita</li>
              <li>Obtenha seu token pessoal na seção de API Keys</li>
              <li>Cole o token no campo acima e clique em Salvar Token</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrapiTokenSetting;
