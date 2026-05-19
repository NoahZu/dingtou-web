import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type {
  Holding,
  Transaction,
  Pool,
  AccumulatorAccount,
  AccumulatorEntry,
  PoolTransfer,
  DCAExecution,
  Review,
  NetWorthSnapshot,
  ExchangeRates,
  AppState,
} from './types';
import { storage } from './storage';
import {
  getInitialHoldings,
  getInitialPools,
  getInitialAccumulators,
  DEFAULT_EXCHANGE_RATES,
} from '@/config/strategy';

interface AppActions {
  loadFromStorage: () => void;
  loadFromStorageAsync: () => Promise<void>;
  initializeData: () => void;
  resetAll: () => void;

  // 持仓
  addHolding: (holding: Omit<Holding, 'id'>) => void;
  updateHolding: (id: string, data: Partial<Holding>) => void;
  deleteHolding: (id: string) => void;
  updatePrice: (symbol: string, price: number) => void;
  batchUpdatePrices: (prices: Record<string, number>) => void;

  // 交易
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  // 资金池
  updatePoolBalance: (name: Pool['name'], balance: number) => void;
  addPoolTransfer: (transfer: Omit<PoolTransfer, 'id'>) => void;
  deletePoolTransfer: (id: string) => void;

  // 累积账户
  updateAccumulator: (id: string, data: Partial<AccumulatorAccount>) => void;
  addAccumulatorEntry: (id: string, entry: AccumulatorEntry) => void;
  resetAccumulator: (id: string) => void;

  // 定投执行
  addDCAExecution: (execution: Omit<DCAExecution, 'id'>) => void;

  // 复盘报告
  addReview: (review: Omit<Review, 'id'>) => void;
  updateReview: (id: string, data: Partial<Review>) => void;
  deleteReview: (id: string) => void;

  // 净值快照
  addNetWorthSnapshot: (snapshot: NetWorthSnapshot) => void;
  deleteNetWorthSnapshot: (date: string) => void;

  // 汇率
  updateExchangeRates: (rates: Partial<ExchangeRates>) => void;

  // 导入导出
  exportData: () => string;
  importData: (json: string) => void;
}

type Store = AppState & AppActions;

function getEmptyState(): AppState {
  return {
    holdings: [],
    transactions: [],
    pools: [],
    accumulators: [],
    poolTransfers: [],
    dcaExecutions: [],
    reviews: [],
    netWorthHistory: [],
    exchangeRates: DEFAULT_EXCHANGE_RATES,
    initialized: false,
  };
}

function persist(state: AppState) {
  storage.save({
    holdings: state.holdings,
    transactions: state.transactions,
    pools: state.pools,
    accumulators: state.accumulators,
    poolTransfers: state.poolTransfers ?? [],
    dcaExecutions: state.dcaExecutions ?? [],
    reviews: state.reviews ?? [],
    netWorthHistory: state.netWorthHistory ?? [],
    exchangeRates: state.exchangeRates,
    initialized: state.initialized,
  });
}

