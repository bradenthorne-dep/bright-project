'use client';

import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import numeral from 'numeral';

interface BreakdownTableColumn {
  key: string;
  header: string;
  format?: 'currency' | 'number' | 'decimal' | 'percentage' | 'text';
  precision?: number;
  sortable?: boolean;
  sortKey?: string; // Optional separate field to use for sorting
}

interface BreakdownTableProps {
  title: string;
  description?: string;
  data: Record<string, any>[];
  columns: BreakdownTableColumn[];
  loading?: boolean;
  error?: string | null;
  maxRows?: number;
  defaultSortColumn?: string;
  defaultSortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
}

export default function BreakdownTable({
  title,
  description,
  data,
  columns,
  loading = false,
  error = null,
  maxRows = 25,
  defaultSortColumn,
  defaultSortDirection = 'asc',
  emptyMessage = 'No data available'
}: BreakdownTableProps) {
  const [sortColumn, setSortColumn] = useState<string>(defaultSortColumn || columns[0]?.key || '');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const formatValue = (value: any, column: BreakdownTableColumn): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    const numValue = typeof value === 'number' ? value : parseFloat(value);
    
    switch (column.format) {
      case 'currency':
        return '$' + numeral(numValue).format('0,0');
      case 'number':
        return numeral(numValue).format('0,0');
      case 'decimal':
        const precision = column.precision || 1;
        return numeral(numValue).format(`0.${'0'.repeat(precision)}`);
      case 'percentage':
        const pctPrecision = column.precision || 1;
        return numeral(numValue).format(`0.${'0'.repeat(pctPrecision)}`) + '%';
      case 'text':
      default:
        return String(value);
    }
  };

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable && column?.sortable !== undefined) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const sortedData = [...data].sort((a, b) => {
    // Find the column configuration to check for sortKey
    const column = columns.find(col => col.key === sortColumn);
    const actualSortKey = column?.sortKey || sortColumn;
    
    const aVal = a[actualSortKey];
    const bVal = b[actualSortKey];
    
    // Handle null/undefined values
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    // Compare values
    let comparison = 0;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }
    
    return sortDirection === 'desc' ? -comparison : comparison;
  });

  // Pagination logic
  const totalPages = maxRows >= 1000 ? 1 : Math.ceil(sortedData.length / maxRows);
  const startIndex = showAll || maxRows >= 1000 ? 0 : (currentPage - 1) * maxRows;
  const endIndex = showAll || maxRows >= 1000 ? sortedData.length : startIndex + maxRows;
  const displayData = sortedData.slice(startIndex, endIndex);
  const hasMoreData = data.length > maxRows && maxRows < 1000;

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        <div className="card-content">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading breakdown data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        <div className="card-content">
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        <div className="card-content">
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg font-medium mb-2">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-full flex flex-col">
      <div className="card-header flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && <p className="text-sm text-gray-600">{description}</p>}
          </div>
          <div className="text-sm text-gray-500">
            {hasMoreData && !showAll && totalPages > 1 ? 
              `Showing ${startIndex + 1}-${Math.min(endIndex, sortedData.length)} of ${sortedData.length} items` :
              `Showing ${displayData.length} of ${data.length} items`
            }
          </div>
        </div>
      </div>
      <div className="card-content flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="kpi-table">
              <thead className="sticky top-0 bg-white">
                <tr>
                  {columns.map((column) => (
                    <th 
                      key={column.key}
                      className={`text-left whitespace-nowrap ${
                        (column.sortable !== false) ? 'cursor-pointer hover:bg-gray-50' : ''
                      }`}
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.header}</span>
                        {sortColumn === column.key && (column.sortable !== false) && (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayData.map((row, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column.key} className="text-gray-900">
                        {formatValue(row[column.key], column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {hasMoreData && !showAll && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between flex-shrink-0 text-sm text-gray-600">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}