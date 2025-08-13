'use client';

import { useState, useEffect } from 'react';
import { 
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { apiService, Project, ProjectsResponse } from '@/services/api';

interface LayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  selectedProject?: string;
  onProjectChange?: (project: string) => void;
}

const navigationItems = [
  { id: 'home', label: 'Home' },
  { id: 'data-upload', label: 'File Upload' },
  { id: 'overview', label: 'Overview' },
  { id: 'task-tracking', label: 'Task Tracking' },
  { id: 'risk-management', label: 'Risk Management' },
];

export default function Layout({ children, activeSection = 'home', onSectionChange, selectedProject = '', onProjectChange }: LayoutProps) {
  const [currentSection, setCurrentSection] = useState(activeSection);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Sync internal state with prop changes
  useEffect(() => {
    setCurrentSection(activeSection);
  }, [activeSection]);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setProjectsLoading(true);
    try {
      const data: ProjectsResponse = await apiService.getProjects();
      setProjects(data.projects);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleSectionClick = (sectionId: string) => {
    setCurrentSection(sectionId);
    setIsMobileMenuOpen(false);
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  const handleProjectChange = (projectId: string) => {
    if (onProjectChange) {
      onProjectChange(projectId);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-58">
          <div className="flex flex-col h-full bg-gray-800">
            {/* Logo Section */}
            <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-gray-900 border-b border-gray-700">
              <div className="flex items-center">
                <img 
                  src="/bright_project_main_logo.png" 
                  alt="Bright Project" 
                  className="h-12 w-auto max-w-full object-contain"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = currentSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionClick(item.id)}
                      className={`${
                        isActive
                          ? 'bg-orange-600 text-white border-r-2 border-orange-400'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } group flex items-center px-4 py-2 text-sm font-medium rounded-md w-full text-left transition-colors duration-200`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Footer section */}
              <div className="flex-shrink-0 border-t border-gray-700 p-4">
                <div className="text-xs text-gray-400">
                  Bright Project
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Mobile navigation */}
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4 mb-5">
                <img 
                  src="/bright_project_main_logo.png" 
                  alt="Bright Project" 
                  className="h-6 w-auto"
                />
                <div className="ml-2 text-xs text-gray-300 font-medium">
                  Bright Project
                </div>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = currentSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionClick(item.id)}
                      className={`${
                        isActive
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } group flex items-center px-4 py-2 text-base font-medium rounded-md w-full text-left`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex-shrink-0">
          <div className="relative z-10 flex h-16 bg-white shadow border-b border-gray-200">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 px-4 flex justify-between items-center">
              <div className="flex items-center">
                <img 
                  src="/bright_project_main_logo.png" 
                  alt="Bright Project" 
                  className="h-6 w-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Project Selection Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 md:px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={selectedProject}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white pr-10 min-w-[200px]"
                    disabled={projectsLoading}
                  >
                    <option value="">All Projects (Default)</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {projectsLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-500"></div>
                )}
                {selectedProject && (
                  <span className="text-sm text-gray-600">
                    Viewing: <span className="font-medium">{projects.find(p => p.id === selectedProject)?.name}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="animate-fade-in">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}