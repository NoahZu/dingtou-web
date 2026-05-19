'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase, Target, Wallet, ArrowLeftRight, CalendarCheck,
  AlertTriangle, FileText, Settings, BarChart3, HelpCircle,
} from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: '初始化数据',
    icon: Briefcase,
    color: 'text-blue-600',
    where: '持仓管理',
    content: '首次使用，前往「持仓管理」页面，点击「初始化」按钮。系统会自动导入文档 v1.1 中的所有持仓、资金池和累积账户数据。',
  },
  {
    step: 2,
    title: '更新实时价格',
    icon: Briefcase,
    color: 'text-blue-600',
    where: '持仓管理',
    content: '点击「自动刷新」从腾讯/新浪行情自动获取最新价格（A股/港股/美股均支持）。如果 API 不可用，也可点击「手动录价」逐个输入。',
  },
  {
    step: 3,
    title: '查看资产总览',
    icon: BarChart3,
    color: 'text-indigo-600',
    where: '总览（首页）',
    content: '首页展示总资产、证券市值、现金合计、浮盈亏损、资产饼图、收益归因分析、三大红线监控和每月待办提醒。',
  },
  {
    step: 4,
    title: '每月 1 号执行定投',
    icon: CalendarCheck,
    color: 'text-green-600',
    where: '定投计划',
    content: '进入「定投计划」页面，点击「执行本月定投」，输入各 ETF 的成交价和数量，系统自动记录交易并更新持仓。每月 ¥15,000 分配到 4 只 ETF + 现金留存。',
  },
  {
    step: 5,
    title: '监控触发价',
    icon: Target,
    color: 'text-red-600',
    where: '触发监控',
    content: '系统根据文档规则实时计算：收息股的股息率触发、美股价值仓的价格触发、ETF 暴跌触发。触发的标的会 🔥 高亮显示，告诉你该买多少。',
  },
  {
    step: 6,
    title: '累积账户管理',
    icon: Wallet,
    color: 'text-amber-600',
    where: '累积账户',
    content: '港股一手门槛较高，触发时先将资金"累积"到虚拟账户。累积达到一手金额的 90% 即可执行实际买入。超过 12 个月未买入则回流资金池。',
  },
  {
    step: 7,
    title: '记录交易',
    icon: ArrowLeftRight,
    color: 'text-purple-600',
    where: '交易记录',
    content: '每次买卖操作在「交易记录」中录入，支持定投、触发加仓、累积买入、价值仓、减仓、分红等类型。录入后会自动更新对应持仓的数量和成本。',
  },
  {
    step: 8,
    title: '管理资金池',
    icon: AlertTriangle,
    color: 'text-orange-600',
    where: '资金池',
    content: '四个专款专用池子：应急金（¥10万锁定）、暴跌弹药池、收息股加仓池、富途美元池。支持池间转账和工资溢出分配。余额低于警戒线会红色提醒。',
  },
  {
    step: 9,
    title: '定期复盘',
    icon: FileText,
    color: 'text-teal-600',
    where: '复盘报告',
    content: '月度检查执行情况，季度审视策略偏差，年度重新校准目标。系统提供对应周期的检查清单模板，支持自由文字记录心理状态和决策反思。',
  },
  {
    step: 10,
    title: '备份数据',
    icon: Settings,
    color: 'text-gray-600',
    where: '设置',
    content: '所有数据存储在浏览器 LocalStorage 中。务必定期前往「设置」→「导出备份」下载 JSON 文件。换设备时通过「导入 JSON」恢复数据。',
  },
];

const FAQ = [
  {
    q: '数据存在哪里？安全吗？',
    a: '数据完全存储在你的浏览器本地（LocalStorage），不会上传到任何服务器。但清除浏览器数据会丢失，所以请定期导出备份。',
  },
  {
    q: '行情数据来源是什么？',
    a: '通过 stock-api 获取腾讯/新浪/东方财富的公开行情数据，支持 A 股、港股、美股。数据仅供参考，不构成投资建议。',
  },
  {
    q: '触发价是怎么计算的？',
    a: '收息股：根据年分红和当前股价计算股息率，到达设定档位自动触发。价值仓：根据文档设定的目标价格触发。暴跌：根据指数从高点回撤的百分比触发。',
  },
  {
    q: '什么是累积账户？',
    a: '港股必须整手交易（如腾讯 100 股一手），一手金额可能很大。触发时先累积资金到虚拟账户，攒够 90% 一手金额后再执行实际买入。',
  },
  {
    q: '净值快照怎么用？',
    a: '在首页点击「记录今日快照」，系统会保存当天的总资产数据。建议每月记录一次，积累 2 个以上快照后会自动生成历史净值曲线。',
  },
  {
    q: '换手机/电脑后数据还在吗？',
    a: '不在。请先在旧设备「设置 → 导出备份」下载 JSON 文件，然后在新设备「设置 → 导入 JSON」恢复。',
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">使用指南</h1>
        <p className="text-xs text-muted-foreground md:text-sm">
          快速了解系统功能和使用流程
        </p>
      </div>

      {/* 核心流程 */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">快速上手：10 步开始使用</h2>
        <div className="space-y-3">
          {STEPS.map(({ step, title, icon: Icon, color, where, content }) => (
            <Card key={step}>
              <CardContent className="flex gap-4 p-4">
                <div className="flex flex-col items-center gap-1 pt-0.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                    {step}
                  </div>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm md:text-base">{title}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{where}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground md:text-sm leading-relaxed">{content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 每月操作清单 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">每月操作清单</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="font-mono text-muted-foreground">28号</span>
              <span>发工资 → 「资金池」→ 工资溢出分配（超出 ¥15,000 的部分）</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-muted-foreground whitespace-nowrap">1号</span>
              <span>「定投计划」→ 执行本月定投 → 输入成交价</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-muted-foreground whitespace-nowrap">随时</span>
              <span>「持仓管理」→ 自动刷新价格 → 查看触发监控</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-muted-foreground whitespace-nowrap">月末</span>
              <span>「总览」→ 记录今日快照 → 「复盘报告」→ 新建月度复盘</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-muted-foreground whitespace-nowrap">月末</span>
              <span>「设置」→ 导出备份（养成习惯！）</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* 常见问题 */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <HelpCircle className="h-5 w-5" />
          常见问题
        </h2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <p className="mb-1 text-sm font-medium">{q}</p>
                <p className="text-xs text-muted-foreground md:text-sm leading-relaxed">{a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center pb-4">
        投资策略基于 investment-plan v1.1 文档 · 本系统仅为辅助决策工具，不构成投资建议
      </p>
    </div>
  );
}
