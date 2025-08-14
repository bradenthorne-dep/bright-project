'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Home from '@/components/tabs/Home';
import FileUpload from '@/components/tabs/FileUpload';
import Overview from '@/components/tabs/Overview';
import TaskTracking from '@/components/tabs/TaskTracking';
import RiskManagement from '@/components/tabs/RiskManagement';


export default function DiagnosticPage() {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedProject, setSelectedProject] = useState('Gerber Childrenswear');
  const [showGerber, setShowGerber] = useState(false);
  const [isConnectedToSalesforce, setIsConnectedToSalesforce] = useState(false);
  const [newlyCreatedProjects, setNewlyCreatedProjects] = useState<string[]>([]);

  const setDataAvailable = () => {
    // Data availability callback - currently unused
  };

  const handleDataUpload = () => {
    // Enable Gerber project visibility when a file is uploaded
    setShowGerber(true);
  };

  const handleNavigationChange = (section: string) => {
    setActiveSection(section);
  };

  const handleProjectChange = (project: string) => {
    setSelectedProject(project);
  };

  const handleNewProjectCreated = (projectType: 'manual' | 'salesforce', projectNames: string[] = []) => {
    if (projectType === 'manual') {
      setShowGerber(true);
      setNewlyCreatedProjects(['Gerber Childrenswear']);
    } else if (projectType === 'salesforce') {
      setNewlyCreatedProjects(projectNames);
    }
    
    // Clear the highlight after 2 seconds
    setTimeout(() => {
      setNewlyCreatedProjects([]);
    }, 2000);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return <Home onSectionChange={handleNavigationChange} showGerber={showGerber} isConnectedToSalesforce={isConnectedToSalesforce} newlyCreatedProjects={newlyCreatedProjects} />;
      case 'data-upload':
        return <FileUpload onDataUploaded={handleDataUpload} onDataAvailable={setDataAvailable} isConnectedToSalesforce={isConnectedToSalesforce} onSalesforceConnect={setIsConnectedToSalesforce} onSectionChange={handleNavigationChange} onNewProjectCreated={handleNewProjectCreated} />;
      case 'overview':
        return <Overview onSectionChange={handleNavigationChange} />;
      case 'task-tracking':
        return <TaskTracking onSectionChange={handleNavigationChange} />;
      case 'risk-management':
        return <RiskManagement onSectionChange={handleNavigationChange} />;
      default:
        return <Home onSectionChange={handleNavigationChange} showGerber={showGerber} isConnectedToSalesforce={isConnectedToSalesforce} newlyCreatedProjects={newlyCreatedProjects} />;
    }
  };

  return (
    <Layout 
      activeSection={activeSection} 
      onSectionChange={handleNavigationChange}
      selectedProject={selectedProject}
      onProjectChange={handleProjectChange}
      showGerber={showGerber}
      isConnectedToSalesforce={isConnectedToSalesforce}
    >
      {renderActiveSection()}
    </Layout>
  );
}