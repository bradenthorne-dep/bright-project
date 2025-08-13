/**
 * Utility functions for formatting numeric values consistently across the application
 */

import numeral from 'numeral';

/**
 * Format a number as currency with dollar sign and two decimal places
 * @param value Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number) => {
  // Format with commas and two decimal places
  return '$' + numeral(value).format('0,0.00');
};

/**
 * Format a number as large currency with dollar sign and commas, no decimals
 * @param value Number to format
 * @returns Formatted currency string
 */
export const formatLargeCurrency = (value: number) => {
  return '$' + numeral(value).format('0,0');
};

/**
 * Format a percentage value (e.g., 0.125 becomes "12.5%")
 * @param value Decimal value to format as percentage
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number) => {
  return numeral(value * 100).format('0.1') + '%';
};

/**
 * Format a number with commas and no decimal places
 * @param value Number to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number) => {
  return numeral(value).format('0,0');
};

/**
 * Format a date as a full date (e.g., "January 12, 2024")
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format a date as MM/DD/YYYY (e.g., "01/12/2024")
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};