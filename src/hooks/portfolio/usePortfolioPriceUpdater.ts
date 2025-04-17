import { useState, useEffect } from 'react';
import { Asset, getAssetPrice } from '@/services/brapiService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Portfolio } from './types';

// Changed the default refresh interval from 60000 (1 minute) to 10800000 (3 hours)
export const usePortfolioPriceUpdater = (refreshInterval = 10800000) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Função para atualizar os preços dos ativos em todas as carteiras
  const updateAllPortfoliosPrices = async () => {
    try {
      // Get the current authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        console.log("Usuário não autenticado");
        return false;
      }

      setIsUpdating(true);
      
      // Carregar todas as carteiras do usuário
      const storageKey = `portfolios_${userId}`;
      const savedPortfolios = localStorage.getItem(storageKey);
      
      if (!savedPortfolios) {
        setIsUpdating(false);
        return false;
      }
      
      const portfolios: Portfolio[] = JSON.parse(savedPortfolios);
      let portfoliosUpdated = false;
      
      // Atualizar cada carteira
      const updatedPortfolios = await Promise.all(
        portfolios.map(async (portfolio) => {
          if (!portfolio.assets || portfolio.assets.length === 0) {
            return portfolio;
          }
          
          // Atualizar os preços dos ativos
          const updatedAssets = await Promise.all(
            portfolio.assets.map(async (asset) => {
              try {
                const latestPrice = await getAssetPrice(asset.ticker);
                if (latestPrice !== null && latestPrice !== asset.price) {
                  portfoliosUpdated = true;
                  return {
                    ...asset,
                    price: latestPrice
                  };
                }
                return asset;
              } catch (error) {
                console.error(`Erro ao atualizar preço do ativo ${asset.ticker}:`, error);
                return asset;
              }
            })
          );
          
          // Recalcular o valor total da carteira
          const totalValue = updatedAssets.reduce((sum, asset) => {
            const assetValue = asset.quantity ? asset.price * asset.quantity : 0;
            return sum + assetValue;
          }, 0);
          
          return {
            ...portfolio,
            assets: updatedAssets,
            value: totalValue,
          };
        })
      );
      
      // Salvar carteiras atualizadas no localStorage
      if (portfoliosUpdated) {
        localStorage.setItem(storageKey, JSON.stringify(updatedPortfolios));
        setLastUpdateTime(new Date());
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erro ao atualizar preços das carteiras:", error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Atualizar preços de uma carteira específica
  const updatePortfolioPrices = async (portfolioId: string) => {
    try {
      // Get the current authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId || !portfolioId) {
        return false;
      }

      setIsUpdating(true);
      
      // Carregar todas as carteiras do usuário
      const storageKey = `portfolios_${userId}`;
      const savedPortfolios = localStorage.getItem(storageKey);
      
      if (!savedPortfolios) {
        setIsUpdating(false);
        return false;
      }
      
      const portfolios: Portfolio[] = JSON.parse(savedPortfolios);
      
      // Encontrar a carteira específica
      const portfolioIndex = portfolios.findIndex(p => p.id.toString() === portfolioId);
      
      if (portfolioIndex === -1) {
        setIsUpdating(false);
        return false;
      }
      
      const portfolio = portfolios[portfolioIndex];
      
      if (!portfolio.assets || portfolio.assets.length === 0) {
        setIsUpdating(false);
        return false;
      }
      
      // Atualizar os preços dos ativos
      let pricesUpdated = false;
      const updatedAssets = await Promise.all(
        portfolio.assets.map(async (asset) => {
          try {
            const latestPrice = await getAssetPrice(asset.ticker);
            if (latestPrice !== null && latestPrice !== asset.price) {
              pricesUpdated = true;
              return {
                ...asset,
                price: latestPrice
              };
            }
            return asset;
          } catch (error) {
            console.error(`Erro ao atualizar preço do ativo ${asset.ticker}:`, error);
            return asset;
          }
        })
      );
      
      if (!pricesUpdated) {
        setIsUpdating(false);
        return false;
      }
      
      // Recalcular o valor total da carteira
      const totalValue = updatedAssets.reduce((sum, asset) => {
        const assetValue = asset.quantity ? asset.price * asset.quantity : 0;
        return sum + assetValue;
      }, 0);
      
      // Atualizar a carteira
      portfolios[portfolioIndex] = {
        ...portfolio,
        assets: updatedAssets,
        value: totalValue,
      };
      
      // Salvar carteiras atualizadas no localStorage
      localStorage.setItem(storageKey, JSON.stringify(portfolios));
      setLastUpdateTime(new Date());
      return true;
    } catch (error) {
      console.error("Erro ao atualizar preços da carteira:", error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    lastUpdateTime,
    updateAllPortfoliosPrices,
    updatePortfolioPrices
  };
};
