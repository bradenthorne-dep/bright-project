'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, FileText } from 'lucide-react';
import { apiService, SampleMetricsResponse, SampleBreakdownResponse } from '@/services/api';
import ScoreGauge from '@/components/ui/ScoreGauge';
import BreakdownTable from '@/components/ui/BreakdownTable';

interface OverviewProps {
  onSectionChange?: (section: string) => void;
}

export default function Overview({}: OverviewProps) {
  const [sampleMetrics, setSampleMetrics] = useState<SampleMetricsResponse | null>(null);
  const [sampleBreakdown, setSampleBreakdown] = useState<SampleBreakdownResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [metrics, breakdown] = await Promise.all([
        apiService.getSampleMetrics(),
        apiService.getSampleBreakdown()
      ]);
      setSampleMetrics(metrics);
      setSampleBreakdown(breakdown);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load sample data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Overview</h1>
          <p className="text-gray-600">Loading components...</p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Overview</h1>
          <p className="text-gray-600">Error loading components</p>
        </div>

        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Overview</h1>
        <p className="text-gray-600">Component testing and data overview</p>
      </div>

      {/* Top Section: Data Cards Grid + Score Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2x2 Data Cards Grid */}
        <div className="lg:col-span-2">
          {sampleMetrics && (
            <div className="grid grid-cols-2 gap-4">
              {sampleMetrics.data_cards.map((card, index) => (
                <div key={index} className="stat-card">
                  <div className="flex items-center justify-between h-full">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                        {card.title}
                      </h3>
                      <p className="text-3xl font-bold text-gray-900">
                        {card.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Score Gauge */}
        <div className="lg:col-span-1">
          {sampleMetrics && (
            <div className="stat-card h-full flex flex-col items-center justify-center">
              <ScoreGauge
                score={sampleMetrics.score_gauge.value}
                rating={sampleMetrics.score_gauge.label}
                maxScore={sampleMetrics.score_gauge.max}
              />
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Table */}
      {sampleBreakdown && (
        <BreakdownTable 
          title={sampleBreakdown.title}
          data={sampleBreakdown.data}
          columns={[
            { key: 'Category', header: 'Category', format: 'text', sortable: true },
            { key: 'Count', header: 'Count', format: 'number', sortable: true },
            { key: 'Percentage', header: 'Percentage', format: 'text', sortable: false },
            { key: 'Status', header: 'Status', format: 'text', sortable: true }
          ]}
        />
      )}
    </div>
  );
}