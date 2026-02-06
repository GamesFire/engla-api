export const ValidationLimit = {
  // DB standard for VARCHAR(255)
  EMAIL_MAX_LENGTH: 255,

  // Reasonable limit for first/last names to prevent DB overflow or UI issues
  NAME_MAX_LENGTH: 50,
  NAME_MIN_LENGTH: 1,

  // Standard limit for URLs (IE limit history, widely accepted safe max)
  URL_MAX_LENGTH: 2048,
} as const;

export const ValidationRegex = {
  /**
   * Regex for human names supporting international characters.
   * \p{L} - Any Unicode letter (covers English, Ukrainian, French, etc.)
   * \p{M} - Diacritic marks (accents, e.g., in "ü", "й")
   * \s    - Whitespace (for double names like "Anne Marie")
   * '     - Apostrophes (e.g., "O'Connor")
   * -     - Hyphens (e.g., "Anne-Marie")
   * u     - Unicode flag is mandatory for \p{} to work
   */
  NAME: /^[\p{L}\p{M}\s'-]+$/u,
} as const;
