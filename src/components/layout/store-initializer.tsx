'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { isLoggedIn } from '@/lib/storage';

export function StoreInitializer() {
  const loadFromStorage = useStore((s) => s.loadFromStorage);
  const loadFromStorageAsync = useStore((s) => s.loadFromStorageAsync);

  useEffect(() => {
    if (isLoggedIn()) {
      loadFromStorageAsync();
    } else {
      loadFromStorage();
    }
  }, [loadFromStorage, loadFromStorageAsync]);

  return null;
}
