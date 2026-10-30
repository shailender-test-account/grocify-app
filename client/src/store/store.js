import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/userslice.js';


export const store = configureStore({
  reducer: {
    auth: authReducer,

  },
});