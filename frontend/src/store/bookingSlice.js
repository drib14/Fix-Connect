import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const apiCall = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

// ─── Thunks ───────────────────────────────────────────────────
export const fetchBookings = createAsyncThunk('bookings/fetchAll', async ({ token, status } = {}, { rejectWithValue }) => {
  try {
    const qs = status ? `?status=${status}` : '';
    return await apiCall(`/api/bookings${qs}`, { headers: { Authorization: `Bearer ${token}` } });
  } catch (err) { return rejectWithValue(err.message); }
});

export const createBooking = createAsyncThunk('bookings/create', async ({ token, data }, { rejectWithValue }) => {
  try {
    return await apiCall('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) { return rejectWithValue(err.message); }
});

export const fetchBookingById = createAsyncThunk('bookings/fetchOne', async ({ token, id }, { rejectWithValue }) => {
  try {
    return await apiCall(`/api/bookings/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  } catch (err) { return rejectWithValue(err.message); }
});

export const updateBookingStatus = createAsyncThunk('bookings/updateStatus', async ({ token, id, status, providerNotes, cancelReason }, { rejectWithValue }) => {
  try {
    return await apiCall(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, providerNotes, cancelReason }),
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) { return rejectWithValue(err.message); }
});

export const fetchAvailableSlots = createAsyncThunk('bookings/fetchSlots', async ({ providerId, date }, { rejectWithValue }) => {
  try {
    return await apiCall(`/api/bookings/slots/${providerId}?date=${date}`);
  } catch (err) { return rejectWithValue(err.message); }
});

// ─── Slice ────────────────────────────────────────────────────
const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    activeBooking: null,
    slots: [],
    loading: false,
    slotsLoading: false,
    error: null,
    createSuccess: false,
  },
  reducers: {
    clearBookingError: (state) => { state.error = null; },
    clearCreateSuccess: (state) => { state.createSuccess = false; },
    setActiveBooking: (state, action) => { state.activeBooking = action.payload; },
    updateBookingInList: (state, action) => {
      const idx = state.bookings.findIndex(b => b.id === action.payload.id || b._id === action.payload._id);
      if (idx !== -1) state.bookings[idx] = action.payload;
      if (state.activeBooking?.id === action.payload.id) state.activeBooking = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data.bookings;
      })
      .addCase(fetchBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createBooking.pending, (state) => { state.loading = true; state.error = null; state.createSuccess = false; })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.createSuccess = true;
        state.activeBooking = action.payload.data.booking;
        state.bookings.unshift(action.payload.data.booking);
      })
      .addCase(createBooking.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.activeBooking = action.payload.data.booking;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const updated = action.payload.data.booking;
        const idx = state.bookings.findIndex(b => (b.id || b._id) === (updated.id || updated._id));
        if (idx !== -1) state.bookings[idx] = updated;
        if (state.activeBooking) state.activeBooking = updated;
      })
      .addCase(fetchAvailableSlots.pending, (state) => { state.slotsLoading = true; })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.slots = action.payload.data.slots;
      })
      .addCase(fetchAvailableSlots.rejected, (state) => { state.slotsLoading = false; });
  },
});

export const { clearBookingError, clearCreateSuccess, setActiveBooking, updateBookingInList } = bookingSlice.actions;
export default bookingSlice.reducer;
