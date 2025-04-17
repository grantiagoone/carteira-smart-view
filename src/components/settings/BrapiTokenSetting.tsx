
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { setBrapiToken } from "@/services/brapiService";

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
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Configure seu token da API BRAPI para obter dados de mercado atualizados.
            Você pode obter um token gratuito em <a href="https://brapi.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">brapi.dev</a>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default BrapiTokenSetting;
