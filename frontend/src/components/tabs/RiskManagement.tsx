'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { apiService, RiskAssessmentResponse } from '@/services/api';
import { formatDateShort } from '@/utils/formatters';

interface RiskManagementProps {
  onSectionChange?: (section: string) => void;
}

export default function RiskManagement({}: RiskManagementProps) {
  const [riskData, setRiskData] = useState<RiskAssessmentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    loadRiskAssessment();
  }, []);

  const loadRiskAssessment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getRiskAssessment();
      setRiskData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load risk assessment');
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

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Management</h1>
          <p className="text-gray-600">Tasks at risk of not being completed on time</p>
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
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">High Risk</h3>
            <p className="text-2xl font-bold text-red-600">
              {riskData?.summary.high_risk_count || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Requires immediate attention</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Medium Risk</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {riskData?.summary.medium_risk_count || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Monitor closely</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Low Risk</h3>
            <p className="text-2xl font-bold text-green-600">
              {riskData?.summary.low_risk_count || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Keep on schedule</p>
          </div>
        </div>
      </div>
      </div>
      
      {/* Risk Tasks Table */}
      {!riskData || riskData.summary.total_at_risk === 0 ? (
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
                {riskData.risk_tasks.map((task) => (
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
                      <span className={task.days_remaining < 0 ? 'text-red-600 font-medium' : ''}>
                        {task.days_remaining_formatted}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(task.risk_level)}`}>
                        {task.risk_level}
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
              {riskData?.risk_tasks.find(task => task.id === hoveredRow) && (
                <div className="space-y-2">
                  <div>
                    <strong>Description:</strong>
                    <p className="mt-1">{riskData.risk_tasks.find(task => task.id === hoveredRow)?.description}</p>
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