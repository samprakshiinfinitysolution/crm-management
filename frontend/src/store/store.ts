import { configureStore, combineReducers, type UnknownAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import executiveReducer from './slices/executiveSlice';
import { crmApi } from './api/baseApi';

const appReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  executive: executiveReducer,
  [crmApi.reducerPath]: crmApi.reducer,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) => {
  if (action.type === 'auth/logout') {
    // Reset all state slices to initial values upon logout
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(crmApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enables refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
