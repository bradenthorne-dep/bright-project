'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { apiService, Task, TasksResponse } from '@/services/api';
import { formatDateShort } from '@/utils/formatters';

interface RiskManagementProps {
  onSectionChange?: (section: string) => void;
}

interface RiskTask extends Task {
  daysRemaining: number;
  riskLevel: 'High' | 'Medium' | 'Low';
}

export default function RiskManagement({}: RiskManagementProps) {
  const [riskTasks, setRiskTasks] = useState<RiskTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    loadRiskTasks();
  }, []);

  const calculateDaysRemaining = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateRiskLevel = (task: Task, daysRemaining: number): 'High' | 'Medium' | 'Low' => {
    // High risk: Overdue or due within 3 days with less than 90% completion
    if (daysRemaining < 0) return 'High';
    if (daysRemaining <= 3 && task.completion_percentage < 90) return 'High';
    
    // Medium risk: Due within 7 days with less than 75% completion, or high priority behind schedule
    if (daysRemaining <= 7 && task.completion_percentage < 75) return 'Medium';
    if (task.priority === 'High' && task.completion_percentage < 80) return 'Medium';
    
    // Low risk: Due within 14 days with less than 50% completion
    if (daysRemaining <= 14 && task.completion_percentage < 50) return 'Low';
    
    return 'Low';
  };

  const filterAtRiskTasks = (tasks: Task[]): RiskTask[] => {
    const today = new Date();
    
    return tasks
      .filter(task => task.status !== 'Complete') // Only include incomplete tasks
      .map(task => {
        const daysRemaining = calculateDaysRemaining(task.due_date);
        const riskLevel = calculateRiskLevel(task, daysRemaining);
        return { ...task, daysRemaining, riskLevel };
      })
      .filter(task => {
        // Include tasks that are at risk based on our criteria
        return task.daysRemaining < 0 || // Overdue
               (task.daysRemaining <= 14 && task.completion_percentage < 90) || // Due soon and not nearly complete
               (task.priority === 'High' && task.completion_percentage < 80); // High priority behind schedule
      })
      .sort((a, b) => {
        // Sort by risk level (High > Medium > Low), then by days remaining (ascending)
        const riskOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        }
        return a.daysRemaining - b.daysRemaining;
      });
  };

  const loadRiskTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data: TasksResponse = await apiService.getTasks();
      const atRiskTasks = filterAtRiskTasks(data.tasks);
      setRiskTasks(atRiskTasks);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load risk data');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string): string => {
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDaysRemaining = (days: number): string => {
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    } else if (days === 0) {
      return 'Due today';
    } else if (days === 1) {
      return '1 day remaining';
    } else {
      return `${days} days remaining`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Management</h1>
          <p className="text-gray-600">Loading risk assessment data...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Management</h1>
          <p className="text-gray-600">Error loading risk assessment data</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Management</h1>
        <p className="text-gray-600">
          Tasks at risk of not being completed on time
        </p>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">High Risk</h3>
            <p className="text-2xl font-bold text-red-600">
              {riskTasks.filter(task => task.riskLevel === 'High').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Requires immediate attention</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Medium Risk</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {riskTasks.filter(task => task.riskLevel === 'Medium').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Monitor closely</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Low Risk</h3>
            <p className="text-2xl font-bold text-green-600">
              {riskTasks.filter(task => task.riskLevel === 'Low').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Keep on schedule</p>
          </div>
        </div>
      </div>

      {/* Risk Tasks Table */}
      {riskTasks.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold text-green-800 mb-2">No Tasks at Risk</h3>
          <p className="text-green-600">All tasks are on track for completion within their scheduled timelines.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {riskTasks.map((task) => (
                  <tr 
                    key={task.id} 
                    className="hover:bg-gray-50 cursor-pointer relative"
                    onMouseEnter={() => setHoveredRow(task.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {task.task_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateShort(task.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={task.daysRemaining < 0 ? 'text-red-600 font-medium' : ''}>
                        {formatDaysRemaining(task.daysRemaining)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(task.riskLevel)}`}>
                        {task.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.owner}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Tooltip */}
          {/* {hoveredRow && (
            <div className="absolute z-50 bg-gray-900 text-white text-sm rounded-lg shadow-lg max-w-md p-4 pointer-events-none" 
                 style={{
                   top: '50%',
                   left: '50%',
                   transform: 'translate(-50%, -50%)'
                 }}>
              {riskTasks.find(task => task.id === hoveredRow) && (
                <div className="space-y-2">
                  <div>
                    <strong>Description:</strong>
                    <p className="mt-1">{riskTasks.find(task => task.id === hoveredRow)?.description}</p>
                  </div>
                </div>
              )}
            </div>
          )} */}
        </div>
      )}
    </div>
  );
}