import { configureStore } from "@reduxjs/toolkit";
import { collectionApi } from '../api/collectionApi';
import { postsApi } from '../api/postsApi';
import { analyticsApi } from '../api/analyticsApi'
import { pointsApi } from '../api/pointsApi'
import { productsApi } from '../api/productsApi'
import { homeApi } from '../api/homeApi'
import authReducer from '../features/authSlice';
import modalReducer from "../features/modalSlice"
import { TypedUseSelectorHook, useDispatch } from "react-redux";
import { useSelector } from "react-redux";

export function createStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      modal: modalReducer,
      [collectionApi.reducerPath]: collectionApi.reducer,
      [postsApi.reducerPath]: postsApi.reducer,
      [analyticsApi.reducerPath]: analyticsApi.reducer,
      [pointsApi.reducerPath]: pointsApi.reducer,
      [productsApi.reducerPath]: productsApi.reducer,
      [homeApi.reducerPath]: homeApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(
          collectionApi.middleware,
          postsApi.middleware,
          analyticsApi.middleware,
          pointsApi.middleware,
          productsApi.middleware,
          homeApi.middleware,
        ),
    preloadedState,
    devTools: process.env.NODE_ENV !== 'production',
  });
}

// If you still want types (for useAppDispatch/useAppSelector hooks)
export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
// export type AppDispatch = ReturnType<ReturnType<typeof createStore>['dispatch']>;

export type AppDispatch = ReturnType<typeof createStore>['dispatch'];

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

