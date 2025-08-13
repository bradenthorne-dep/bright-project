'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Check, X, Plus } from 'lucide-react';
import { apiService, Task, TasksResponse, TaskUpdate } from '@/services/api';
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
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<TaskUpdate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskData, setNewTaskData] = useState<any>({  
    category: '',
    subcategory: '',
    task_name: '',
    description: '',
    owner: '',
    team: 'Deposco',
    status: 'In Progress',
    priority: 'Medium',
    start_date: new Date().toISOString().split('T')[0],
    due_date: '',
    completion_percentage: 0,
    comments: '',
    billable_hours: 0
  });
  
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

  // Handle editing a task
  const handleEditClick = (taskId: number) => {
    setEditingTask(taskId);
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (taskToEdit) {
      setEditFormData({
        id: taskToEdit.id,
        category: taskToEdit.category,
        subcategory: taskToEdit.subcategory,
        task_name: taskToEdit.task_name,
        owner: taskToEdit.owner,
        team: taskToEdit.team,
        status: taskToEdit.status,
        priority: taskToEdit.priority,
        start_date: taskToEdit.start_date,
        due_date: taskToEdit.due_date,
        completion_percentage: taskToEdit.completion_percentage,
        billable_hours: taskToEdit.billable_hours,
      });
    }
  };

  // Handle form field changes
  const handleFormChange = (field: string, value: string | number) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [field]: value
      });
    }
  };

  // Handle saving the edited task
  const handleSaveTask = async () => {
    if (!editFormData) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const project = selectedProject || undefined;
      await apiService.updateTask(editFormData, project);
      
      // Update the local tasks state
      const updatedTasks = tasks.map(task =>
        task.id === editFormData.id ? { ...task, ...editFormData } : task
      );
      
      setTasks(updatedTasks);
      
      // Update filtered tasks if needed
      setFilteredTasks(prevFiltered => {
        if (selectedCategory === 'All') {
          return updatedTasks;
        } else {
          return updatedTasks.filter(task => task.category === selectedCategory);
        }
      });
      
      // Reset editing state
      setEditingTask(null);
      setEditFormData(null);
      setSaveMessage('Task updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (err: any) {
      setSaveMessage(`Error: ${err.response?.data?.detail || err.message || 'Failed to update task'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle canceling the edit
  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditFormData(null);
  };

  // Handle adding a new task
  const handleAddTaskClick = () => {
    setIsAddingTask(true);
    // If a category is selected, pre-fill it
    if (selectedCategory !== 'All') {
      setNewTaskData(prev => ({
        ...prev,
        category: selectedCategory
      }));
    }
  };

  // Handle new task form changes
  const handleNewTaskChange = (field: string, value: string | number) => {
    setNewTaskData({
      ...newTaskData,
      [field]: value
    });
  };

  // Handle saving the new task
  const handleSaveNewTask = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const project = selectedProject || undefined;
      await apiService.createTask(newTaskData, project);
      
      // Reload tasks to get the new one with the server-assigned ID
      await loadTasks();
      
      // Reset the form
      setIsAddingTask(false);
      setNewTaskData({
        category: selectedCategory !== 'All' ? selectedCategory : '',
        subcategory: '',
        task_name: '',
        description: '',
        owner: '',
        team: 'Deposco',
        status: 'In Progress',
        priority: 'Medium',
        start_date: new Date().toISOString().split('T')[0],
        due_date: '',
        completion_percentage: 0,
        comments: '',
        billable_hours: 0
      });
      
      setSaveMessage('Task added successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (err: any) {
      setSaveMessage(`Error: ${err.response?.data?.detail || err.message || 'Failed to add task'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle canceling the add task form
  const handleCancelAddTask = () => {
    setIsAddingTask(false);
    setNewTaskData({
      category: '',
      subcategory: '',
      task_name: '',
      description: '',
      owner: '',
      team: 'Deposco',
      status: 'In Progress',
      priority: 'Medium',
      start_date: new Date().toISOString().split('T')[0],
      due_date: '',
      completion_percentage: 0,
      comments: '',
      billable_hours: 0
    });
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
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleAddTaskClick} 
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md flex items-center space-x-2"
          disabled={isAddingTask}
        >
          <Plus className="h-5 w-5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* New Task Form */}
      {isAddingTask && (
        <div className="bg-white rounded-lg shadow p-6 mb-6 border-2 border-orange-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newTaskData.category}
                onChange={(e) => handleNewTaskChange('category', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newTaskData.subcategory}
                onChange={(e) => handleNewTaskChange('subcategory', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newTaskData.task_name}
                onChange={(e) => handleNewTaskChange('task_name', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newTaskData.owner}
                onChange={(e) => handleNewTaskChange('owner', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={newTaskData.team}
                onChange={(e) => handleNewTaskChange('team', e.target.value)}
                required
              >
                <option value="Deposco">Deposco</option>
                <option value="Client">Client</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={newTaskData.status}
                onChange={(e) => handleNewTaskChange('status', e.target.value)}
                required
              >
                <option value="Complete">Complete</option>
                <option value="In Progress">In Progress</option>
                <option value="Validation">Validation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={newTaskData.priority}
                onChange={(e) => handleNewTaskChange('priority', e.target.value)}
                required
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={newTaskData.start_date}
                onChange={(e) => handleNewTaskChange('start_date', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={newTaskData.due_date}
                onChange={(e) => handleNewTaskChange('due_date', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Completion %</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={newTaskData.completion_percentage}
                onChange={(e) => handleNewTaskChange('completion_percentage', parseInt(e.target.value, 10))}
                min="0"
                max="100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billable Hours</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={newTaskData.billable_hours}
                onChange={(e) => handleNewTaskChange('billable_hours', parseFloat(e.target.value))}
                step="0.5"
                min="0"
                required
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={newTaskData.description}
                onChange={(e) => handleNewTaskChange('description', e.target.value)}
                rows={2}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={newTaskData.comments}
                onChange={(e) => handleNewTaskChange('comments', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleCancelAddTask}
              className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNewTask}
              disabled={isSaving}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {isSaving ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </div>
      )}

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
                  className={`hover:bg-gray-50 cursor-pointer relative ${editingTask === task.id ? 'bg-blue-50' : ''}`}
                  onMouseEnter={() => setHoveredRow(task.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => {
                    if (editingTask === null) {
                      handleEditClick(task.id);
                    }
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingTask === task.id && editFormData ? (
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1"
                        value={editFormData.subcategory}
                        onChange={(e) => handleFormChange('subcategory', e.target.value)}
                      />
                    ) : (
                      task.subcategory
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editingTask === task.id && editFormData ? (
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1"
                        value={editFormData.task_name}
                        onChange={(e) => handleFormChange('task_name', e.target.value)}
                      />
                    ) : (
                      task.task_name
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingTask === task.id && editFormData ? (
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1"
                        value={editFormData.owner}
                        onChange={(e) => handleFormChange('owner', e.target.value)}
                      />
                    ) : (
                      task.owner
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingTask === task.id && editFormData ? (
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={editFormData.team}
                        onChange={(e) => handleFormChange('team', e.target.value)}
                      >
                        <option value="Deposco">Deposco</option>
                        <option value="Client">Client</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTeamColor(task.team)}`}>
                        {getTeamDisplayName(task.team)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingTask === task.id && editFormData ? (
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={editFormData.status}
                        onChange={(e) => handleFormChange('status', e.target.value)}
                      >
                        <option value="Complete">Complete</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Validation">Validation</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingTask === task.id && editFormData ? (
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={editFormData.priority}
                        onChange={(e) => handleFormChange('priority', e.target.value)}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingTask === task.id && editFormData ? (
                      <input
                        type="date"
                        className="w-full border rounded px-2 py-1"
                        value={editFormData.start_date}
                        onChange={(e) => handleFormChange('start_date', e.target.value)}
                      />
                    ) : (
                      formatDateShort(task.start_date)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingTask === task.id && editFormData ? (
                      <input
                        type="date"
                        className="w-full border rounded px-2 py-1"
                        value={editFormData.due_date}
                        onChange={(e) => handleFormChange('due_date', e.target.value)}
                      />
                    ) : (
                      formatDateShort(task.due_date)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingTask === task.id && editFormData ? (
                      <div className="flex items-center">
                        <input
                          type="number"
                          className="w-full border rounded px-2 py-1"
                          value={editFormData.completion_percentage}
                          min="0"
                          max="100"
                          onChange={(e) => handleFormChange('completion_percentage', parseInt(e.target.value, 10))}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${task.completion_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{task.completion_percentage}%</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingTask === task.id && editFormData ? (
                      <input
                        type="number"
                        className="w-full border rounded px-2 py-1"
                        value={editFormData.billable_hours}
                        step="0.5"
                        min="0"
                        onChange={(e) => handleFormChange('billable_hours', parseFloat(e.target.value))}
                      />
                    ) : (
                      task.billable_hours
                    )}
                  </td>

                  {editingTask === task.id && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveTask();
                          }}
                          disabled={isSaving}
                          className="p-1 rounded-full bg-green-100 hover:bg-green-200 text-green-600"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                          className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  )}
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
      
      {/* Save Message */}
      {saveMessage && (
        <div className={`mt-4 p-4 rounded-md ${saveMessage.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {saveMessage}
        </div>
      )}
    </div>
  );
}