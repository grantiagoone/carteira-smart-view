
import React, { useMemo, useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssetClassPerformanceProps {
  portfolioId?: string | null;
}

const AssetClassPerformance = ({ portfolioId }: AssetClassPerformanceProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  
  // Default mock data - Será usado como fallback caso não tenha dados
  const defaultData = useMemo(() => [
    { name: 'Ações', performance: 7.2 },
    { name: 'FIIs', performance: 4.5 },
    { name: 'Renda Fixa', performance: 9.8 },
    { name: 'Internacional', performance: -2.3 },
  ], []);
  
  // Estado para armazenar os dados reais do portfólio
  const [data, setData] = useState(defaultData);
  
  // Carrega os dados do portfólio quando o ID muda
  useEffect(() => {
    const loadPortfolioData = async () => {
      if (!portfolioId) {
        setData(defaultData);
        return;
      }
      
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (!userId) {
          setData(defaultData);
          return;
        }
        
        // Recupera os dados do portfolio do localStorage
        const storageKey = `portfolios_${userId}`;
        const savedPortfolios = localStorage.getItem(storageKey);
        
        if (savedPortfolios) {
          const portfolios = JSON.parse(savedPortfolios);
          const portfolio = portfolios.find((p: any) => p.id.toString() === portfolioId);
          
          if (portfolio && portfolio.assets && portfolio.assets.length > 0) {
            // Cria um mapa de assets por tipo
            const assetsByType = portfolio.assets.reduce((acc: any, asset: any) => {
              const assetType = asset.type || 'other';
              if (!acc[assetType]) {
                acc[assetType] = { totalValue: 0, totalReturn: 0 };
              }
              
              const assetValue = asset.price * (asset.quantity || 0);
              const assetReturn = asset.performance || 0;
              
              acc[assetType].totalValue += assetValue;
              acc[assetType].totalReturn += assetReturn * assetValue; // Retorno ponderado
              
              return acc;
            }, {});
            
            // Calcular desempenho por classe de ativo
            const typeNameMap: Record<string, string> = {
              'stock': 'Ações',
              'reit': 'FIIs',
              'fixed_income': 'Renda Fixa',
              'international': 'Internacional',
              'other': 'Outros'
            };
            
            const performanceData = Object.entries(assetsByType).map(([type, values]: [string, any]) => {
              const averageReturn = values.totalValue > 0 
                ? values.totalReturn / values.totalValue 
                : 0;
              
              return {
                name: typeNameMap[type] || type,
                performance: parseFloat(averageReturn.toFixed(2))
              };
            });
            
            setData(performanceData.length > 0 ? performanceData : defaultData);
          } else {
            setData(defaultData);
          }
        } else {
          setData(defaultData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados de desempenho:", error);
        toast.error("Erro ao carregar dados de desempenho");
        setData(defaultData);
      } finally {
        setLoading(false);
      }
    };
    
    loadPortfolioData();
  }, [portfolioId, defaultData]);

  // Process data to include color based on performance
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      // Add color property to each data point
      color: item.performance >= 0 ? "#10b981" : "#ef4444"
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value}%`}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [`${value}%`, 'Retorno']}
          labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
          contentStyle={{ 
            borderRadius: '4px', 
            padding: '8px 12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            border: '1px solid #eaeaea',
          }}
        />
        <Bar 
          dataKey="performance" 
          radius={[4, 4, 0, 0]} 
          stroke="#10b981"
          fillOpacity={1}
          fill="#10b981"
          name="Performance"
        >
          {processedData.map((entry, index) => (
            <rect 
              key={`rect-${index}`} 
              fill={entry.color} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AssetClassPerformance;
