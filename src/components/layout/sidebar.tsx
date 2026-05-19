'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3, Briefcase, AlertTriangle, ArrowLeftRight,
  Settings, Target, Wallet, CalendarCheck, FileText, Menu, X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: '总览', icon: BarChart3 },
  { href: '/holdings', label: '持仓', icon: Briefcase },
  { href: '/triggers', label: '触发', icon: Target },
  { href: '/accumulator', label: '累积', icon: Wallet },
  { href: '/transactions', label: '交易', icon: ArrowLeftRight },
  { href: '/dca', label: '定投', icon: CalendarCheck },
  { href: '/pools', label: '资金池', icon: AlertTriangle },
  { href: '/review', label: '复盘', icon: FileText },
  { href: '/settings', label: '设置', icon: Settings },
];

// 底部导航只显示核心 5 个入口，其余放抽屉
const BOTTOM_NAV = NAV_ITEMS.slice(0, 5);

export function Sidebar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-56 flex-col border-r bg-card md:flex">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <span className="text-xl">🌱</span>
          <span className="font-semibold tracking-tight">投资管理系统</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'mx-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3 text-xs text-muted-foreground">
          v1.1 · 本地运行
        </div>
      </aside>

      {/* 移动端顶栏 */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-12 items-center justify-between border-b bg-card px-4 md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌱</span>
          <span className="text-sm font-semibold">投资管理</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="rounded-md p-1.5 hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* 移动端全屏抽屉 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 bg-card shadow-xl">
            <div className="flex h-12 items-center justify-between border-b px-4">
              <span className="font-semibold">导航</span>
              <button onClick={() => setDrawerOpen(false)} className="rounded-md p-1 hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="py-2">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      'mx-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* 移动端底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card md:hidden safe-bottom">
        <div className="flex items-center justify-around py-1">
          {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-[10px] transition-colors',
                  active
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground',
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'text-primary')} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
