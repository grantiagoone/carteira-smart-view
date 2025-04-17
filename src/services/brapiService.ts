
export interface BrapiAssetResponse {
  results?: BrapiAsset[];
  stocks?: BrapiAsset[];
  indexes?: any[];
  availableSectors?: string[];
  availableStockTypes?: string[];
  requestedAt?: string;
  took?: string;
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

const determineAssetType = (ticker: string): "stock" | "reit" | "fixed_income" | "international" => {
  if (ticker.endsWith("11")) {
    return "reit";
  }
  
  if (ticker.includes("BDR") || ticker.endsWith("34")) {
    return "international";
  }

  return "stock";
};

export async function searchAssets(query: string): Promise<Asset[]> {
  try {
    const token = localStorage.getItem('BRAPI_TOKEN');
    const baseUrl = `https://brapi.dev/api/quote/list?search=${encodeURIComponent(query)}`;
    const url = token ? `${baseUrl}&token=${token}` : baseUrl;
    
    console.log("Realizando busca de ativos com URL:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data: BrapiAssetResponse = await response.json();
    console.log("Resposta da API:", data);
    
    // Lidando com a nova estrutura de resposta da API
    // A API pode retornar os resultados em data.results ou data.stocks
    const apiResults = data.results || data.stocks || [];
    
    if (!apiResults.length) {
      console.log("Nenhum ativo encontrado na resposta da API");
      return [];
    }
    
    const assets: Asset[] = apiResults.map(item => ({
      id: item.symbol,
      ticker: item.symbol,
      name: item.longName || item.shortName,
      price: item.regularMarketPrice,
      type: determineAssetType(item.symbol),
      change: item.regularMarketChangePercent
    }));
    
    console.log("Assets processados:", assets);
    return assets;
  } catch (error) {
    console.error("Erro ao buscar ativos:", error);
    return [];
  }
}

export async function getAssetPrice(ticker: string): Promise<number | null> {
  try {
    const token = localStorage.getItem('BRAPI_TOKEN');
    const baseUrl = `https://brapi.dev/api/quote/${encodeURIComponent(ticker)}`;
    const url = token ? `${baseUrl}?token=${token}` : baseUrl;
    
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

export function setBrapiToken(token: string) {
  localStorage.setItem('BRAPI_TOKEN', token);
}
