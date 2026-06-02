import axios from 'axios';
import { AppError } from '../middleware/errorMiddleware.js';
import { logger } from '../utils/logger.js';

// Simple in-memory cache (1 hour)
let ratesCache = { data: null, fetchedAt: null };
const CACHE_TTL_MS = 60 * 60 * 1000;

export class CurrencyController {
  // GET /api/currency/rates — Fetch exchange rates (USD base)
  getRates = async (req, res, next) => {
    try {
      const now = Date.now();
      const isStale = !ratesCache.data || (now - ratesCache.fetchedAt) > CACHE_TTL_MS;

      if (isStale) {
        // Use Open Exchange Rates free tier (no key needed for public rates)
        // Fallback to exchangerate.host which is free
        try {
          const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
            timeout: 5000,
          });
          ratesCache = { data: response.data.rates, fetchedAt: now };
          logger.info('Currency rates refreshed from exchangerate-api');
        } catch (apiErr) {
          // Fallback rates for common currencies
          if (!ratesCache.data) {
            ratesCache = {
              data: {
                USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, AUD: 1.53, CAD: 1.36,
                CHF: 0.89, CNY: 7.24, INR: 83.12, PHP: 56.5, SGD: 1.34, THB: 35.2,
                KRW: 1325, BRL: 4.97, MXN: 17.15, ZAR: 18.63, AED: 3.67, SAR: 3.75,
                NZD: 1.63, SEK: 10.42, NOK: 10.58, DKK: 6.89, HKD: 7.82, TWD: 31.65,
                MYR: 4.72, IDR: 15650, VND: 24500, PKR: 278, NGN: 1580, KES: 150,
              },
              fetchedAt: now,
            };
          }
        }
      }

      res.status(200).json({
        status: 'success',
        data: {
          base: 'USD',
          rates: ratesCache.data,
          fetchedAt: new Date(ratesCache.fetchedAt).toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/currency/detect — Detect user's currency from IP
  detectCurrency = async (req, res, next) => {
    try {
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;

      // Skip detection for local IPs
      if (!ip || ip === '::1' || ip === '127.0.0.1' || ip?.startsWith('192.168') || ip?.startsWith('10.')) {
        return res.status(200).json({
          status: 'success',
          data: { currency: 'USD', country: 'US', detected: false },
        });
      }

      const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,currency`, {
        timeout: 3000,
      });

      const { currency, countryCode, country } = response.data;
      res.status(200).json({
        status: 'success',
        data: { currency: currency || 'USD', countryCode, country, detected: true },
      });
    } catch (err) {
      // Silent fallback
      res.status(200).json({
        status: 'success',
        data: { currency: 'USD', detected: false },
      });
    }
  };

  // GET /api/currency/list — All supported currencies with metadata
  getCurrencyList = async (_req, res) => {
    const currencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
      { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
      { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
      { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
      { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
      { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
      { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
      { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', flag: '🇲🇽' },
      { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
      { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪' },
      { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR', flag: '🇸🇦' },
      { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
      { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
      { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
      { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
      { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
      { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
      { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
      { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
    ];
    res.status(200).json({ status: 'success', data: { currencies } });
  };
}
