'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PriceInputDialog({ open, onClose }: Props) {
  const { holdings, batchUpdatePrices } = useStore();
  const [prices, setPrices] = useState<Record<string, string>>({});

  const uniqueSymbols = Array.from(new Set(holdings.map((h) => h.symbol)));

  const handleSave = () => {
    const numericPrices: Record<string, number> = {};
    let count = 0;
    for (const [symbol, val] of Object.entries(prices)) {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        numericPrices[symbol] = num;
        count++;
      }
    }
    if (count > 0) {
      batchUpdatePrices(numericPrices);
      toast.success(`已更新 ${count} 个标的的现价`);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>手动录入现价</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {uniqueSymbols.map((symbol) => {
            const h = holdings.find((x) => x.symbol === symbol)!;
            return (
              <div key={symbol} className="flex items-center gap-3">
                <Label className="w-32 shrink-0 text-sm">
                  {h.name}
                  <span className="ml-1 text-xs text-muted-foreground">({symbol})</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={h.currentPrice > 0 ? String(h.currentPrice) : '输入现价'}
                  value={prices[symbol] ?? ''}
                  onChange={(e) => setPrices({ ...prices, [symbol]: e.target.value })}
                  className="w-32"
                />
                <span className="text-xs text-muted-foreground">{h.currency}</span>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
