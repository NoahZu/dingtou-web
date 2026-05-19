/**
 * 持久化层 — 双写策略
 * 1. LocalStorage: 即时缓存，保证离线可用和快速加载
 * 2. Cloud (D1): 远程持久化，通过 /api/data 读写，debounce 合并写入
 */

import type { AppState } from './types';

const STORAGE_KEY = 'dingtou_app_state';
const TOKEN_KEY = 'dingtou_auth_token';
const USER_KEY = 'dingtou_auth_user';

// --- Token 管理 ---

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, username: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
}

export function getUsername(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_KEY);
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// --- LocalStorage 读写 (同步缓存层) ---

function loadLocal(): AppState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

function saveLocal(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

function clearLocal(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// --- Cloud 读写 (异步持久层) ---

async function loadCloud(): Promise<AppState | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/data', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      return data as AppState;
    }
    return null;
  } catch {
    return null;
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function saveCloud(state: AppState): void {
  const token = getToken();
  if (!token) return;

  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await fetch('/api/data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: state }),
      });
    } catch (e) {
      console.error('Cloud save failed (will retry on next change)', e);
    }
  }, 800);
}

// --- 统一 Storage 接口 ---

export interface StorageAdapter {
  load(): AppState | null;
  loadAsync(): Promise<AppState | null>;
  save(state: AppState): void;
  clear(): void;
  exportJSON(): string;
  importJSON(json: string): AppState;
}

class HybridStorageAdapter implements StorageAdapter {
  load(): AppState | null {
    return loadLocal();
  }

  async loadAsync(): Promise<AppState | null> {
    if (!isLoggedIn()) return loadLocal();

    const cloudData = await loadCloud();
    if (cloudData && cloudData.initialized) {
      saveLocal(cloudData);
      return cloudData;
    }

    return loadLocal();
  }

  save(state: AppState): void {
    saveLocal(state);
    if (isLoggedIn()) {
      saveCloud(state);
    }
  }

  clear(): void {
    clearLocal();
    if (isLoggedIn()) {
      const emptyState = {} as AppState;
      saveCloud(emptyState);
    }
  }

  exportJSON(): string {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ?? '{}';
  }

  importJSON(json: string): AppState {
    const state = JSON.parse(json) as AppState;
    this.save(state);
    return state;
  }
}

export const storage = new HybridStorageAdapter();
