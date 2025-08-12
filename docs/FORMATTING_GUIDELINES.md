# Formatting Guidelines for Deposco Diagnostic Tool

## Overview

This document outlines the formatting standards and conventions used in the Deposco Supply Chain Diagnostic Tool, ensuring consistent data presentation across the application.

## Core Principles

1. **Backend Consistency**: All percentage metrics are stored as decimals (e.g., 0.06 rather than 6%) in the backend and database
2. **Centralized Formatting**: All formatting is handled by centralized utilities in the frontend
3. **Type-Based Formatting**: Each metric has an explicitly defined format type
4. **Single Source of Truth**: The `METRIC_FORMATS` configuration serves as the definitive reference for all metric formatting

## Format Types

The application defines these core format types:

| Format Type | Description | Example | Implementation |
|-------------|-------------|---------|----------------|
| `percentage` | Decimal values displayed with % sign | 0.06 → "6.0%" | `formatPercentage()` |
| `currency` | Monetary values with $ sign | 14.5 → "$14.50" | `formatCurrency()` |
| `days` | Time values with "days" suffix | 45.2 → "45.2 days" | Custom format |
| `turns` | Inventory turns with "x" suffix | 12.3 → "12.3x" | Custom format |
| `ratio` | Simple ratio with one decimal place | 1.2 → "1.2" | Custom format |
| `number` | Default format for other metrics | 1234 → "1,234" | `formatNumber()` |

## Metric Format Configuration

All metric formats are explicitly defined in the `METRIC_FORMATS` configuration object in `frontend/src/utils/formatters.ts`:

```typescript
const METRIC_FORMATS: MetricFormatConfig = {
  // Inventory metrics
  'inventory_days_on_hand': 'days',
  'inventory_turns': 'turns',
  'inventory_to_sales_ratio': 'ratio',
  'lost_sales_revenue_pct': 'percentage',
  
  // Shipping metrics
  'cost_per_shipment': 'currency',
  'shipping_expense_ratio': 'percentage',
  'total_shipping_cost': 'currency',
  
  // Labor metrics
  'labor_cost_per_order': 'currency',
  'labor_cost_per_unit': 'currency',
  'two_day_fill_rate': 'percentage',
  
  // Growth metrics
  'gmv_growth_rate': 'percentage',
  'volume_growth_rate': 'percentage',
  'avg_order_value': 'currency',
  'avg_revenue_per_sku': 'currency',
};
```

## Key Formatting Functions

### `formatPercentage(value)`

Handles percentage formatting, converting decimal values to percentage display:

```typescript
export const formatPercentage = (value: number) => {
  if (Math.abs(value) > 100) {
    // Already a percentage value (e.g., 26.3)
    return numeral(value).format('0.1') + '%';
  } else {
    // Decimal value (e.g., 0.263)
    return numeral(value * 100).format('0.1') + '%';
  }
};
```

### `formatMetricValue(value, metricKey)`

The main formatting function that uses the metric's defined format type:

```typescript
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
    case 'turns':
      return numeral(value).format('0.1') + 'x';
    case 'ratio':
      return numeral(value).format('0.1');
    case 'number':
    default:
      return numeral(value).format('0.1');
  }
};
```

## Guidelines for Adding New Metrics

When adding a new metric to the application:

1. **Determine the metric's natural format** (percentage, currency, etc.)
2. **Add the metric to the `METRIC_FORMATS` configuration** with its appropriate format type
3. **Use `formatMetricValue()` in all frontend components** that display the metric
4. **For charts, use the appropriate formatter** in axis and tooltip configurations
5. **Maintain decimal storage in the backend** for all percentage metrics

## Decimal vs. Percentage Storage

All percentage metrics are consistently stored as decimal values (0.05 instead of 5%) throughout the entire system:

1. **Backend calculations**: All KPI calculations in `kpi_calculator.py` return decimals (0.70 for 70%)
2. **SQL queries**: All Snowflake benchmark queries return decimals without multiplying by 100
3. **Default benchmarks**: All fallback benchmarks in `benchmark_manager.py` use decimal values
4. **API responses**: All percentage values from API endpoints are decimals
5. **Cache files**: All benchmark CSV files contain decimal values

### Trend Calculations Exception

**Trend values** are handled differently from metric values:
- **Regular trends**: Calculated as percentage changes, stored as percentages for display by `formatTrend()`
- **Growth rate trends**: Calculated as percentage point differences, multiplied by 100 for proper display

### Critical Rule
**Never multiply by 100 in calculations** - all percentage conversions happen only in the `formatPercentage()` function during display.

## Chart Formatting

For chart components:

1. **Y-axis formatters** should use the standard formatters:
   ```typescript
   <YAxis tickFormatter={(value) => formatPercentage(value)} />
   ```

2. **Tooltip formatters** should use `formatMetricValue()` with the specific metric key:
   ```typescript
   <Tooltip content={(props) => (
     <CustomTooltip {...props} metricKey="lost_sales_revenue_pct" />
   )} />
   ```

3. **Custom tooltip components** should use `formatMetricValue()`:
   ```typescript
   <span className="font-medium">
     {formatMetricValue(entry.value, metricKey)}
   </span>
   ```

## Troubleshooting Common Issues

| Issue | Likely Cause | Solution |
|-------|-------------|----------|
| Inconsistent percentage display | Custom formatter overriding central formatter | Remove custom formatter, use `formatMetricValue()` |
| Wrong decimal places | Incorrect format type | Update the metric's format type in `METRIC_FORMATS` |
| Missing format for new metric | Metric not added to config | Add the metric to `METRIC_FORMATS` with appropriate type |
| Value too small/large (e.g., 0.7% instead of 70%) | Backend calculation multiplying by 100 | Remove `* 100` from backend, ensure decimal storage |
| Percentage values too large (e.g., 7000%) | Double multiplication (backend + frontend) | Check that backend returns decimals only |
| Trends showing as 0 | Missing `* 100` in trend calculations | Trends should be calculated as percentages for display |
| Runtime error on formatters | Missing formatter imports | Import all required formatters in component |

## Best Practices

1. **Never hard-code formatting logic** in individual components
2. **Always use the central formatters** for all value displays
3. **Keep backend values as decimals** for all percentage metrics
4. **Add new metrics explicitly** to the `METRIC_FORMATS` configuration
5. **Use descriptive format types** that reflect the metric's natural format

By following these guidelines, the application maintains consistent, professional formatting across all metrics and views, enhancing the user experience and data clarity.