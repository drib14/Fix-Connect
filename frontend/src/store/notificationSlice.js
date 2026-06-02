import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const authFetch = async (url, token, options = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    credentials: 'include',
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (token, { rejectWithValue }) => {
  try { return await authFetch('/api/notifications', token); }
  catch (err) { return rejectWithValue(err.message); }
});

export const markNotificationRead = createAsyncThunk('notifications/markOne', async ({ token, id }, { rejectWithValue }) => {
  try { return await authFetch(`/api/notifications/${id}/read`, token, { method: 'PATCH' }); }
  catch (err) { return rejectWithValue(err.message); }
});

export const markAllNotificationsRead = createAsyncThunk('notifications/markAll', async (token, { rejectWithValue }) => {
  try { return await authFetch('/api/notifications/read-all', token, { method: 'PATCH' }); }
  catch (err) { return rejectWithValue(err.message); }
});

export const deleteNotification = createAsyncThunk('notifications/delete', async ({ token, id }, { rejectWithValue }) => {
  try { return await authFetch(`/api/notifications/${id}`, token, { method: 'DELETE' }); }
  catch (err) { return rejectWithValue(err.message); }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    decrementUnread: (state) => {
      if (state.unreadCount > 0) state.unreadCount -= 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data.notifications;
        state.unreadCount = action.payload.data.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state) => { state.loading = false; })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = action.payload.data.notification;
        const idx = state.notifications.findIndex(x => x.id === n.id || x._id === n._id);
        if (idx !== -1) { state.notifications[idx].isRead = true; }
        if (state.unreadCount > 0) state.unreadCount -= 1;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        // The deleted id comes back in action.meta.arg.id
        const deletedId = action.meta.arg.id;
        const idx = state.notifications.findIndex(n => (n.id || n._id) === deletedId);
        if (idx !== -1) {
          if (!state.notifications[idx].isRead && state.unreadCount > 0) state.unreadCount -= 1;
          state.notifications.splice(idx, 1);
        }
      });
  },
});

export const { addNotification, decrementUnread } = notificationSlice.actions;
export default notificationSlice.reducer;
