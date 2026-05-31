/**
 * FixConnect Dynamic Currency Resolver
 * Resolves currency symbol and locale formatting based on user's location coordinates or address text.
 * Supports 14+ regions with Intl.NumberFormat for proper locale-aware formatting.
 */

// ─── Region Definitions ──────────────────────────────────────────────
const REGIONS = [
  // Philippines
  {
    code: 'PHP', symbol: '₱', locale: 'en-PH',
    keywords: ['philippines', 'manila', 'quezon', 'makati', 'bgc', 'cebu', 'davao', 'taguig', 'pasig', 'caloocan'],
    bounds: { latMin: 4, latMax: 21, lngMin: 116, lngMax: 127 },
  },
  // United Kingdom
  {
    code: 'GBP', symbol: '£', locale: 'en-GB',
    keywords: ['united kingdom', 'london', 'manchester', 'birmingham', 'scotland', 'wales', 'england'],
    bounds: { latMin: 49, latMax: 61, lngMin: -9, lngMax: 2 },
  },
  // Eurozone
  {
    code: 'EUR', symbol: '€', locale: 'de-DE',
    keywords: ['germany', 'france', 'italy', 'spain', 'europe', 'netherlands', 'belgium', 'portugal', 'austria', 'ireland', 'paris', 'berlin', 'rome', 'madrid', 'amsterdam'],
    bounds: { latMin: 35, latMax: 60, lngMin: -10, lngMax: 30 },
  },
  // Canada
  {
    code: 'CAD', symbol: 'CA$', locale: 'en-CA',
    keywords: ['canada', 'toronto', 'vancouver', 'montreal', 'ottawa', 'calgary', 'edmonton'],
    bounds: { latMin: 42, latMax: 83, lngMin: -141, lngMax: -52 },
  },
  // Australia
  {
    code: 'AUD', symbol: 'A$', locale: 'en-AU',
    keywords: ['australia', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra'],
    bounds: { latMin: -44, latMax: -10, lngMin: 113, lngMax: 154 },
  },
  // Japan
  {
    code: 'JPY', symbol: '¥', locale: 'ja-JP',
    keywords: ['japan', 'tokyo', 'osaka', 'kyoto', 'yokohama', 'nagoya', 'sapporo'],
    bounds: { latMin: 24, latMax: 46, lngMin: 122, lngMax: 146 },
  },
  // India
  {
    code: 'INR', symbol: '₹', locale: 'en-IN',
    keywords: ['india', 'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune'],
    bounds: { latMin: 6, latMax: 36, lngMin: 68, lngMax: 97 },
  },
  // South Korea
  {
    code: 'KRW', symbol: '₩', locale: 'ko-KR',
    keywords: ['south korea', 'seoul', 'busan', 'incheon', 'daegu'],
    bounds: { latMin: 33, latMax: 39, lngMin: 124, lngMax: 132 },
  },
  // Singapore
  {
    code: 'SGD', symbol: 'S$', locale: 'en-SG',
    keywords: ['singapore'],
    bounds: { latMin: 1.15, latMax: 1.47, lngMin: 103.6, lngMax: 104.1 },
  },
  // UAE
  {
    code: 'AED', symbol: 'AED', locale: 'ar-AE',
    keywords: ['uae', 'united arab emirates', 'dubai', 'abu dhabi', 'sharjah'],
    bounds: { latMin: 22, latMax: 27, lngMin: 51, lngMax: 56.5 },
  },
  // Mexico
  {
    code: 'MXN', symbol: 'MX$', locale: 'es-MX',
    keywords: ['mexico', 'mexico city', 'guadalajara', 'monterrey', 'cancun'],
    bounds: { latMin: 14, latMax: 33, lngMin: -118, lngMax: -86 },
  },
  // Brazil
  {
    code: 'BRL', symbol: 'R$', locale: 'pt-BR',
    keywords: ['brazil', 'são paulo', 'rio de janeiro', 'brasilia', 'salvador'],
    bounds: { latMin: -34, latMax: 6, lngMin: -74, lngMax: -34 },
  },
  // Indonesia
  {
    code: 'IDR', symbol: 'Rp', locale: 'id-ID',
    keywords: ['indonesia', 'jakarta', 'bali', 'surabaya', 'bandung', 'yogyakarta'],
    bounds: { latMin: -11, latMax: 6, lngMin: 95, lngMax: 141 },
  },
];

// ─── Currency Resolver ────────────────────────────────────────────────
export const getCurrency = (user) => {
  const address = user?.address || '';
  const coords = user?.location?.coordinates || [];
  const addrLower = address.toLowerCase();

  // 1. Check address text against all region keywords
  for (const region of REGIONS) {
    if (region.keywords.some((kw) => addrLower.includes(kw))) {
      return { symbol: region.symbol, code: region.code, locale: region.locale };
    }
  }

  // 2. Check coordinate bounding boxes
  if (coords.length === 2) {
    const [lng, lat] = coords;
    if (lng !== 0 || lat !== 0) {
      for (const region of REGIONS) {
        const b = region.bounds;
        if (lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax) {
          return { symbol: region.symbol, code: region.code, locale: region.locale };
        }
      }
    }
  }

  // 3. Default fallback (USD)
  return { symbol: '$', code: 'USD', locale: 'en-US' };
};

// ─── Locale-Aware Price Formatter ─────────────────────────────────────
export const formatPrice = (amount, user) => {
  const currency = getCurrency(user);
  const numericAmount = Number(amount) || 0;

  try {
    // Use Intl.NumberFormat for proper locale formatting (comma separators, decimal handling)
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.code === 'JPY' || currency.code === 'KRW' ? 0 : 2,
      maximumFractionDigits: currency.code === 'JPY' || currency.code === 'KRW' ? 0 : 2,
    }).format(numericAmount);
  } catch (e) {
    // Fallback if Intl fails
    return `${currency.symbol}${numericAmount.toFixed(2)}`;
  }
};

// ─── Currency Symbol Only ─────────────────────────────────────────────
export const getCurrencySymbol = (user) => {
  return getCurrency(user).symbol;
};
