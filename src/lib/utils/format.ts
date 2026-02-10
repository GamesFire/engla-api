/**
 * Formats a string to have the first letter capitalized and the rest
 * lowercased. Useful for formatting names.
 *
 * @example
 * formatName('jOhN') // 'John'
 *
 * @param {string} val - The string to format.
 * @returns {string} The formatted string.
 */
export const formatName = (val: string): string => {
  if (!val) return val;

  return val.trim().charAt(0).toUpperCase() + val.trim().slice(1).toLowerCase();
};
