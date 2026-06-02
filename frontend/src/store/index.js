import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import bookingReducer from './bookingSlice.js';
import notificationReducer from './notificationSlice.js';
import chatReducer from './chatSlice.js';
import currencyReducer from './currencySlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    bookings: bookingReducer,
    notifications: notificationReducer,
    chat: chatReducer,
    currency: currencyReducer,
  },
});

export default store;
