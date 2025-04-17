
export interface BrapiAssetResponse {
  results?: BrapiAsset[];
  stocks?: BrapiStockItem[];
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

// Interface para o formato de item de ação na resposta da API
export interface BrapiStockItem {
  stock: string;
  name: string;
  close: number;
  change: number;
  sector: string;
  type: string;
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

// URL base da API BRAPI
const BASE_URL = "https://brapi.dev/api";

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
    
    // Formato correto da URL conforme a documentação da BRAPI
    const url = `${BASE_URL}/quote/list?search=${encodeURIComponent(query)}${token ? `&token=${token}` : ''}`;
    
    console.log("Realizando busca de ativos com URL:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data: BrapiAssetResponse = await response.json();
    console.log("Resposta da API:", data);
    
    // Tratamento para diferentes formatos de resposta da API
    let assets: Asset[] = [];
    
    // Tratamento para o formato results (formato antigo da API)
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      assets = data.results.map(item => ({
        id: item.symbol,
        ticker: item.symbol,
        name: item.longName || item.shortName,
        price: item.regularMarketPrice,
        type: determineAssetType(item.symbol),
        change: item.regularMarketChangePercent
      }));
    } 
    // Tratamento para o formato stocks (novo formato da API)
    else if (data.stocks && Array.isArray(data.stocks) && data.stocks.length > 0) {
      assets = data.stocks.map(item => ({
        id: item.stock,
        ticker: item.stock,
        name: item.name,
        price: item.close,
        type: determineAssetType(item.stock),
        change: item.change
      }));
    }
    
    if (assets.length === 0) {
      console.log("Nenhum ativo encontrado na resposta da API");
      return [];
    }
    
    console.log("Assets processados:", assets);
    return assets;
  } catch (error) {
    console.error("Erro ao buscar ativos:", error);
    throw error;
  }
}

export async function getAssetPrice(ticker: string): Promise<number | null> {
  try {
    const token = localStorage.getItem('BRAPI_TOKEN');
    
    // Formato correto da URL conforme a documentação da BRAPI
    const url = `${BASE_URL}/quote/${encodeURIComponent(ticker)}${token ? `?token=${token}` : ''}`;
    
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
