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

export interface Project {
  id: string;
  name: string;
  tracker_file: string;
}

export interface ProjectsResponse {
  projects: Project[];
}

export interface RiskTask extends Task {
  days_remaining: number;
  days_remaining_formatted: string;
  risk_level: 'High' | 'Medium' | 'Low';
}

export interface RiskAssessmentResponse {
  risk_tasks: RiskTask[];
  summary: {
    total_at_risk: number;
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
  };
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

  // MSA file upload
  async uploadMsaFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/upload-msa', formData, {
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

  // Get available projects
  async getProjects(): Promise<ProjectsResponse> {
    const response = await api.get('/api/projects');
    return response.data;
  },

  // Get task tracking data
  async getTasks(project?: string): Promise<TasksResponse> {
    const params = project ? { project } : {};
    const response = await api.get('/api/tasks', { params });
    return response.data;
  },

  // Get risk assessment data
  async getRiskAssessment(): Promise<RiskAssessmentResponse> {
    const response = await api.get('/api/risk-assessment');
    return response.data;
  },

};

export default apiService;