/**
 * JWT + 密码哈希工具
 * 使用 Web Crypto API，无需额外依赖，Cloudflare Workers 原生支持
 */

const ENCODER = new TextEncoder();

// --- 密码哈希 (PBKDF2) ---

export async function hashPassword(password: string, salt: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', ENCODER.encode(password), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: ENCODER.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256,
  );
  return bufToHex(new Uint8Array(bits));
}

export function generateSalt(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return bufToHex(buf);
}

function bufToHex(buf: Uint8Array): string {
  return Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// --- JWT (HS256, minimal impl) ---

function base64url(input: Uint8Array | string): string {
  const str = typeof input === 'string' ? input : String.fromCharCode.apply(null, Array.from(input));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  return atob(padded);
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', ENCODER.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, ENCODER.encode(data));
  return base64url(new Uint8Array(sig));
}

export interface JWTPayload {
  sub: number;      // user id
  username: string;
  iat: number;
  exp: number;
}

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, secret: string, expiresInDays = 30): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInDays * 86400,
  };
  const header = base64url(ENCODER.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = base64url(ENCODER.encode(JSON.stringify(fullPayload)));
  const signature = await hmacSign(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const expectedSig = await hmacSign(`${parts[0]}.${parts[1]}`, secret);
    if (expectedSig !== parts[2]) return null;

    const payload = JSON.parse(base64urlDecode(parts[1])) as JWTPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
