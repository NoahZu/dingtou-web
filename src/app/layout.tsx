import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { AuthGuard } from '@/components/layout/auth-guard';
import { AppShell } from '@/components/layout/app-shell';
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
          <AuthGuard>
            <AppShell>{children}</AppShell>
          </AuthGuard>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
