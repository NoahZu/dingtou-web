// 核心数据类型定义

export type Market = 'HK' | 'US' | 'CN';
export type Currency = 'HKD' | 'USD' | 'CNY';
export type Account = 'futu' | 'xueqiu' | 'webank';
export type HoldingCategory = 'dca' | 'value' | 'dividend' | 'legacy';
export type PoolName = 'emergency' | 'crash_ammo' | 'dividend_pool' | 'futu_usd';
export type TransactionType =
  | 'dca'
  | 'trigger_buy'
  | 'accumulator_buy'
  | 'value_add'
  | 'reduce'
  | 'dividend';

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  market: Market;
  category: HoldingCategory;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  currency: Currency;
  account: Account;
  lotSize: number;
}

export interface TriggerThreshold {
  minYield?: number;
  maxYield?: number;
  minPrice?: number;
  maxPrice?: number;
  drawdownPct?: number;
  action: 'hold' | 'add' | 'double' | 'heavy' | 'no_add' | 'reduce';
  amountCNY: number;
  label: string;
}

export interface TriggerRule {
  symbol: string;
  name: string;
  type: 'dividend_yield' | 'price' | 'index_drawdown' | 'price_reduce';
  annualDividend?: number;
  currency?: Currency;
  needAccumulate?: boolean;
  thresholds: TriggerThreshold[];
}

export interface AccumulatorAccount {
  id: string;
  symbol: string;
  name: string;
  lotSize: number;
  lotValueCNY: number;
  accumulatedCNY: number;
  lastTriggeredAt: string | null;
  lastBoughtAt: string | null;
  history: AccumulatorEntry[];
}

export interface AccumulatorEntry {
  date: string;
  amount: number;
  action: 'add' | 'buy';
  note?: string;
}

export interface Pool {
  name: PoolName;
  label: string;
  balance: number;
  currency: Currency;
  initialBalance: number;
  warningThreshold: number;
  locked: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  symbol: string;
  name: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  fee: number;
  currency: Currency;
  account: Account;
  poolFrom?: PoolName;
  note?: string;
}

export interface PoolTransfer {
  id: string;
  date: string;
  from: PoolName | 'external';
  to: PoolName | 'external';
  amount: number;
  currency: Currency;
  note: string;
}

export interface DCAExecution {
  id: string;
  month: string; // YYYY-MM
  executedAt: string;
  items: DCAExecutionItem[];
  totalAmount: number;
}

export interface DCAExecutionItem {
  symbol: string;
  name: string;
  amount: number;
  price: number;
  quantity: number;
}

export type ReviewPeriod = 'monthly' | 'quarterly' | 'yearly';

export interface Review {
  id: string;
  period: ReviewPeriod;
  label: string;       // "2026-06" / "2026-Q2" / "2026"
  createdAt: string;
  totalAssets?: number;
  marketValue?: number;
  cashTotal?: number;
  notes: string;       // markdown 自由文本（心理日记 / 复盘内容）
  checklist: string[];  // 已勾选的检查项 id
}

export interface ExchangeRates {
  USDCNY: number;
  HKDCNY: number;
}

export interface NetWorthSnapshot {
  date: string;       // YYYY-MM-DD
  marketValue: number; // 证券市值 (CNY)
  cashTotal: number;   // 现金合计 (CNY)
  totalAssets: number;  // 总资产 (CNY)
  breakdown: {
    dca: number;
    value: number;
    dividend: number;
    legacy: number;
    cash: number;
  };
}

export interface AppState {
  holdings: Holding[];
  transactions: Transaction[];
  pools: Pool[];
  accumulators: AccumulatorAccount[];
  poolTransfers: PoolTransfer[];
  dcaExecutions: DCAExecution[];
  reviews: Review[];
  netWorthHistory: NetWorthSnapshot[];
  exchangeRates: ExchangeRates;
  initialized: boolean;
}
