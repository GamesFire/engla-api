export const ValidationLimits = {
  // DB standard for VARCHAR(255)
  EMAIL_MAX: 255,

  // Reasonable limit to prevent DB overflow or UI issues
  NAME_MIN: 1,
  NAME_MAX: 50,
  PHONE_MAX: 20,
  SEARCH_MIN: 1,
  SEARCH_MAX: 100,

  // Standard limit for URLs (IE limit history, widely accepted safe max)
  URL_MAX: 2048,

  // Standard limits for property text fields
  PROPERTY_TITLE_MIN: 5,
  PROPERTY_TITLE_MAX: 100,
  PROPERTY_DESC_MIN: 20,
  PROPERTY_DESC_MAX: 5000,
  PROPERTY_CITY_MIN: 2,
  PROPERTY_CITY_MAX: 100,
  PROPERTY_ADDRESS_MIN: 5,
  PROPERTY_ADDRESS_MAX: 255,
  PROPERTY_LICENSE_MAX: 100,
  PROPERTY_RULES_MAX: 2000,

  // Reasonable limits for property parameters and pricing (in pence for GBP)
  MAX_PRICE_PENCE: 1_000_000,
  MAX_CLEANING_FEE_PENCE: 50_000,
  MAX_GUESTS: 30,
  MAX_ROOMS: 20,
  MAX_AREA_SQM: 5000,

  // Geographic bounding box strictly for England (including Isles of Scilly & Isle of Wight)
  ENGLAND_LAT_MIN: 49.8,
  ENGLAND_LAT_MAX: 55.8,
  ENGLAND_LNG_MIN: -6.5,
  ENGLAND_LNG_MAX: 1.8,
} as const;

export const ValidationPatterns = {
  /**
   * Regex for human names supporting international characters.
   * - \p{L}  - Any Unicode letter (covers English, Ukrainian, French, etc.)
   * - \p{M}  - Diacritic marks (accents, e.g., in "ü", "й")
   * - \s     - Whitespace (for double names like "Anne Marie")
   * - '      - Apostrophes (e.g., "O'Connor")
   * - \-     - Hyphens (e.g., "Anne-Marie")
   * - u      - Unicode flag is mandatory for \p{} to work
   */
  NAME: /^[\p{L}\p{M}\s'-]+$/u,

  /**
   * E.164 International Phone Number Format.
   * Must start with '+' followed by 1 to 14 digits.
   */
  PHONE_E164: /^\+[1-9]\d{1,14}$/,

  /**
   * ISO 4217 Currency Code (e.g., USD, GBP, EUR).
   * Exactly 3 uppercase letters.
   */
  CURRENCY_CODE: /^[A-Z]{3}$/,

  /**
   * Regex for city names.
   * Shares the same logic as human names to support international characters,
   * spaces, hyphens (Stoke-on-Trent), and apostrophes (King's Lynn).
   */
  CITY: /^[\p{L}\p{M}\s'-]+$/u,

  /**
   * Official UK Postcode Regex.
   * Matches standard alphanumeric formats (e.g., SW1A 1AA, B33 8TH, M1 1AE).
   * Case-insensitive flag 'i' is used to allow lowercase input before formatting.
   */
  UK_POSTCODE: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,

  /**
   * 24-hour Time Format (HH:MM).
   * Matches 00:00 to 23:59.
   */
  TIME_HH_MM: /^([01]\d|2[0-3]):([0-5]\d)$/,
} as const;
