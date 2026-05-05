import sanitizeHtml, { type IOptions } from 'sanitize-html';

/**
 * Sanitizes a given HTML string to prevent XSS attacks and remove unwanted formatting.
 * By default, it applies a zero-tolerance policy (strips all HTML tags and attributes).
 *
 * @param text - The raw input string to be sanitized.
 * @param [customOptions] - Optional configuration to override the strict default settings (e.g., allowing specific tags like 'b', 'i', or 'a').
 * @returns The sanitized, safe string.
 *
 * @example
 * // Strips everything (Default)
 * sanitizeText('<script>alert("xss")</script><p>Hello</p>'); // Returns: 'Hello'
 * @example
 * // Allows basic formatting
 * sanitizeText('<b>Bold</b> and <script>bad</script>', { allowedTags: ['b'] }); // Returns: '<b>Bold</b> and bad'
 */
export function sanitizeText(text: string, customOptions?: IOptions): string {
  const defaultOptions: IOptions = {
    allowedTags: [],
    allowedAttributes: {},
  };

  return sanitizeHtml(text, { ...defaultOptions, ...customOptions });
}
