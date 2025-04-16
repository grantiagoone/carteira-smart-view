
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A3B58] to-[#123047]">
        <div className="w-full max-w-md p-6 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl text-center">
          <h2 className="text-2xl font-bold text-white">Link inválido</h2>
          <p className="text-gray-300">Este link de recuperação é inválido ou expirou.</p>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-[#4CC38A] hover:bg-[#5CD99A] text-white"
          >
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A3B58] to-[#123047]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl">
        <div className="flex flex-col items-center space-y-2 text-center">
          <KeyRound className="h-12 w-12 text-[#4CC38A]" />
          <h2 className="text-2xl font-bold text-white">Redefinir senha</h2>
          <p className="text-gray-300">
            Digite sua nova senha abaixo.
          </p>
        </div>
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
          />
          <Input
            type="password"
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
          />
          <Button 
            type="submit" 
            className="w-full bg-[#4CC38A] hover:bg-[#5CD99A] text-white" 
            disabled={isLoading}
          >
            {isLoading ? "Redefinindo..." : "Redefinir senha"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
