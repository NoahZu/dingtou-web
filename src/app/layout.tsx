import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Sidebar } from '@/components/layout/sidebar';
import { StoreInitializer } from '@/components/layout/store-initializer';
import { NotificationManager } from '@/components/layout/notification-manager';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: '投资管理系统 · 让时间陪你慢慢变富',
  description: '个人投资决策辅助系统 v1.1',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`font-sans ${geistSans.variable}`}>
      <body className="antialiased">
        <TooltipProvider>
          <StoreInitializer />
          <NotificationManager />
          <Sidebar />
          {/* pt-12 为移动端顶栏留空，pb-16 为移动端底栏留空 */}
          <main className="min-h-screen bg-background pt-12 pb-16 md:ml-56 md:pt-0 md:pb-0">
            <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6">
              {children}
            </div>
          </main>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
