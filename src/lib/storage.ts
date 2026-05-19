/**
 * LocalStorage 持久化层
 * 预留接口：未来可切换到 SQLite 或 Supabase
 */

import type { AppState } from './types';

const STORAGE_KEY = 'dingtou_app_state';

export interface StorageAdapter {
  load(): AppState | null;
  save(state: AppState): void;
  clear(): void;
  exportJSON(): string;
  importJSON(json: string): AppState;
}

class LocalStorageAdapter implements StorageAdapter {
  load(): AppState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AppState;
    } catch {
      console.error('Failed to load state from localStorage');
      return null;
    }
  }

  save(state: AppState): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
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

export const storage: StorageAdapter = new LocalStorageAdapter();
