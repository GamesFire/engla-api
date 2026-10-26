export type FormatBookingStayDescriptionParams = {
  nightsCount: number;
  checkInDate: string;
  checkOutDate: string;
};

/**
 * Formats a string to have the first letter capitalized and the rest
 * lowercased. Useful for formatting names.
 *
 * @param val - The string to format.
 * @returns The formatted string.
 *
 * @example
 * formatName('jOhN') // 'John'
 */
export const formatName = (val: string): string => {
  if (!val) return val;

  const formattedName = val.trim().charAt(0).toUpperCase() + val.trim().slice(1).toLowerCase();
  return formattedName;
};

/**
 * Formats a fallback property title when a listing title is not set.
 *
 * @param propertyId - The unique identifier of the property.
 * @returns The formatted fallback property title.
 */
export const formatPropertyFallbackTitle = (propertyId: number): string => {
  const fallbackTitle = `Property #${propertyId}`;
  return fallbackTitle;
};

/**
 * Formats a human-readable stay description for payment line items.
 *
 * @param params - The stay duration and date boundaries.
 * @returns The formatted stay description string.
 */
export const formatBookingStayDescription = (
  params: FormatBookingStayDescriptionParams,
): string => {
  const { nightsCount, checkInDate, checkOutDate } = params;
  const nightLabel = nightsCount === 1 ? 'night' : 'nights';
  const stayDescription = `${nightsCount} ${nightLabel} stay (${checkInDate} to ${checkOutDate})`;

  return stayDescription;
};

/**
 * Formats a rate-limit bucket key with a namespace prefix.
 *
 * @param prefix - The namespace prefix (e.g., user or auth subject).
 * @param identifier - The unique actor identifier.
 * @returns The formatted rate-limit key string.
 */
export const formatRateLimitKey = (prefix: string, identifier: string | number): string => {
  const rateLimitKey = `${prefix}:${identifier}`;
  return rateLimitKey;
};
