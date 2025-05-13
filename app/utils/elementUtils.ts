/**
 * Converts a width or height value to a number
 * @param value The width or height value (can be string or number)
 * @returns The numeric value
 */
export const dimensionToNumber = (value: string | number): number => {
  if (typeof value === 'number') {
    return value;
  }
  
  // Remove 'px' or any other unit and convert to number
  return parseFloat(value.replace(/[^\d.-]/g, ''));
};

/**
 * Formats a dimension value for display
 * @param value The width or height value
 * @returns Formatted string (rounded to nearest integer)
 */
export const formatDimension = (value: string | number): string => {
  const numValue = dimensionToNumber(value);
  return Math.round(numValue).toString();
};