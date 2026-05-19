'use client';

import { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { HoldingsTable } from '@/components/holdings/holdings-table';
import { HoldingForm } from '@/components/holdings/holding-form';
import { PriceInputDialog } from '@/components/holdings/price-input-dialog';
import { Plus, Download, RefreshCw, DatabaseZap, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { fetchQuotes } from '@/lib/services/quote-provider';
import type { Holding } from '@/lib/types';

export default function HoldingsPage() {
  const { initialized, initializeData, holdings, batchUpdatePrices } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleInit = () => {
    if (initialized && holdings.length > 0) {
      if (!confirm('已有数据，重新初始化将覆盖所有持仓、资金池和交易记录。确定继续？')) {
        return;
      }
    }
    initializeData();
    toast.success('已导入初始持仓数据（文档 v1.1）');
  };

  const handleAutoRefresh = useCallback(async () => {
    if (holdings.length === 0) return;
    setRefreshing(true);
    const symbols = Array.from(new Set(holdings.map((h) => h.symbol)));
    try {
      const quotes = await fetchQuotes(symbols);
      if (quotes.length > 0) {
        const priceMap: Record<string, number> = {};
        quotes.forEach((q) => { if (q.price > 0) priceMap[q.symbol] = q.price; });
        const count = Object.keys(priceMap).length;
        if (count > 0) {
          batchUpdatePrices(priceMap);
          toast.success(`已自动更新 ${count} 个标的现价`);
        } else {
          toast.warning('API 未返回有效价格，请使用手动录入');
        }
      } else {
        toast.warning('行情 API 暂不可用，请使用手动录入');
      }
    } catch {
      toast.error('行情刷新失败，请手动录入');
    } finally {
      setRefreshing(false);
    }
  }, [holdings, batchUpdatePrices]);

  const handleExportCSV = () => {
    if (holdings.length === 0) { toast.error('暂无持仓数据'); return; }
    const header = '名称,代码,市场,类型,数量,成本价,现价,币种,账户\n';
    const rows = holdings.map((h) =>
      [h.name, h.symbol, h.market, h.category, h.quantity, h.avgCost, h.currentPrice, h.currency, h.account].join(',')
    ).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `holdings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV 已导出');
  };

  const handleEdit = (holding: Holding) => {
    setEditingHolding(holding);
    setShowForm(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">持仓管理</h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            管理所有持仓，支持一键初始化文档数据
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleInit}>
            <DatabaseZap className="mr-1 h-4 w-4" />
            初始化
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={handleAutoRefresh}
            disabled={refreshing || holdings.length === 0}
          >
            <Wifi className={`mr-1 h-4 w-4 ${refreshing ? 'animate-pulse' : ''}`} />
            {refreshing ? '刷新中' : '自动刷新'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPriceInput(true)}>
            <RefreshCw className="mr-1 h-4 w-4" />
            手动录价
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="hidden sm:flex">
            <Download className="mr-1 h-4 w-4" />
            导出
          </Button>
          <Button size="sm" onClick={() => { setEditingHolding(null); setShowForm(true); }}>
            <Plus className="mr-1 h-4 w-4" />
            添加
          </Button>
        </div>
      </div>

      <HoldingsTable onEdit={handleEdit} />

      <HoldingForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingHolding(null); }}
        editing={editingHolding}
      />

      <PriceInputDialog
        open={showPriceInput}
        onClose={() => setShowPriceInput(false)}
      />
    </div>
  );
}
