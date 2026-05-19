'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { setToken } from '@/lib/storage';
import { useStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const loadFromStorageAsync = useStore((s) => s.loadFromStorageAsync);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (isRegister && password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '操作失败');
        return;
      }

      setToken(data.token, data.username);
      await loadFromStorageAsync();
      router.push('/');
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-4xl">🌱</div>
          <CardTitle className="text-xl">投资管理系统</CardTitle>
          <CardDescription>
            {isRegister ? '创建新账号' : '登录以同步你的数据'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="2-20 字符"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
              />
            </div>
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  autoComplete="new-password"
                  required
                />
              </div>
            )}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '请稍候...' : isRegister ? '注册' : '登录'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isRegister ? '已有账号？' : '没有账号？'}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="ml-1 text-primary underline-offset-4 hover:underline"
            >
              {isRegister ? '去登录' : '注册'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
