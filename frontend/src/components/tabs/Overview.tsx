'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { apiService, ProjectOverviewResponse } from '@/services/api';
import ScoreGauge from '@/components/ui/ScoreGauge';
import BreakdownTable from '@/components/ui/BreakdownTable';

interface OverviewProps {
  onSectionChange?: (section: string) => void;
}

export default function Overview({}: OverviewProps) {
  const [projectData, setProjectData] = useState<ProjectOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjectData();
  }, []);

  const loadProjectData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getProjectOverview();
      setProjectData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Overview</h1>
          <p className="text-gray-600">Loading project data...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Overview</h1>
          <p className="text-gray-600">Error loading project data</p>
        </div>

        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Overview</h1>
          <p className="text-gray-600">No project data available</p>
        </div>
      </div>
    );
  }

  const { project_info, task_metrics, budget_info } = projectData;

  const taskBredownData = [
    { Category: 'Completed Tasks', Count: task_metrics.tasks_completed, Percentage: `${((task_metrics.tasks_completed / task_metrics.total_tasks) * 100).toFixed(1)}%`, Status: 'Completed' },
    { Category: 'In Progress Tasks', Count: task_metrics.tasks_in_progress, Percentage: `${((task_metrics.tasks_in_progress / task_metrics.total_tasks) * 100).toFixed(1)}%`, Status: 'In Progress' },
    { Category: 'Open Tasks', Count: task_metrics.tasks_open, Percentage: `${((task_metrics.tasks_open / task_metrics.total_tasks) * 100).toFixed(1)}%`, Status: 'Open' },
    { Category: 'On Hold Tasks', Count: task_metrics.tasks_on_hold, Percentage: `${((task_metrics.tasks_on_hold / task_metrics.total_tasks) * 100).toFixed(1)}%`, Status: 'On Hold' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Overview</h1>
        <p className="text-gray-600">Comprehensive view of project status and metrics</p>
      </div>

      {/* Project Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Project Name</h3>
            <p className="text-lg font-bold text-gray-900">{project_info.project_name}</p>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Project Lead</h3>
            <p className="text-lg font-bold text-gray-900">{project_info.project_manager}</p>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Start Date</h3>
            <p className="text-lg font-bold text-gray-900">{formatDate(project_info.start_date)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">End Date</h3>
            <p className="text-lg font-bold text-gray-900">{formatDate(project_info.end_date)}</p>
          </div>
        </div>
      </div>

      {/* Budget Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Allocated Budget</h3>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(budget_info.allocated_budget)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Budget Utilized</h3>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(budget_info.utilized_budget)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Remaining Budget</h3>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(budget_info.remaining_budget)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Budget Utilization</h3>
            <p className="text-2xl font-bold text-gray-900">{budget_info.budget_utilization_percentage.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Task Metrics Grid + Completion Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Metrics - 2x2 Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Tasks</h3>
                <p className="text-2xl font-bold text-gray-900">{task_metrics.total_tasks}</p>
              </div>
            </div>

            <div className="stat-card">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Tasks Completed</h3>
                <p className="text-2xl font-bold text-green-600">{task_metrics.tasks_completed}</p>
              </div>
            </div>

            <div className="stat-card">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Tasks In Progress</h3>
                <p className="text-2xl font-bold text-blue-600">{task_metrics.tasks_in_progress}</p>
              </div>
            </div>

            <div className="stat-card">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Tasks On Hold</h3>
                <p className="text-2xl font-bold text-yellow-600">{task_metrics.tasks_on_hold}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Percentage Gauge */}
        <div className="lg:col-span-1">
          <div className="stat-card h-full flex flex-col items-center justify-center">
            <ScoreGauge
              score={Math.round(task_metrics.completion_percentage)}
              rating="Completion"
              maxScore={100}
            />
          </div>
        </div>
      </div>

      {/* Task Breakdown Table */}
      <BreakdownTable 
        title="Task Status Breakdown"
        description="Detailed breakdown of tasks by current status"
        data={taskBredownData}
        columns={[
          { key: 'Category', header: 'Task Category', format: 'text', sortable: true },
          { key: 'Count', header: 'Count', format: 'number', sortable: true },
          { key: 'Percentage', header: 'Percentage', format: 'text', sortable: false },
          { key: 'Status', header: 'Status', format: 'text', sortable: true }
        ]}
      />
    </div>
  );
}