/**
 * 策略配置 —— 所有业务规则均从 investment-plan-v1.1.md 提取
 * 文档升级时只需修改此文件即可同步更新全系统
 */

import type {
  Holding,
  TriggerRule,
  Pool,
  AccumulatorAccount,
  ExchangeRates,
} from '@/lib/types';
import { v4 as uuid } from 'uuid';

// ========== 汇率（见文档，可配置） ==========
export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  USDCNY: 6.7857,
  HKDCNY: 0.8664,
};

// ========== 定投计划（文档 3.1 节） ==========
export const DCA_PLAN = [
  { symbol: '02834.HK', name: '纳斯达克100 ETF', amount: 5000, pct: 33 },
  { symbol: '03140.HK', name: '标普500 ETF', amount: 4000, pct: 27 },
  { symbol: '02800.HK', name: '盈富基金', amount: 3000, pct: 20 },
  { symbol: '510300', name: '沪深300 ETF', amount: 2000, pct: 13 },
  { symbol: 'CASH', name: '现金留存', amount: 1000, pct: 7 },
] as const;

export const MONTHLY_DCA_TOTAL = 15000;

// ========== 初始持仓数据（文档 2.1 节） ==========
export function getInitialHoldings(): Holding[] {
  return [
    // 富途 - 价值仓
    {
      id: uuid(), symbol: 'TSM', name: '台积电', market: 'US',
      category: 'value', quantity: 24, avgCost: 249.40, currentPrice: 0,
      currency: 'USD', account: 'futu', lotSize: 1,
    },
    {
      id: uuid(), symbol: 'GOOGL', name: '谷歌-A', market: 'US',
      category: 'value', quantity: 23, avgCost: 262.58, currentPrice: 0,
      currency: 'USD', account: 'futu', lotSize: 1,
    },
    {
      id: uuid(), symbol: 'AAPL', name: '苹果', market: 'US',
      category: 'value', quantity: 10, avgCost: 204.00, currentPrice: 0,
      currency: 'USD', account: 'futu', lotSize: 1,
    },
    // 雪球 - 存量仓
    {
      id: uuid(), symbol: '0700.HK', name: '腾讯控股', market: 'HK',
      category: 'legacy', quantity: 600, avgCost: 540.978, currentPrice: 0,
      currency: 'HKD', account: 'xueqiu', lotSize: 100,
    },
    // 雪球 - 收息仓
    {
      id: uuid(), symbol: '0883.HK', name: '中国海洋石油', market: 'HK',
      category: 'dividend', quantity: 3000, avgCost: 24.281, currentPrice: 0,
      currency: 'HKD', account: 'xueqiu', lotSize: 1000,
    },
    {
      id: uuid(), symbol: '0941.HK', name: '中国移动', market: 'HK',
      category: 'dividend', quantity: 1500, avgCost: 80.833, currentPrice: 0,
      currency: 'HKD', account: 'xueqiu', lotSize: 500,
    },
    // 雪球 - 存量仓
    {
      id: uuid(), symbol: '513300', name: '纳指ETF(A股)', market: 'CN',
      category: 'legacy', quantity: 17300, avgCost: 2.0103, currentPrice: 0,
      currency: 'CNY', account: 'xueqiu', lotSize: 100,
    },
  ];
}

// ========== 初始资金池（文档 6 节） ==========
export function getInitialPools(): Pool[] {
  return [
    {
      name: 'emergency', label: '应急金',
      balance: 100000, currency: 'CNY',
      initialBalance: 100000, warningThreshold: 100000, locked: true,
    },
    {
      name: 'crash_ammo', label: '暴跌弹药池',
      balance: 80000, currency: 'CNY',
      initialBalance: 80000, warningThreshold: 20000, locked: false,
    },
    {
      name: 'dividend_pool', label: '收息股加仓池',
      balance: 120000, currency: 'CNY',
      initialBalance: 120000, warningThreshold: 30000, locked: false,
    },
    {
      name: 'futu_usd', label: '富途美元池',
      balance: 15122, currency: 'USD',
      initialBalance: 15122, warningThreshold: 2000, locked: false,
    },
  ];
}

// ========== 初始累积账户（文档 4.5 节） ==========
export function getInitialAccumulators(): AccumulatorAccount[] {
  return [
    {
      id: uuid(), symbol: '0883.HK', name: '中国海洋石油',
      lotSize: 1000, lotValueCNY: 22750,
      accumulatedCNY: 0, lastTriggeredAt: null, lastBoughtAt: null, history: [],
    },
    {
      id: uuid(), symbol: '0941.HK', name: '中国移动',
      lotSize: 500, lotValueCNY: 37580,
      accumulatedCNY: 0, lastTriggeredAt: null, lastBoughtAt: null, history: [],
    },
    {
      id: uuid(), symbol: '1088.HK', name: '中国神华',
      lotSize: 500, lotValueCNY: 16460,
      accumulatedCNY: 0, lastTriggeredAt: null, lastBoughtAt: null, history: [],
    },
  ];
}