export const useStore = create<Store>((set, get) => ({
  ...getEmptyState(),

  loadFromStorage: () => {
    const saved = storage.load();
    if (saved) {
      set({
        ...saved,
        poolTransfers: saved.poolTransfers ?? [],
        dcaExecutions: saved.dcaExecutions ?? [],
        reviews: saved.reviews ?? [],
        netWorthHistory: saved.netWorthHistory ?? [],
      });
    }
  },

  loadFromStorageAsync: async () => {
    const saved = await storage.loadAsync();
    if (saved) {
      set({
        ...saved,
        poolTransfers: saved.poolTransfers ?? [],
        dcaExecutions: saved.dcaExecutions ?? [],
        reviews: saved.reviews ?? [],
        netWorthHistory: saved.netWorthHistory ?? [],
      });
    }
  },

  initializeData: () => {
    const state: AppState = {
      holdings: getInitialHoldings(),
      pools: getInitialPools(),
      accumulators: getInitialAccumulators(),
      transactions: [],
      poolTransfers: [],
      dcaExecutions: [],
      reviews: [],
      netWorthHistory: [],
      exchangeRates: DEFAULT_EXCHANGE_RATES,
      initialized: true,
    };
    set(state);
    persist({ ...get(), ...state });
  },

  resetAll: () => {
    const empty = getEmptyState();
    set(empty);
    storage.clear();
  },

  addHolding: (holding) => {
    const newHolding = { ...holding, id: uuid() };
    set((s) => {
      const next = { ...s, holdings: [...s.holdings, newHolding] };
      persist(next);
      return next;
    });
  },

  updateHolding: (id, data) => {
    set((s) => {
      const next = {
        ...s,
        holdings: s.holdings.map((h) => (h.id === id ? { ...h, ...data } : h)),
      };
      persist(next);
      return next;
    });
  },

  deleteHolding: (id) => {
    set((s) => {
      const next = { ...s, holdings: s.holdings.filter((h) => h.id !== id) };
      persist(next);
      return next;
    });
  },

  updatePrice: (symbol, price) => {
    set((s) => {
      const next = {
        ...s,
        holdings: s.holdings.map((h) =>
          h.symbol === symbol ? { ...h, currentPrice: price } : h
        ),
      };
      persist(next);
      return next;
    });
  },

  batchUpdatePrices: (prices) => {
    set((s) => {
      const next = {
        ...s,
        holdings: s.holdings.map((h) =>
          prices[h.symbol] !== undefined
            ? { ...h, currentPrice: prices[h.symbol] }
            : h
        ),
      };
      persist(next);
      return next;
    });
  },

  addTransaction: (tx) => {
    const newTx = { ...tx, id: uuid() };
    set((s) => {
      const next = { ...s, transactions: [newTx, ...s.transactions] };
      persist(next);
      return next;
    });
  },

  deleteTransaction: (id) => {
    set((s) => {
      const next = { ...s, transactions: s.transactions.filter((t) => t.id !== id) };
      persist(next);
      return next;
    });
  },

  updatePoolBalance: (name, balance) => {
    set((s) => {
      const next = {
        ...s,
        pools: s.pools.map((p) => (p.name === name ? { ...p, balance } : p)),
      };
      persist(next);
      return next;
    });
  },

  addPoolTransfer: (transfer) => {
    const newTransfer = { ...transfer, id: uuid() };
    set((s) => {
      const pools = s.pools.map((p) => {
        if (p.name === transfer.from) return { ...p, balance: p.balance - transfer.amount };
        if (p.name === transfer.to) return { ...p, balance: p.balance + transfer.amount };
        return p;
      });
      const next = {
        ...s,
        pools,
        poolTransfers: [newTransfer, ...(s.poolTransfers ?? [])],
      };
      persist(next);
      return next;
    });
  },

  deletePoolTransfer: (id) => {
    set((s) => {
      const next = {
        ...s,
        poolTransfers: (s.poolTransfers ?? []).filter((t) => t.id !== id),
      };
      persist(next);
      return next;
    });
  },

  updateAccumulator: (id, data) => {
    set((s) => {
      const next = {
        ...s,
        accumulators: s.accumulators.map((a) =>
          a.id === id ? { ...a, ...data } : a
        ),
      };
      persist(next);
      return next;
    });
  },

  addAccumulatorEntry: (id, entry) => {
    set((s) => {
      const next = {
        ...s,
        accumulators: s.accumulators.map((a) => {
          if (a.id !== id) return a;
          const newAccumulated = entry.action === 'add'
            ? a.accumulatedCNY + entry.amount
            : Math.max(0, a.accumulatedCNY - entry.amount);
          return {
            ...a,
            accumulatedCNY: newAccumulated,
            lastTriggeredAt: entry.action === 'add' ? entry.date : a.lastTriggeredAt,
            lastBoughtAt: entry.action === 'buy' ? entry.date : a.lastBoughtAt,
            history: [...a.history, entry],
          };
        }),
      };
      persist(next);
      return next;
    });
  },

  resetAccumulator: (id) => {
    set((s) => {
      const next = {
        ...s,
        accumulators: s.accumulators.map((a) =>
          a.id === id ? { ...a, accumulatedCNY: 0, history: [] } : a
        ),
      };
      persist(next);
      return next;
    });
  },

  addDCAExecution: (execution) => {
    const newExec = { ...execution, id: uuid() };
    set((s) => {
      const next = {
        ...s,
        dcaExecutions: [newExec, ...(s.dcaExecutions ?? [])],
      };
      persist(next);
      return next;
    });
  },

  addReview: (review) => {
    const newReview = { ...review, id: uuid() };
    set((s) => {
      const next = { ...s, reviews: [newReview, ...(s.reviews ?? [])] };
      persist(next);
      return next;
    });
  },

  updateReview: (id, data) => {
    set((s) => {
      const next = {
        ...s,
        reviews: (s.reviews ?? []).map((r) => (r.id === id ? { ...r, ...data } : r)),
      };
      persist(next);
      return next;
    });
  },

  deleteReview: (id) => {
    set((s) => {
      const next = { ...s, reviews: (s.reviews ?? []).filter((r) => r.id !== id) };
      persist(next);
      return next;
    });
  },

  addNetWorthSnapshot: (snapshot) => {
    set((s) => {
      const history = (s.netWorthHistory ?? []).filter((h) => h.date !== snapshot.date);
      history.push(snapshot);
      history.sort((a, b) => a.date.localeCompare(b.date));
      const next = { ...s, netWorthHistory: history };
      persist(next);
      return next;
    });
  },

  deleteNetWorthSnapshot: (date) => {
    set((s) => {
      const next = {
        ...s,
        netWorthHistory: (s.netWorthHistory ?? []).filter((h) => h.date !== date),
      };
      persist(next);
      return next;
    });
  },

  updateExchangeRates: (rates) => {
    set((s) => {
      const next = {
        ...s,
        exchangeRates: { ...s.exchangeRates, ...rates },
      };
      persist(next);
      return next;
    });
  },

  exportData: () => {
    return storage.exportJSON();
  },

  importData: (json) => {
    try {
      const state = storage.importJSON(json);
      set({ ...state, poolTransfers: state.poolTransfers ?? [], dcaExecutions: state.dcaExecutions ?? [], reviews: state.reviews ?? [], netWorthHistory: state.netWorthHistory ?? [] });
    } catch (e) {
      console.error('Import failed', e);
    }
  },
}));
