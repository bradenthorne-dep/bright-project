'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import FileUpload from '@/components/tabs/FileUpload';
import Overview from '@/components/tabs/Overview';
import TaskTracking from '@/components/tabs/TaskTracking';
import RiskManagement from '@/components/tabs/RiskManagement';

export default function DiagnosticPage() {
  const [activeSection, setActiveSection] = useState('data-upload');

  const setDataAvailable = () => {
    // Data availability callback - currently unused
  };

  const handleDataUpload = () => {
    // Data upload callback - currently unused
  };

  const handleNavigationChange = (section: string) => {
    setActiveSection(section);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'data-upload':
        return <FileUpload onDataUploaded={handleDataUpload} onDataAvailable={setDataAvailable} />;
      case 'overview':
        return <Overview onSectionChange={handleNavigationChange} />;
      case 'task-tracking':
        return <TaskTracking onSectionChange={handleNavigationChange} />;
      case 'risk-management':
        return <RiskManagement onSectionChange={handleNavigationChange} />;
      default:
        return <FileUpload onDataUploaded={handleDataUpload} onDataAvailable={setDataAvailable} />;
    }
  };

  return (
    <Layout activeSection={activeSection} onSectionChange={handleNavigationChange}>
      {renderActiveSection()}
    </Layout>
  );
}