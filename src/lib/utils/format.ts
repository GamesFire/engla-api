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

  return val.trim().charAt(0).toUpperCase() + val.trim().slice(1).toLowerCase();
};
