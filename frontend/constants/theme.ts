/**
 * FixConnect Design Tokens
 * Centralized theming constants used across the application.
 */

export const COLORS = {
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  accent: {
    DEFAULT: '#FF6D00',
    light: '#FF9E40',
    dark: '#E65100',
  },
  surface: {
    DEFAULT: '#FFFFFF',
    secondary: '#F5F5F5',
    card: '#FAFAFA',
    dark: '#1A1A2E',
  },
  text: {
    primary: '#1A1A2E',
    secondary: '#757575',
    light: '#BDBDBD',
    inverse: '#FFFFFF',
  },
  status: {
    SEARCHING: '#FFA726',
    ACCEPTED: '#42A5F5',
    EN_ROUTE: '#7E57C2',
    ARRIVED: '#26A69A',
    IN_PROGRESS: '#66BB6A',
    COMPLETED: '#4CAF50',
    CANCELLED: '#EF5350',
    EXPIRED: '#9E9E9E',
  },
  skeleton: {
    background: '#E0E0E0',
    shimmer: '#F5F5F5',
  },
} as const;

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SEARCHING: 'Finding Provider...',
  ACCEPTED: 'Provider Accepted',
  EN_ROUTE: 'Provider En Route',
  ARRIVED: 'Provider Arrived',
  IN_PROGRESS: 'Service In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};
