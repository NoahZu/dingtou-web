'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { StoreInitializer } from '@/components/layout/store-initializer';
import { NotificationManager } from '@/components/layout/notification-manager';

const BARE_PATHS = ['/login'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (BARE_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <StoreInitializer />
      <NotificationManager />
      <Sidebar />
      <main className="min-h-screen bg-background pt-12 pb-16 md:ml-56 md:pt-0 md:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6">
          {children}
        </div>
      </main>
    </>
  );
}