// ========== 收息股触发规则（文档 4.3 节） ==========
export const DIVIDEND_TRIGGERS: TriggerRule[] = [
  {
    symbol: '0883.HK', name: '中国海洋石油',
    type: 'dividend_yield', annualDividend: 1.40, currency: 'HKD',
    needAccumulate: true,
    thresholds: [
      { maxYield: 5, minPrice: 28, action: 'no_add', amountCNY: 0, label: '❌ 不加' },
      { minYield: 5, maxYield: 6, minPrice: 23, maxPrice: 28, action: 'hold', amountCNY: 0, label: '🟡 持有' },
      { minYield: 6, maxYield: 7, minPrice: 20, maxPrice: 23, action: 'add', amountCNY: 10000, label: '✅ 加仓' },
      { minYield: 7, maxYield: 8, minPrice: 17, maxPrice: 20, action: 'double', amountCNY: 20000, label: '✅✅ 加倍' },
      { minYield: 8, maxPrice: 17, action: 'heavy', amountCNY: 30000, label: '🔥 重仓' },
    ],
  },
  {
    symbol: '0941.HK', name: '中国移动',
    type: 'dividend_yield', annualDividend: 5.00, currency: 'HKD',
    needAccumulate: true,
    thresholds: [
      { maxYield: 5.5, minPrice: 90, action: 'no_add', amountCNY: 0, label: '❌ 不加' },
      { minYield: 5.5, maxYield: 6.5, minPrice: 77, maxPrice: 90, action: 'hold', amountCNY: 0, label: '🟡 持有' },
      { minYield: 6.5, maxYield: 7.5, minPrice: 67, maxPrice: 77, action: 'add', amountCNY: 10000, label: '✅ 加仓' },
      { minYield: 7.5, maxYield: 8.5, minPrice: 59, maxPrice: 67, action: 'double', amountCNY: 20000, label: '✅✅ 加倍' },
      { minYield: 8.5, maxPrice: 59, action: 'heavy', amountCNY: 30000, label: '🔥 重仓' },
    ],
  },
  {
    symbol: '0939.HK', name: '建设银行',
    type: 'dividend_yield', annualDividend: 0.40, currency: 'HKD',
    needAccumulate: false, // 门槛低，触发即买
    thresholds: [
      { maxYield: 6, minPrice: 6.7, action: 'no_add', amountCNY: 0, label: '❌ 不加' },
      { minYield: 6, maxYield: 7, minPrice: 5.7, maxPrice: 6.7, action: 'hold', amountCNY: 0, label: '🟡 持有' },
      { minYield: 7, maxYield: 8, minPrice: 5.0, maxPrice: 5.7, action: 'add', amountCNY: 6000, label: '✅ 加仓(1手)' },
      { minYield: 8, maxYield: 9, minPrice: 4.4, maxPrice: 5.0, action: 'double', amountCNY: 12000, label: '✅✅ 加倍(2手)' },
      { minYield: 9, maxPrice: 4.4, action: 'heavy', amountCNY: 18000, label: '🔥 重仓(3手)' },
    ],
  },
  {
    symbol: '1088.HK', name: '中国神华',
    type: 'dividend_yield', annualDividend: 2.80, currency: 'HKD',
    needAccumulate: true,
    thresholds: [
      { maxYield: 7, minPrice: 40, action: 'no_add', amountCNY: 0, label: '❌ 不加' },
      { minYield: 7, maxYield: 8, minPrice: 35, maxPrice: 40, action: 'hold', amountCNY: 0, label: '🟡 持有' },
      { minYield: 8, maxYield: 9, minPrice: 31, maxPrice: 35, action: 'add', amountCNY: 17000, label: '✅ 加仓(1手)' },
      { minYield: 9, maxYield: 10, minPrice: 28, maxPrice: 31, action: 'double', amountCNY: 34000, label: '✅✅ 加倍(2手)' },
      { minYield: 10, maxPrice: 28, action: 'heavy', amountCNY: 51000, label: '🔥 重仓(3手)' },
    ],
  },
  {
    symbol: '0728.HK', name: '中国电信',
    type: 'dividend_yield', annualDividend: 0.35, currency: 'HKD',
    needAccumulate: false, // 门槛低，触发即买
    thresholds: [
      { maxYield: 5.5, minPrice: 6.4, action: 'no_add', amountCNY: 0, label: '❌ 不加' },
      { minYield: 5.5, maxYield: 6.5, minPrice: 5.4, maxPrice: 6.4, action: 'hold', amountCNY: 0, label: '🟡 持有' },
      { minYield: 6.5, maxYield: 7.5, minPrice: 4.7, maxPrice: 5.4, action: 'add', amountCNY: 10000, label: '✅ 加仓(1手)' },
      { minYield: 7.5, maxYield: 8.5, minPrice: 4.1, maxPrice: 4.7, action: 'double', amountCNY: 20000, label: '✅✅ 加倍(2手)' },
      { minYield: 8.5, maxPrice: 4.1, action: 'heavy', amountCNY: 30000, label: '🔥 重仓(3手)' },
    ],
  },
];

