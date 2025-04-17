
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
    
    // Handle new API response structure - the API returns a 'stocks' property
    // for stock searches and may use different fields for other asset types
    let apiResults: BrapiAsset[] = [];
    
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      apiResults = data.results;
    } else if (data.stocks && Array.isArray(data.stocks) && data.stocks.length > 0) {
      // Convert the new API format to match our expected format
      apiResults = data.stocks.map(stock => ({
        symbol: stock.stock || "",
        shortName: stock.name || "",
        longName: stock.name || "",
        currency: "BRL",
        regularMarketPrice: stock.close || 0,
        regularMarketChangePercent: stock.change || 0,
        regularMarketChange: 0
      }));
    }
    
    if (!apiResults || apiResults.length === 0) {
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
    throw error; // Re-throw to allow for proper error handling in components
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
