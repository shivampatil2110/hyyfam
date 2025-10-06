// 'use client';

// import { Provider } from "react-redux";
// import { ReactNode, useMemo } from "react";
// import { createStore } from "@/redux/store"; // your createStore function
// import { configureStore, type EnhancedStore } from '@reduxjs/toolkit';
// import type { RootState } from "@/redux/store";

// interface ReduxProviderProps {
//   children: ReactNode;
//   preloadedState?: Partial<RootState>;
// }
 

// export default function ReduxProvider({ children, preloadedState }: ReduxProviderProps) {
//   const store = useMemo(() => createStore(preloadedState), [preloadedState]);

//   return <Provider store={store}>{children}</Provider>;
// }


'use client';
 
import { Provider } from 'react-redux';

import { ReactNode } from 'react';

import { useStore } from '@/redux/store/useStore';

import type { RootState } from '@/redux/store';
 
interface ReduxProviderProps {

  children: ReactNode;

  preloadedState?: Partial<RootState>;

}
 
export default function ReduxProvider({ children, preloadedState }: ReduxProviderProps) {

  const store = useStore(preloadedState );

  return <Provider store={store}>{children}</Provider>;

}
 