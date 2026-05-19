import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { hashPassword, signJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as D1Database;
    const jwtSecret = (env.JWT_SECRET as string) || 'fallback-secret';

    const user = await db.prepare(
      'SELECT id, password_hash, salt FROM users WHERE username = ?'
    ).bind(username).first<{ id: number; password_hash: string; salt: string }>();

    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const inputHash = await hashPassword(password, user.salt);
    if (inputHash !== user.password_hash) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const token = await signJWT({ sub: user.id, username }, jwtSecret);

    return NextResponse.json({ token, username, userId: user.id });
  } catch (e) {
    console.error('Login error:', e);
    return NextResponse.json({ error: '登录失败' }, { status: 500 });
  }
}
