import { NextRequest, NextResponse } from 'next/server';
import { stocks } from 'stock-api';

/**
 * 行情代理 API Route
 * 使用 stock-api (腾讯/新浪/东方财富自动兜底) 获取 A 股/港股/美股行情
 */

/** 将我们的内部代码转为 stock-api 格式 */
function toStockApiCode(symbol: string): string {
  // 美股：TSM -> USTSM
  if (/^[A-Z]+$/.test(symbol)) {
    return `US${symbol}`;
  }
  // 港股：0700.HK -> HK00700, 02834.HK -> HK02834
  const hkMatch = symbol.match(/^(\d+)\.HK$/);
  if (hkMatch) {
    const code = hkMatch[1].padStart(5, '0');
    return `HK${code}`;
  }
  // A 股 上海：6 位数字开头 5/6/9 -> SH
  if (/^[569]\d{5}$/.test(symbol)) {
    return `SH${symbol}`;
  }
  // A 股 深圳：6 位数字开头 0/1/2/3 -> SZ
  if (/^[0123]\d{5}$/.test(symbol)) {
    return `SZ${symbol}`;
  }
  return symbol;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const symbols: string[] = body.symbols ?? [];

    if (symbols.length === 0) {
      return NextResponse.json({ quotes: [] });
    }

    const codeMap = new Map<string, string>();
    const apiCodes: string[] = [];

    for (const sym of symbols) {
      const apiCode = toStockApiCode(sym);
      codeMap.set(apiCode, sym);
      apiCodes.push(apiCode);
    }

    const results = await stocks.auto.getStocks(apiCodes);

    const quotes = results.map((r) => {
      const originalSymbol = codeMap.get(r.code) ?? r.code;

      let currency = 'CNY';
      if (r.code.startsWith('US')) currency = 'USD';
      else if (r.code.startsWith('HK')) currency = 'HKD';

      return {
        symbol: originalSymbol,
        price: r.now ?? 0,
        currency,
        source: r.source ?? 'stock-api',
        timestamp: Date.now(),
      };
    });

    return NextResponse.json({ quotes });
  } catch (e) {
    console.error('Quote API error:', e);
    return NextResponse.json({ quotes: [], error: String(e) });
  }
}
