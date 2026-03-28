/**
 * Currency Utility for Feast AI
 * Handles conversion and formatting of recipe prices based on user preferences.
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  AUD: 'A$',
  KHR: '៛',
  EUR: '€',
  GBP: '£',
};

// Simplified conversion rates (static for demo/MVP purposes)
export const CONVERSION_RATES: Record<string, number> = {
  USD: 1.0,
  AUD: 1.54, // 1 USD = 1.54 AUD
  KHR: 4000,
  EUR: 0.92,
  GBP: 0.79,
};

/**
 * Formats a price based on the target currency.
 * If the original price is in a different currency, it performs a conversion.
 */
export function formatRecipePrice(
  price: number | null | undefined,
  fromCurrency: string = 'USD',
  targetCurrency: string = 'USD'
): string {
  if (price == null) return '—';

  // Normalize currencies to uppercase
  const from = fromCurrency.toUpperCase();
  const target = targetCurrency.toUpperCase();

  // If same currency, just format
  if (from === target) {
    const symbol = CURRENCY_SYMBOLS[target] || target;
    return `${symbol}${price.toFixed(2)}`;
  }

  // Convert to USD first (base), then to target
  const priceInUSD = price / (CONVERSION_RATES[from] || 1);
  const convertedPrice = priceInUSD * (CONVERSION_RATES[target] || 1);

  const symbol = CURRENCY_SYMBOLS[target] || target;
  return `${symbol}${convertedPrice.toFixed(2)}`;
}

/**
 * Gets the currency symbol for a given currency code.
 */
export function getCurrencySymbol(code: string = 'USD'): string {
  return CURRENCY_SYMBOLS[code.toUpperCase()] || code;
}
