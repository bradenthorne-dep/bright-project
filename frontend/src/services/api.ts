import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes timeout for file uploads
});

// Basic types for API responses
export interface FileUploadResponse {
  message: string;
  filename: string;
  file_info: {
    size_bytes: number;
    size_mb: number;
    file_type: string;
    content_type: string;
  };
}

export interface ProjectOverviewResponse {
  project_info: {
    client: string;
    project_manager: string;
    start_date: string;
    end_date: string;
    projected_go_live: string;
    current_phase: string;
    status: string;
  };
  task_metrics: {
    total_tasks: number;
    tasks_completed: number;
    tasks_in_progress: number;
    tasks_on_hold: number;
    tasks_open: number;
    completion_percentage: number;
  };
  budget_info: {
    allocated_budget: number;
    spent_budget: number;
    utilized_budget: number;
    budget_utilization_percentage: number;
    remaining_budget: number;
  };
  hourly_rate: number;
  top_tasks: Array<{
    task: string;
    billable_hours: number;
    total_cost: number;
  }>;
}

export interface Task {
  id: number;
  category: string;
  subcategory: string;
  task_name: string;
  description: string;
  owner: string;
  team: string;
  status: string;
  priority: string;
  start_date: string;
  due_date: string;
  completion_percentage: number;
  comments: string;
  billable_hours: number;
}

export interface TasksResponse {
  tasks: Task[];
}


// API functions
export const apiService = {
  // Health check
  async healthCheck() {
    const response = await api.get('/');
    return response.data;
  },

  // Generic file upload
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get project overview data
  async getProjectOverview(): Promise<ProjectOverviewResponse> {
    const response = await api.get('/api/project-overview');
    return response.data;
  },

  // Get task tracking data
  async getTasks(): Promise<TasksResponse> {
    const response = await api.get('/api/tasks');
    return response.data;
  },

};

export default apiService;