// ========== 美股价值仓触发规则（文档 5.2 节） ==========
export const VALUE_TRIGGERS: TriggerRule[] = [
  {
    symbol: 'NVDA', name: '英伟达', type: 'index_drawdown', currency: 'USD',
    thresholds: [
      { drawdownPct: 25, action: 'add', amountCNY: 2000, label: '✅ 回调≥25%加仓 $2,000' },
    ],
  },
  {
    symbol: 'GOOGL', name: '谷歌', type: 'price', currency: 'USD',
    thresholds: [
      { maxPrice: 320, action: 'add', amountCNY: 2000, label: '✅ 跌至$320加仓 $2,000' },
    ],
  },
  {
    symbol: 'AAPL', name: '苹果', type: 'price', currency: 'USD',
    thresholds: [
      { maxPrice: 240, action: 'add', amountCNY: 1500, label: '✅ 跌至$240加仓 $1,500' },
    ],
  },
  {
    symbol: 'TSM', name: '台积电', type: 'price', currency: 'USD',
    thresholds: [
      { maxPrice: 300, action: 'add', amountCNY: 1500, label: '✅ 跌至$300加仓 $1,500（已超限暂缓）' },
    ],
  },
];

// ========== 腾讯减仓规则（文档 7.2 节） ==========
export const TENCENT_REDUCE_TRIGGER: TriggerRule = {
  symbol: '0700.HK', name: '腾讯控股', type: 'price_reduce', currency: 'HKD',
  thresholds: [
    { minPrice: 540, action: 'reduce', amountCNY: 0, label: '📉 卖出200股（至400股）' },
    { minPrice: 600, action: 'reduce', amountCNY: 0, label: '📉 再卖200股（至200股）' },
  ],
};

// ========== ETF 暴跌弹药触发（文档 6.1 节） ==========
export const CRASH_TRIGGERS = [
  { drawdown: 10, poolPct: 10, amountCNY: 8000, targets: ['02834.HK', '03140.HK'], label: '-10% 动用10%' },
  { drawdown: 20, poolPct: 25, amountCNY: 20000, targets: ['02834.HK', '03140.HK'], label: '-20% 动用25%' },
  { drawdown: 30, poolPct: 40, amountCNY: 32000, targets: ['02834.HK', '03140.HK', '02800.HK'], label: '-30% 动用40%' },
  { drawdown: 40, poolPct: 100, amountCNY: 80000, targets: ['02834.HK', '03140.HK', '02800.HK'], label: '-40% 全部' },
] as const;

// ========== 加仓护栏（文档 4.4 节） ==========
export const GUARDRAILS = {
  maxMonthlyPoolUsagePct: 30,        // 每月最多动用池子的 30%
  sameStockCooldownMonths: 2,        // 同一标的 2 个月内不重复加仓
  poolPauseThresholdCNY: 30000,      // 池子余额 < ¥30,000 暂停加仓
  accumulatorBuyThresholdPct: 90,    // 累积金额 ≥ 一手价值 × 90% 即可触发
  accumulatorStaleMonths: 12,        // 12 个月未触发买入回流池子
} as const;

// ========== 三大红线（文档 9.1 节） ==========
export const RED_LINES = {
  singleHoldingMaxPct: 25,   // 单标的 ≤ 25%
  singleSectorMaxPct: 40,    // 单板块 ≤ 40%
  cashMinPct: 10,             // 现金 ≥ 10%
} as const;

// ========== 标的板块映射 ==========
export const SECTOR_MAP: Record<string, string> = {
  '0883.HK': '能源',
  '1088.HK': '能源',
  '0941.HK': '电信',
  '0728.HK': '电信',
  '0939.HK': '金融',
  '0700.HK': '科技',
  'TSM': '科技',
  'GOOGL': '科技',
  'AAPL': '科技',
  'NVDA': '科技',
  '02834.HK': '科技',
  '03140.HK': '综合',
  '02800.HK': '综合',
  '510300': '综合',
  '513300': '科技',
};

// ========== 标的中文名速查 ==========
export const SYMBOL_NAMES: Record<string, string> = {
  '02834.HK': '纳斯达克100 ETF',
  '03140.HK': '标普500 ETF',
  '02800.HK': '盈富基金',
  '510300': '沪深300 ETF',
  '513300': '纳指ETF(A股)',
  '0883.HK': '中国海洋石油',
  '0941.HK': '中国移动',
  '0939.HK': '建设银行',
  '1088.HK': '中国神华',
  '0728.HK': '中国电信',
  '0700.HK': '腾讯控股',
  'TSM': '台积电',
  'GOOGL': '谷歌-A',
  'AAPL': '苹果',
  'NVDA': '英伟达',
  'MSFT': '微软',
  'META': 'Meta',
};

// ========== 港股一手股数 ==========
export const LOT_SIZES: Record<string, number> = {
  '0883.HK': 1000,
  '0941.HK': 500,
  '0939.HK': 1000,
  '1088.HK': 500,
  '0728.HK': 2000,
  '0700.HK': 100,
  '02834.HK': 100,
  '03140.HK': 100,
  '02800.HK': 500,
};

// ========== 工资超额处理（文档 3.3 节） ==========
export const SALARY_OVERFLOW = {
  crashAmmoPct: 60,
  dividendPoolPct: 40,
} as const;
