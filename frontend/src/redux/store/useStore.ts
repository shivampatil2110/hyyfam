import { useMemo } from 'react';
import { createStore } from './index';
import type { RootState } from './index';
 
let store: ReturnType<typeof createStore> | undefined;
 
export function initializeStore(preloadedState: Partial<RootState> = {}) {
  let _store = store ?? createStore(preloadedState);
 
  if (typeof window === 'undefined') return _store;
  if (!store) store = _store;
 
  return _store;
}
 
export function useStore(initialState: any) {
  return useMemo(() => initializeStore(initialState), [initialState]);
}