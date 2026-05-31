/**
 * Utility to resolve dynamic currency formats depending on a user's location coordinates or address text.
 * Default is US Dollar ($) if no specific region is resolved.
 */
export const getCurrency = (user) => {
  const address = user?.address || '';
  const coords = user?.location?.coordinates || [];
  
  // 1. Inspect physical address text for country/region clues
  const addrLower = address.toLowerCase();
  
  // Philippines
  if (
    addrLower.includes('philippines') || 
    addrLower.includes('manila') || 
    addrLower.includes('quezon') || 
    addrLower.includes('makati') || 
    addrLower.includes('bgc') || 
    addrLower.includes('cebu') ||
    addrLower.includes('davao')
  ) {
    return { symbol: '₱', code: 'PHP' };
  }
  
  // United Kingdom
  if (
    addrLower.includes('united kingdom') || 
    addrLower.includes('london') || 
    addrLower.includes('uk') || 
    addrLower.includes('gbp')
  ) {
    return { symbol: '£', code: 'GBP' };
  }
  
  // Eurozone countries
  if (
    addrLower.includes('germany') || 
    addrLower.includes('france') || 
    addrLower.includes('italy') || 
    addrLower.includes('spain') || 
    addrLower.includes('europe') ||
    addrLower.includes('netherlands')
  ) {
    return { symbol: '€', code: 'EUR' };
  }
  
  // Canada
  if (addrLower.includes('canada') || addrLower.includes('toronto') || addrLower.includes('vancouver')) {
    return { symbol: 'CA$', code: 'CAD' };
  }
  
  // Australia
  if (addrLower.includes('australia') || addrLower.includes('sydney') || addrLower.includes('melbourne')) {
    return { symbol: 'A$', code: 'AUD' };
  }
  
  // 2. Fallback checking of coordinates box rules (e.g. Philippines latitude and longitude boundaries)
  if (coords.length === 2) {
    const [lng, lat] = coords;
    // Philippines approximate box: Latitude 4° to 21° N, Longitude 116° to 127° E
    if (lat >= 4 && lat <= 21 && lng >= 116 && lng <= 127) {
      return { symbol: '₱', code: 'PHP' };
    }
  }

  // Default fallback (USD)
  return { symbol: '$', code: 'USD' };
};

/**
 * Formats a given amount into localized currency depending on the user's location.
 */
export const formatPrice = (amount, user) => {
  const currency = getCurrency(user);
  return `${currency.symbol}${Number(amount).toFixed(2)}`;
};
