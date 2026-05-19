'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

/**
 * 浏览器通知管理器
 * 每月 1 号提醒执行定投（文档 3.2 节）
 */
export function NotificationManager() {
  const { initialized, dcaExecutions } = useStore();

  useEffect(() => {
    if (!initialized) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dcaDone = (dcaExecutions ?? []).some((e) => e.month === currentMonth);

    // 每月 1-3 号且当月未执行定投时提醒
    if (now.getDate() <= 3 && !dcaDone) {
      if (Notification.permission === 'granted') {
        showReminder(currentMonth);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') showReminder(currentMonth);
        });
      }
    }
  }, [initialized, dcaExecutions]);

  return null;
}

function showReminder(month: string) {
  // 防重复：用 localStorage 标记当天是否已提醒
  const key = `dca_reminder_${month}_${new Date().toISOString().slice(0, 10)}`;
  if (typeof window !== 'undefined' && localStorage.getItem(key)) return;

  new Notification('🌱 定投提醒', {
    body: `${month} 月度定投尚未执行，请前往「定投计划」页面操作`,
    icon: '/favicon.ico',
    tag: 'dca-reminder',
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(key, '1');
  }
}
