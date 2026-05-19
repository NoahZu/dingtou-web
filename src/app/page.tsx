'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, toCNY } from '@/lib/format';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AssetPieChart } from '@/components/dashboard/asset-pie-chart';
import { RedLinesMonitor } from '@/components/dashboard/red-lines-monitor';
import { PoolBarChart } from '@/components/dashboard/pool-bar-chart';
import { MonthlyTodos } from '@/components/dashboard/monthly-todos';
import { AccountBalances } from '@/components/dashboard/account-balances';
import { NetWorthChart } from '@/components/dashboard/net-worth-chart';
import { AttributionAnalysis } from '@/components/dashboard/attribution-analysis';
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const { holdings, pools, exchangeRates, initialized } = useStore();

  if (!initialized) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <span className="text-5xl">🌱</span>
        <h1 className="text-2xl font-bold">欢迎使用投资管理系统</h1>
        <p className="text-muted-foreground">请先前往持仓管理页面初始化数据</p>
        <Link href="/holdings">
          <Button size="lg">开始初始化</Button>
        </Link>
      </div>
    );
  }

  const totalMarketValue = holdings.reduce((sum, h) => {
    const price = h.currentPrice > 0 ? h.currentPrice : h.avgCost;
    return sum + toCNY(price * h.quantity, h.currency, exchangeRates);
  }, 0);

  const totalCost = holdings.reduce((sum, h) => {
    return sum + toCNY(h.avgCost * h.quantity, h.currency, exchangeRates);
  }, 0);

  const totalCash = pools.reduce((sum, p) => {
    return sum + toCNY(p.balance, p.currency, exchangeRates);
  }, 0);

  const totalAssets = totalMarketValue + totalCash;
  const totalPnL = totalMarketValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl font-bold md:text-2xl">资产总览</h1>

      {/* 顶部统计卡片 - 移动端 2 列 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 md:p-6 md:pb-2">
            <CardTitle className="text-xs text-muted-foreground md:text-sm">总资产</CardTitle>
            <BarChart3 className="h-3.5 w-3.5 text-muted-foreground md:h-4 md:w-4" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <p className="text-lg font-bold md:text-2xl">{formatCurrency(totalAssets, 'CNY')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 md:p-6 md:pb-2">
            <CardTitle className="text-xs text-muted-foreground md:text-sm">证券市值</CardTitle>
            {totalPnL >= 0
              ? <TrendingUp className="h-3.5 w-3.5 text-red-500 md:h-4 md:w-4" />
              : <TrendingDown className="h-3.5 w-3.5 text-green-500 md:h-4 md:w-4" />}
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <p className="text-lg font-bold md:text-2xl">{formatCurrency(totalMarketValue, 'CNY')}</p>
            <p className={`text-[10px] md:text-xs ${totalPnL >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL, 'CNY')} ({totalPnLPct.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 md:p-6 md:pb-2">
            <CardTitle className="text-xs text-muted-foreground md:text-sm">现金合计</CardTitle>
            <Wallet className="h-3.5 w-3.5 text-muted-foreground md:h-4 md:w-4" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <p className="text-lg font-bold md:text-2xl">{formatCurrency(totalCash, 'CNY')}</p>
            <p className="text-[10px] text-muted-foreground md:text-xs">
              占比 {totalAssets > 0 ? ((totalCash / totalAssets) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 md:p-6 md:pb-2">
            <CardTitle className="text-xs text-muted-foreground md:text-sm">持仓数</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <p className="text-lg font-bold md:text-2xl">{holdings.length}</p>
            <p className="text-[10px] text-muted-foreground md:text-xs">
              {holdings.filter((h) => h.currentPrice > 0).length} 只已录价
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 历史净值曲线 */}
      <NetWorthChart />

      {/* 中间双列 */}
      <div className="grid gap-4 lg:grid-cols-2 md:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">资产分层饼图</CardTitle>
          </CardHeader>
          <CardContent>
            <AssetPieChart />
          </CardContent>
        </Card>
        <AttributionAnalysis />
      </div>

      {/* 下方双列 */}
      <div className="grid gap-4 lg:grid-cols-2 md:gap-6">
        <div className="space-y-4">
          <RedLinesMonitor />
          <MonthlyTodos />
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">资金池余额</CardTitle>
            </CardHeader>
            <CardContent>
              <PoolBarChart />
            </CardContent>
          </Card>
          <AccountBalances />
        </div>
      </div>
    </div>
  );
}
