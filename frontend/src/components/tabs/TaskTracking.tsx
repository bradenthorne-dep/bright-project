'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { apiService, Task, TasksResponse } from '@/services/api';
import { formatDateShort } from '@/utils/formatters';

interface TaskTrackingProps {
  onSectionChange?: (section: string) => void;
  selectedProject?: string;
}

export default function TaskTracking({ selectedProject = '' }: TaskTrackingProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  
  // Category navigation state
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [selectedProject]);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const project = selectedProject || undefined;
      const data: TasksResponse = await apiService.getTasks(project);
      setTasks(data.tasks);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data.tasks.map(task => task.category)));
      setCategories(['All', ...uniqueCategories.sort()]);
      
      // Reset to "All" when project changes
      setSelectedCategory('All');
      
      // Set filtered tasks
      setFilteredTasks(data.tasks);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    
    // Filter tasks based on selected category
    if (category === 'All') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.category === category));
    }
  };



  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'validation':
        return 'bg-yellow-100 text-yellow-800';
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

  const getTeamColor = (team: string): string => {
    switch (team.toLowerCase()) {
      case 'deposco':
        return 'bg-orange-100 text-orange-800';
      case 'client':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeamDisplayName = (team: string): string => {
    return team.toLowerCase() === 'client' ? 'Gerber4' : team;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Tracking</h1>
          <p className="text-gray-600">Loading task data...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Tracking</h1>
          <p className="text-gray-600">Error loading task data</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Tracking</h1>
        <p className="text-gray-600">Comprehensive view of all project tasks and current status</p>
      </div>

      {/* Category Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${selectedCategory === category
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {category}
              {selectedCategory === category && (
                <span className="ml-2 bg-orange-100 text-orange-600 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {category === 'All' 
                    ? tasks.length 
                    : tasks.filter(t => t.category === category).length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subcategory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Billable Hours
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 cursor-pointer relative"
                  onMouseEnter={() => setHoveredRow(task.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.subcategory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.task_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTeamColor(task.team)}`}>
                      {getTeamDisplayName(task.team)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateShort(task.start_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateShort(task.due_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${task.completion_percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{task.completion_percentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.billable_hours}
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
            {tasks.find(task => task.id === hoveredRow) && (
              <div className="space-y-2">
                <div>
                  <strong>Description:</strong>
                  <p className="mt-1">{tasks.find(task => task.id === hoveredRow)?.description}</p>
                </div>
                <div>
                  <strong>Comments:</strong>
                  <p className="mt-1">{tasks.find(task => task.id === hoveredRow)?.comments}</p>
                </div>
              </div>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
}