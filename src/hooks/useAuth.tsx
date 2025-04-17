
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        // Update session and user state
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        setIsLoading(false);
        
        // Clear any cached portfolios when logging out
        if (event === 'SIGNED_OUT') {
          // Only redirect if not already on login/register page
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            navigate('/login');
          }
        }
        
        // If signed in and on auth pages, redirect to home
        if (event === 'SIGNED_IN') {
          if (window.location.pathname === '/login' || window.location.pathname === '/register') {
            toast.success("Login realizado com sucesso!");
            navigate('/');
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setIsLoading(false);
      
      if (!session && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error);
        toast.error('Erro ao fazer logout');
        return false;
      }
      
      // Clear auth state
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
      
      toast.success('Logout realizado com sucesso');
      navigate('/login');
      return true;
    } catch (err) {
      console.error('Error during logout:', err);
      toast.error('Erro ao fazer logout');
      return false;
    }
  };

  return { isAuthenticated, user, session, logout, isLoading };
};
