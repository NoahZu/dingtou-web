'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { exchangeRates, updateExchangeRates, exportData, importData, resetAll } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rates, setRates] = useState({
    USDCNY: String(exchangeRates.USDCNY),
    HKDCNY: String(exchangeRates.HKDCNY),
  });

  const handleSaveRates = () => {
    updateExchangeRates({
      USDCNY: Number(rates.USDCNY),
      HKDCNY: Number(rates.HKDCNY),
    });
    toast.success('汇率已更新');
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dingtou_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('数据已导出');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(reader.result as string);
        toast.success('数据导入成功');
      } catch {
        toast.error('导入失败：JSON 格式不正确');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('确定清空所有数据？此操作不可撤销！')) {
      if (confirm('最后确认：真的要清空吗？')) {
        resetAll();
        toast.success('数据已清空');
      }
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl font-bold md:text-2xl">设置</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">汇率设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Label>USD/CNY</Label>
              <Input
                type="number"
                step="0.0001"
                value={rates.USDCNY}
                onChange={(e) => setRates({ ...rates, USDCNY: e.target.value })}
                className="w-full sm:w-32"
              />
            </div>
            <div className="space-y-2">
              <Label>HKD/CNY</Label>
              <Input
                type="number"
                step="0.0001"
                value={rates.HKDCNY}
                onChange={(e) => setRates({ ...rates, HKDCNY: e.target.value })}
                className="w-full sm:w-32"
              />
            </div>
            <Button size="sm" onClick={handleSaveRates} className="w-full sm:w-auto">保存</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">数据管理</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
            <Download className="mr-1 h-4 w-4" />
            导出备份
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="w-full sm:w-auto">
            <Upload className="mr-1 h-4 w-4" />
            导入 JSON
          </Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Button variant="destructive" onClick={handleReset} className="w-full sm:w-auto">
            <Trash2 className="mr-1 h-4 w-4" />
            清空数据
          </Button>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        所有数据存储在浏览器 LocalStorage 中，不会上传到任何服务器。
        建议定期导出备份。
      </p>
    </div>
  );
}
