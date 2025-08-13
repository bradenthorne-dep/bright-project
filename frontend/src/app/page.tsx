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
  const [selectedProject, setSelectedProject] = useState('');

  const setDataAvailable = () => {
    // Data availability callback - currently unused
  };

  const handleDataUpload = () => {
    // Data upload callback - currently unused
  };

  const handleNavigationChange = (section: string) => {
    setActiveSection(section);
  };

  const handleProjectChange = (project: string) => {
    setSelectedProject(project);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return <Home onSectionChange={handleNavigationChange} />;
      case 'data-upload':
        return <FileUpload onDataUploaded={handleDataUpload} onDataAvailable={setDataAvailable} />;
      case 'overview':
        return <Overview onSectionChange={handleNavigationChange} />;
      case 'task-tracking':
        return <TaskTracking onSectionChange={handleNavigationChange} selectedProject={selectedProject} />;
      case 'risk-management':
        return <RiskManagement onSectionChange={handleNavigationChange} />;
      default:
        return <Home onSectionChange={handleNavigationChange} />;
    }
  };

  return (
    <Layout 
      activeSection={activeSection} 
      onSectionChange={handleNavigationChange}
      selectedProject={selectedProject}
      onProjectChange={handleProjectChange}
    >
      {renderActiveSection()}
    </Layout>
  );
}