import { format, parseISO, isValid } from 'date-fns';

/**
 * Safely formats a date string or Date object.
 * @param {string|Date|null|undefined} dateValue - The date to format.
 * @param {string} formatString - The desired date-fns format string.
 * @param {string} fallback - The string to return if the date is invalid.
 * @returns {string} The formatted date string or the fallback.
 */
export const safeFormatDate = (dateValue, formatString = 'PPP', fallback = 'N/A') => {
  if (!dateValue) {
    return fallback;
  }

  try {
    // Handle both ISO strings and Date objects
    const date = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
    
    if (isValid(date)) {
      return format(date, formatString);
    }
    
    return fallback;
  } catch (error) {
    // This will catch egregious errors, but isValid should handle most cases
    console.error('Date formatting error:', error);
    return fallback;
  }
};