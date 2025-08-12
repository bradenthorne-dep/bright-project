import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes timeout for file uploads
});

// Basic types for API responses
export interface DataPreviewResponse {
  preview: Record<string, any>[];
  total_rows: number;
  columns: string[];
}

export interface DataStatusResponse {
  data_loaded: boolean;
  data_info?: {
    row_count: number;
    column_count: number;
    columns: string[];
  };
  source?: string;
}

export interface DataSummaryResponse {
  summary_statistics: Record<string, any>;
  data_types: Record<string, string>;
  null_counts: Record<string, number>;
  shape: {
    rows: number;
    columns: number;
  };
}

export interface SampleMetricsResponse {
  data_cards: Array<{
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
  }>;
  score_gauge: {
    value: number;
    max: number;
    label: string;
    color: string;
  };
}

export interface SampleBreakdownResponse {
  title: string;
  data: Record<string, any>[];
}


// API functions
export const apiService = {
  // Health check
  async healthCheck() {
    const response = await api.get('/');
    return response.data;
  },

  // Data upload - simplified to single file
  async uploadData(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/upload-data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get data status
  async getDataStatus(): Promise<DataStatusResponse> {
    const response = await api.get('/api/data-status');
    return response.data;
  },

  // Get data preview
  async getDataPreview(): Promise<DataPreviewResponse> {
    const response = await api.get('/api/data-preview');
    return response.data;
  },

  // Get data summary
  async getDataSummary(): Promise<DataSummaryResponse> {
    const response = await api.get('/api/data-summary');
    return response.data;
  },

  // Get sample metrics for testing components
  async getSampleMetrics(): Promise<SampleMetricsResponse> {
    const response = await api.get('/api/sample-metrics');
    return response.data;
  },

  // Get sample breakdown data for testing table component
  async getSampleBreakdown(): Promise<SampleBreakdownResponse> {
    const response = await api.get('/api/sample-breakdown');
    return response.data;
  },

};

export default apiService;