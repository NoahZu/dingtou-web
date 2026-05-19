import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { hashPassword, generateSalt, signJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }
    if (username.length < 2 || username.length > 20) {
      return NextResponse.json({ error: '用户名长度 2-20 字符' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as D1Database;
    const jwtSecret = (env.JWT_SECRET as string) || 'fallback-secret';

    const existing = await db.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
    if (existing) {
      return NextResponse.json({ error: '用户名已被注册' }, { status: 409 });
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    const result = await db.prepare(
      'INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)'
    ).bind(username, passwordHash, salt).run();

    const userId = result.meta.last_row_id as number;

    await db.prepare(
      'INSERT INTO app_data (user_id, data_json) VALUES (?, ?)'
    ).bind(userId, '{}').run();

    const token = await signJWT({ sub: userId, username }, jwtSecret);

    return NextResponse.json({ token, username, userId });
  } catch (e) {
    console.error('Register error:', e);
    return NextResponse.json({ error: '注册失败' }, { status: 500 });
  }
}
