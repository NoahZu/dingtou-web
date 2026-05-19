import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { verifyJWT } from '@/lib/auth';

async function getUserId(request: NextRequest): Promise<number | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const { env } = getCloudflareContext();
  const jwtSecret = (env.JWT_SECRET as string) || 'fallback-secret';

  const payload = await verifyJWT(token, jwtSecret);
  return payload?.sub ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as D1Database;

    const row = await db.prepare(
      'SELECT data_json FROM app_data WHERE user_id = ?'
    ).bind(userId).first<{ data_json: string }>();

    const data = row?.data_json ?? '{}';
    return NextResponse.json({ data: JSON.parse(data) });
  } catch (e) {
    console.error('Data load error:', e);
    return NextResponse.json({ error: '加载失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const dataJson = JSON.stringify(body.data ?? {});

    const { env } = getCloudflareContext();
    const db = env.DB as D1Database;

    await db.prepare(
      `INSERT INTO app_data (user_id, data_json, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`
    ).bind(userId, dataJson).run();

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Data save error:', e);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
