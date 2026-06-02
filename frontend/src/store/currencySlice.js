import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCurrencyRates = createAsyncThunk('currency/fetchRates', async (_, { rejectWithValue }) => {
  try {
    const [ratesRes, listRes] = await Promise.all([
      fetch('/api/currency/rates').then(r => r.json()),
      fetch('/api/currency/list').then(r => r.json()),
    ]);
    return { rates: ratesRes.data.rates, currencies: listRes.data.currencies };
  } catch (err) { return rejectWithValue(err.message); }
});

export const detectUserCurrency = createAsyncThunk('currency/detect', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/currency/detect').then(r => r.json());
    return res.data.currency || 'USD';
  } catch (err) { return rejectWithValue(err.message); }
});

// ── Helpers ─────────────────────────────────────────────────
const getSavedCurrency = () => {
  try { return localStorage.getItem('fc_currency') || null; } catch { return null; }
};

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    selected: getSavedCurrency() || 'USD',
    rates: {},
    currencies: [],
    loading: false,
    symbol: '$',
  },
  reducers: {
    setCurrency: (state, action) => {
      state.selected = action.payload;
      try { localStorage.setItem('fc_currency', action.payload); } catch {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrencyRates.pending, (state) => { state.loading = true; })
      .addCase(fetchCurrencyRates.fulfilled, (state, action) => {
        state.loading = false;
        state.rates = action.payload.rates;
        state.currencies = action.payload.currencies;
        // Update symbol from currencies list
        const found = action.payload.currencies.find(c => c.code === state.selected);
        if (found) state.symbol = found.symbol;
      })
      .addCase(fetchCurrencyRates.rejected, (state) => { state.loading = false; })
      .addCase(detectUserCurrency.fulfilled, (state, action) => {
        // Only set if not manually saved
        if (!getSavedCurrency()) {
          state.selected = action.payload;
        }
      });
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;

// ── Selector Helper ──────────────────────────────────────────
// Usage in component: convertPrice(price, rates, selected)
export const convertPrice = (amountUSD, rates, targetCurrency) => {
  if (!rates || !amountUSD) return amountUSD;
  const rate = rates[targetCurrency] || 1;
  return Math.round(amountUSD * rate * 100) / 100;
};

export const formatPrice = (amountUSD, rates, currency, currencies) => {
  const converted = convertPrice(amountUSD, rates, currency);
  const currencyMeta = currencies?.find(c => c.code === currency);
  const symbol = currencyMeta?.symbol || currency;
  
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(converted);
  } catch {
    return `${symbol}${converted.toLocaleString()}`;
  }
};
