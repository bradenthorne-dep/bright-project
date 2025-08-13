'use client';

import { useEffect, useState } from 'react';
import apiService, { ProjectOverviewResponse } from '@/services/api';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { getProjectLogo, getProjectLogoAlt } from '@/utils/projectLogos';

interface HomeProps {
  onSectionChange?: (section: string) => void;
}

interface ProjectSummary {
  client: string;
  projectManager: string;
  startDate: string;
  projectedGoLiveDate: string;
  status: string;
  currentPhase: string;
  completionPercentage: number;
}

export default function Home({ onSectionChange }: HomeProps) {
  // Fallback function for formatDate if the formatter utility fails
  const safeDateFormat = (dateString: string) => {
    try {
      return formatDate(dateString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return the original string if formatting fails
    }
  };
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Define the fallback sample data
        const sampleData: ProjectSummary[] = [
          {
            client: "TechCorp Solutions",
            projectManager: "Sarah Johnson",
            startDate: "2024-01-15",
            projectedGoLiveDate: "2024-12-01",
            status: "In Progress",
            currentPhase: "Development",
            completionPercentage: 45,
          },
          {
            client: "EcoAtm",
            projectManager: "Michael Chen",
            startDate: "2024-02-20",
            projectedGoLiveDate: "2024-11-15",
            status: "In Progress",
            currentPhase: "API Integration",
            completionPercentage: 60,
          },
          {
            client: "Neovia",
            projectManager: "Alex Rodriguez",
            startDate: "2024-04-05",
            projectedGoLiveDate: "2025-01-10",
            status: "In Progress",
            currentPhase: "Design",
            completionPercentage: 25,
          },
          {
            client: "CDCBME",
            projectManager: "Emily Watson",
            startDate: "2024-03-18",
            projectedGoLiveDate: "2024-09-30",
            status: "On Hold",
            currentPhase: "Requirements Gathering",
            completionPercentage: 15,
          },
          {
            client: "Acme Manufacturing",
            projectManager: "David Wilson",
            startDate: "2024-03-10",
            projectedGoLiveDate: "2024-10-15",
            status: "On Hold",
            currentPhase: "Design",
            completionPercentage: 30,
          },
          {
            client: "Global Retail Inc",
            projectManager: "Jennifer Martinez",
            startDate: "2024-05-22",
            projectedGoLiveDate: "2025-02-28",
            status: "Complete",
            currentPhase: "Implementation",
            completionPercentage: 100,
          }
        ];
        
        let apiProject = null;
        
        // Try to fetch data from API
        try {
          const data = await apiService.getProjectOverview();
          
          // Transform the data into our ProjectSummary format
          apiProject = {
            client: data.project_info.client,
            projectManager: data.project_info.project_manager,
            startDate: data.project_info.start_date,
            projectedGoLiveDate: data.project_info.projected_go_live,
            status: data.project_info.status,
            currentPhase: data.project_info.current_phase,
            completionPercentage: data.task_metrics.completion_percentage,
          };
          
          // Combine API project with sample data
          // Check if the API project is already in the sample data (by client name)
          const apiClientExists = sampleData.some(project => project.client === apiProject.client);
          
          if (!apiClientExists && apiProject) {
            // Add the API project to the beginning of the array
            setProjects([apiProject, ...sampleData]);
          } else {
            // Just use the sample data as is
            setProjects(sampleData);
          }
          
          setError(null);
        } catch (apiError) {
          console.error('API error:', apiError);
          
          // If API is not available, just use the sample data
          setProjects(sampleData);
          setError("Using sample data (backend unavailable)");
        }
      } catch (err) {
        console.error('Error in Home component:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (clientName: string) => {
    // Navigate to the overview section for this project
    if (onSectionChange) {
      onSectionChange('overview');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Projects</h1>
      </div>

      {loading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )}

      {error && error !== "Using sample data (backend unavailable)" && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {error === "Using sample data (backend unavailable)" && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4">
          <p className="text-yellow-800">Note: Displaying sample project data. Backend server is unavailable.</p>
        </div>
      )}

      {!loading && error !== "Using sample data (backend unavailable)" && !error && projects.length === 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-blue-800">No projects found. Upload project data to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div
            key={index}
            onClick={() => handleProjectClick(project.client)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
          >
            <div className="h-16 bg-gray-800 flex items-center justify-center">
              <img 
                src={getProjectLogo(project.client)} 
                alt={getProjectLogoAlt(project.client)} 
                className="w-[90%] h-[90%] object-cover"
              />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{project.client}</h2>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  project.status === 'Complete' ? 'bg-green-100 text-green-800' : 
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Project Manager:</span>
                  <span className="font-medium">{project.projectManager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Start Date:</span>
                  <span>{formatDate(project.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Go Live Date:</span>
                  <span>{formatDate(project.projectedGoLiveDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Phase:</span>
                  <span>{project.currentPhase}</span>
                </div>
              </div>

              <div className="pt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion</span>
                  <span className="font-medium">{project.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${project.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}