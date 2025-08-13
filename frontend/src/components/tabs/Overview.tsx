'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { apiService, ProjectOverviewResponse } from '@/services/api';
import ScoreGauge from '@/components/ui/ScoreGauge';
import BreakdownTable from '@/components/ui/BreakdownTable';
import { formatCurrency, formatDate } from '@/utils/formatters';

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

  const { project_info, task_metrics, budget_info, top_tasks, hourly_rate } = projectData;

  const topTasksData = top_tasks.map(task => ({
    Task: task.task,
    'Billable Hours': task.billable_hours,
    'Total Cost': formatCurrency(task.total_cost)
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Overview</h1>
        <p className="text-gray-600">Comprehensive view of project status</p>
      </div>

      {/* Project Information Section */}
      <div>

        {/* Top Row: Client and Project Lead */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="stat-card">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Client</h3>
              <p className="text-lg font-bold text-gray-900">{project_info.client}</p>
            </div>
          </div>

          <div className="stat-card">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Project Lead</h3>
              <p className="text-lg font-bold text-gray-900">{project_info.project_manager}</p>
            </div>
          </div>
        </div>

        {/* Bottom Row: Start Date, Go-Live Date, Current Phase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="stat-card">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Start Date</h3>
              <p className="text-lg font-bold text-gray-900">{formatDate(project_info.start_date)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Projected Go-Live Date</h3>
              <p className="text-lg font-bold text-gray-900">{formatDate(project_info.projected_go_live)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current Project Phase</h3>
              <p className="text-lg font-bold text-gray-900">{project_info.current_phase}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Budget Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Spent Budget</h3>
              <p className="text-xl font-bold text-red-600">{formatCurrency(budget_info.spent_budget)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Remaining Budget</h3>
              <p className="text-xl font-bold text-green-600">{formatCurrency(budget_info.remaining_budget)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Hourly Rate</h3>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(hourly_rate)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Budget Utilization</h3>
              <p className="text-xl font-bold text-gray-900">{budget_info.budget_utilization_percentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Progress</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Metrics - 2x2 Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
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
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Tasks Open</h3>
                  <p className="text-2xl font-bold text-gray-600">{task_metrics.tasks_open}</p>
                </div>
              </div>

              <div className="stat-card">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Tasks</h3>
                  <p className="text-2xl font-bold text-gray-900">{task_metrics.total_tasks}</p>
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
                showPercentage={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Tasks by Billable Hours */}
      <BreakdownTable 
        title="Top Tasks in Terms of Billable Hours"
        description="Tasks with the highest billable hours and associated costs"
        data={topTasksData}
        columns={[
          { key: 'Task', header: 'Task', format: 'text', sortable: true },
          { key: 'Billable Hours', header: 'Billable Hours', format: 'number', sortable: true },
          { key: 'Total Cost', header: 'Total Cost', format: 'text', sortable: false }
        ]}
      />
    </div>
  );
}