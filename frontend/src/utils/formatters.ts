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
  // For most metrics - format with commas and two decimal places
  return '$' + numeral(value).format('0.00');
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
 * Format GMV forecast values (used in the GrowthDetailTab)
 * @param value Number to format
 * @returns Formatted currency string
 */
export const formatGMVForecast = (value: number) => {
  // Preserve the original formatting
  return '$' + numeral(value).format('0,0');
};

/**
 * Format average metrics like average order value and revenue per SKU
 * @param value Number to format
 * @returns Formatted currency string
 */
export const formatAverageMetric = (value: number) => {
  // Preserve the original formatting
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
 * Format a trend value with + or - sign
 * @param value Trend value to format
 * @returns Formatted trend string with sign
 */
export const formatTrend = (value: number) => {
  // For trend values, we assume they're already in percentage form
  return (value >= 0 ? '+' : '') + numeral(value).format('0.1') + '%';
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
 * Format a date as a short date (e.g., "Jan 15")
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  });
};

/**
 * Format a metric value based on its type
 * @param value Number to format
 * @param metricKey Type of metric to determine formatting
 * @returns Formatted string
 */
/**
 * Map defining the exact format for each metric type
 * This creates a single source of truth for all metric formatting
 */
type FormatType = 'percentage' | 'currency' | 'days' | 'turns' | 'ratio' | 'number' | 'hours';

interface MetricFormatConfig {
  [key: string]: FormatType;
}

const METRIC_FORMATS: MetricFormatConfig = {
  // Inventory metrics
  'inventory_days_on_hand': 'days',
  'inventory_turns': 'turns',
  'inventory_to_sales_ratio': 'ratio',
  'lost_sales_revenue_pct': 'percentage',
  'stockout_rate': 'percentage',
  'excess_holding_cost_pct': 'percentage',
  
  // Shipping metrics
  'cost_per_shipment': 'currency',
  'shipping_expense_ratio': 'percentage',
  'split_shipment_pct': 'percentage',
  'total_shipping_cost': 'currency',
  
  // Labor metrics
  'labor_cost_per_order': 'currency',
  'labor_cost_per_unit': 'currency',
  'two_day_fill_rate': 'percentage',
  'average_order_cycle_time': 'hours',
  'throughput': 'number',
  
  // Growth metrics
  'gmv_growth_rate': 'percentage',
  'volume_growth_rate': 'percentage',
  'avg_order_value': 'currency',
  'avg_revenue_per_sku': 'currency',
};

export const formatMetricValue = (value: number, metricKey: string) => {
  // Get the format type from our map
  const formatType = METRIC_FORMATS[metricKey] || 'number';
  
  // Apply formatting based on the metric's defined type
  switch (formatType) {
    case 'percentage':
      return formatPercentage(value);
    case 'currency':
      return formatCurrency(value);
    case 'days':
      return numeral(value).format('0.0') + ' days';
    case 'hours':
      return numeral(value).format('0.1') + ' hours';
    case 'turns':
      return numeral(value).format('0.1') + 'x';
    case 'ratio':
      return numeral(value).format('0.1');
    case 'number':
    default:
      return numeral(value).format('0.1');
  }
};