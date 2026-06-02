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

export const fetchConversations = createAsyncThunk('chat/fetchConversations', async (token, { rejectWithValue }) => {
  try { return await authFetch('/api/chat/conversations', token); }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async ({ token, bookingId }, { rejectWithValue }) => {
  try { return await authFetch(`/api/chat/${bookingId}`, token); }
  catch (err) { return rejectWithValue(err.message); }
});

export const sendMessageREST = createAsyncThunk('chat/sendMessage', async ({ token, bookingId, text, receiverId }, { rejectWithValue }) => {
  try {
    return await authFetch(`/api/chat/${bookingId}`, token, {
      method: 'POST',
      body: JSON.stringify({ text, receiverId }),
    });
  }
  catch (err) { return rejectWithValue(err.message); }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    messages: [],
    activeBookingId: null,
    loading: false,
    messagesLoading: false,
    typing: false,
  },
  reducers: {
    setActiveChat: (state, action) => { state.activeBookingId = action.payload; },
    addMessage: (state, action) => { state.messages.push(action.payload); },
    setTyping: (state, action) => { state.typing = action.payload; },
    markMessagesRead: (state) => {
      state.messages.forEach(m => { m.isRead = true; });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => { state.loading = true; })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.data.conversations;
      })
      .addCase(fetchConversations.rejected, (state) => { state.loading = false; })
      .addCase(fetchMessages.pending, (state) => { state.messagesLoading = true; state.messages = []; })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload.data.messages;
      })
      .addCase(fetchMessages.rejected, (state) => { state.messagesLoading = false; })
      .addCase(sendMessageREST.fulfilled, (state, action) => {
        state.messages.push(action.payload.data.message);
      });
  },
});

export const { setActiveChat, addMessage, setTyping, markMessagesRead } = chatSlice.actions;
export default chatSlice.reducer;
