/**
 * 行情数据统一封装
 * 后端使用 stock-api（腾讯/新浪/东方财富自动兜底）
 * 前端通过 /api/quotes 代理调用，避免 CORS
 * 如需更换数据源只需修改 /api/quotes/route.ts
 */

export interface QuoteResult {
  symbol: string;
  price: number;
  currency: string;
  source: string;
  timestamp: number;
}

export async function fetchQuotes(symbols: string[]): Promise<QuoteResult[]> {
  try {
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols }),
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    return data.quotes ?? [];
  } catch (e) {
    console.warn('Quote fetch failed, fallback to manual input', e);
    return [];
  }
}
