
export interface BrapiAssetResponse {
  results: BrapiAsset[];
  requestedAt: string;
  took: string;
}

export interface BrapiAsset {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketChange: number;
}

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  price: number;
  type: "stock" | "reit" | "fixed_income" | "international";
  change?: number;
  quantity?: number;
}

// Função para determinar o tipo de ativo com base no ticker
const determineAssetType = (ticker: string): "stock" | "reit" | "fixed_income" | "international" => {
  // Os FIIs no Brasil geralmente terminam com "11"
  if (ticker.endsWith("11")) {
    return "reit";
  }
  
  // Ativos internacionais geralmente têm um prefixo como BDR
  if (ticker.includes("BDR") || ticker.endsWith("34")) {
    return "international";
  }

  // Ações normais (padrão)
  return "stock";
};

export async function searchAssets(query: string): Promise<Asset[]> {
  try {
    // Endpoint de busca da BRAPI
    const url = `https://brapi.dev/api/quote/list?search=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data: BrapiAssetResponse = await response.json();
    
    // Converter os dados da BRAPI para nosso formato de Asset
    const assets: Asset[] = data.results.map(item => ({
      id: item.symbol, // Usando o símbolo como ID único
      ticker: item.symbol,
      name: item.longName || item.shortName,
      price: item.regularMarketPrice,
      type: determineAssetType(item.symbol),
      change: item.regularMarketChangePercent
    }));
    
    return assets;
  } catch (error) {
    console.error("Erro ao buscar ativos:", error);
    return [];
  }
}

export async function getAssetPrice(ticker: string): Promise<number | null> {
  try {
    const url = `https://brapi.dev/api/quote/${encodeURIComponent(ticker)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results[0]) {
      return data.results[0].regularMarketPrice;
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao buscar preço para ${ticker}:`, error);
    return null;
  }
}
