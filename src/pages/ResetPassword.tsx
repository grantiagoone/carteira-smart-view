
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { KeyRound } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário acessou esta página a partir de um link de recuperação válido
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setIsValidLink(false);
        toast.error('Link de recuperação inválido ou expirado');
      }
    };
    
    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    
    setIsLoading(false);
    
    if (error) {
      toast.error('Erro ao redefinir senha');
      console.error(error);
    } else {
      toast.success('Senha redefinida com sucesso!');
      navigate('/login');
    }
  };

  if (!isValidLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-6 space-y-6 bg-card rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold">Link inválido</h2>
          <p className="text-muted-foreground">Este link de recuperação é inválido ou expirou.</p>
          <Button onClick={() => navigate('/login')}>Voltar para o login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="flex flex-col items-center space-y-2 text-center">
          <KeyRound className="h-10 w-10 text-primary" />
          <h2 className="text-2xl font-bold">Redefinir senha</h2>
          <p className="text-sm text-muted-foreground">
            Digite sua nova senha abaixo.
          </p>
        </div>
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Confirmar senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Redefinindo..." : "Redefinir senha"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
