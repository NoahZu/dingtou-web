'use client';

import { useStore } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DividendTriggerTable } from '@/components/triggers/dividend-trigger-table';
import { ValueTriggerTable } from '@/components/triggers/value-trigger-table';
import { CrashTriggerCard } from '@/components/triggers/crash-trigger-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function TriggersPage() {
  const { initialized } = useStore();

  if (!initialized) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold md:text-2xl">触发价监控中心</h1>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            请先前往持仓管理页面完成数据初始化
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">触发价监控中心</h1>
        <p className="text-xs text-muted-foreground md:text-sm">
          基于文档 4.3 / 5.2 / 6.1 / 7.2 节规则，实时计算触发状态
        </p>
      </div>

      <Tabs defaultValue="dividend" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="dividend" className="text-xs md:text-sm">💰 收息股</TabsTrigger>
          <TabsTrigger value="value" className="text-xs md:text-sm">🔥 美股/腾讯</TabsTrigger>
          <TabsTrigger value="crash" className="text-xs md:text-sm">📉 ETF暴跌</TabsTrigger>
        </TabsList>

        <TabsContent value="dividend" className="space-y-4">
          <div className="hidden rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground md:block">
            <p>
              <strong>股息率公式</strong>：年分红 ÷ 当前股价 × 100%　·　
              <strong>港股通整手交易</strong>　·　
              触发的标的会以 🔥 高亮置顶
            </p>
          </div>
          <DividendTriggerTable />
        </TabsContent>

        <TabsContent value="value" className="space-y-4">
          <div className="hidden rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground md:block">
            <p>
              美股价值仓触发条件来自文档 5.2 节　·　
              腾讯减仓规则来自文档 7.2 节
            </p>
          </div>
          <ValueTriggerTable />
        </TabsContent>

        <TabsContent value="crash" className="space-y-4">
          <div className="hidden rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground md:block">
            <p>
              手动输入恒生/纳指当前值与近期高点，系统自动判断跌幅档位
            </p>
          </div>
          <CrashTriggerCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
