'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Wifi, WifiOff } from 'lucide-react';
import { apiService } from '@/services/api';

interface FileUploadTabProps {
  onDataUploaded: () => void;
  onDataAvailable: () => void;
  isConnectedToSalesforce?: boolean;
  onSalesforceConnect?: (connected: boolean) => void;
  onSectionChange?: (section: string) => void;
  onNewProjectCreated?: (projectType: 'manual' | 'salesforce', projectNames?: string[]) => void;
}

interface UploadedFile {
  file: File;
  type: 'design' | 'msa';
  uploaded: boolean;
  uploading: boolean;
  error?: string;
}

export default function FileUploadTab({ onDataUploaded, onDataAvailable, isConnectedToSalesforce = false, onSalesforceConnect, onSectionChange, onNewProjectCreated }: FileUploadTabProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Salesforce connection simulation states
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [connectionStep, setConnectionStep] = useState('login'); // login, connecting, opportunities, success
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);
  const [importedCount, setImportedCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample opportunity data
  const opportunities = [
    { id: 'acme', name: 'ACME Corporation', description: 'Enterprise software implementation' },
    { id: 'cdcbme', name: 'CDCBME Solutions', description: 'Digital transformation project' },
    { id: 'neovia', name: 'NEOVIA Logistics', description: 'Supply chain optimization' }
  ];

  // Salesforce connection simulation functions
  const handleConnectToSalesforce = () => {
    setShowConnectionModal(true);
    setConnectionStep('login');
  };

  const handleGoogleSignIn = () => {
    setConnectionStep('connecting');
    // Simulate connection delay
    setTimeout(() => {
      setConnectionStep('opportunities');
      setSelectedOpportunities(opportunities.map(opp => opp.id)); // Select all by default
    }, 2000);
  };

  const handleOpportunityToggle = (opportunityId: string) => {
    setSelectedOpportunities(prev => 
      prev.includes(opportunityId) 
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  const handleSelectAll = () => {
    setSelectedOpportunities(opportunities.map(opp => opp.id));
  };

  const handleDeselectAll = () => {
    setSelectedOpportunities([]);
  };

  const handleImportProjects = () => {
    setImportedCount(selectedOpportunities.length);
    setConnectionStep('success');
    
    // Get the names of selected opportunities
    const selectedProjectNames = opportunities
      .filter(opp => selectedOpportunities.includes(opp.id))
      .map(opp => opp.name);
    
    // After showing success, connect to Salesforce and close modal
    setTimeout(() => {
      onSalesforceConnect?.(true);
      onNewProjectCreated?.('salesforce', selectedProjectNames);
      setShowConnectionModal(false);
      setConnectionStep('login');
      // Navigate to home page to show imported projects
      onSectionChange?.('home');
    }, 3000);
  };

  const handleCreateProject = () => {
    // Create project with Gerber name (from uploaded files)
    onNewProjectCreated?.('manual', ['Gerber Childrenswear']);
    // Navigate to home page
    onSectionChange?.('home');
  };

  const closeModal = () => {
    setShowConnectionModal(false);
    setConnectionStep('login');
    setSelectedOpportunities([]);
  };

  // Helper functions
  const validateFile = (file: File): boolean => {
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return supportedTypes.includes(file.type);
  };

  const determineFileType = (fileName: string): 'design' | 'msa' => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('msa') || lowerName.includes('master service') || lowerName.includes('agreement')) {
      return 'msa';
    }
    return 'design';
  };

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < selectedFiles.length && uploadedFiles.length + newFiles.length < 2; i++) {
      const file = selectedFiles[i];
      
      if (!validateFile(file)) {
        setUploadError('Only PDF and DOCX files are supported. Please select valid files.');
        continue;
      }

      const fileType = determineFileType(file.name);
      
      // Check if we already have this type of file
      const existingFile = uploadedFiles.find(f => f.type === fileType);
      if (existingFile || newFiles.find(f => f.type === fileType)) {
        setUploadError(`${fileType === 'design' ? 'Design document' : 'MSA document'} already added. Remove the existing file first.`);
        continue;
      }

      newFiles.push({
        file,
        type: fileType,
        uploaded: false,
        uploading: false
      });
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setUploadError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (index: number) => {
    const fileToUpload = uploadedFiles[index];
    if (!fileToUpload || fileToUpload.uploading || fileToUpload.uploaded) return;

    setUploadedFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, uploading: true, error: undefined } : f
    ));

    try {
      if (fileToUpload.type === 'design') {
        await apiService.uploadFile(fileToUpload.file);
      } else {
        await apiService.uploadMsaFile(fileToUpload.file);
      }

      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploading: false, uploaded: true } : f
      ));
      onDataUploaded();
      
    } catch (error: any) {
      const errorMessage = 'Upload failed: ' + (error.response?.data?.detail || error.message);
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploading: false, error: errorMessage } : f
      ));
    }
  };

  const uploadAllFiles = async () => {
    const filesToUpload = uploadedFiles.filter(f => !f.uploaded && !f.uploading);
    for (let i = 0; i < uploadedFiles.length; i++) {
      if (!uploadedFiles[i].uploaded && !uploadedFiles[i].uploading) {
        await uploadFile(i);
      }
    }
  };

  // Helper variables
  const hasDesignFile = uploadedFiles.some(f => f.type === 'design');
  const hasMsaFile = uploadedFiles.some(f => f.type === 'msa');
  const allFilesUploaded = uploadedFiles.length === 2 && uploadedFiles.every(f => f.uploaded);
  const hasFilesToUpload = uploadedFiles.some(f => !f.uploaded);
  const isUploading = uploadedFiles.some(f => f.uploading);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add a New Project</h1>
        <p className="text-gray-600">
          Create a new project manually or import from Salesforce
        </p>
      </div>

      {/* Salesforce Connection Status */}
      {isConnectedToSalesforce ? (
        <div className="flex items-center justify-center p-3 bg-green-25 rounded-md">
          <div className="flex items-center justify-between w-full max-w-md">
            <div className="flex items-center space-x-3">
              <img 
                src="/Salesforcelogo.svp" 
                alt="Salesforce" 
                className="h-6 w-6"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                <span className="text-green-600 text-base font-normal">Salesforce Connected</span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowConnectionModal(true);
                setConnectionStep('opportunities');
                setSelectedOpportunities(opportunities.map(opp => opp.id));
              }}
              className="btn btn-primary px-4 py-1 text-sm ml-4"
            >
              Import
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-3 bg-gray-50 rounded-md">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600 text-base font-normal">Salesforce Not Connected</span>
            </div>
            <button
              onClick={handleConnectToSalesforce}
              className="btn btn-primary px-4 py-1 text-sm"
            >
              Connect to Salesforce
            </button>
          </div>
        </div>
      )}

      {/* Project Creation Options */}
      <div className="flex justify-center">
        {/* Manual Upload Option - Centered */}
        <div className="card max-w-2xl w-full">
          <div className="card-content">
            <h3 className="font-semibold text-gray-900 mb-2">Create Project Manually</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload Design and MSA documents manually to create a new project
            </p>

            {/* Status Messages */}
            {uploadError && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{uploadError}</p>
              </div>
            )}

            {allFilesUploaded && (
              <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-700">All documents uploaded successfully! You can now create your project.</p>
              </div>
            )}
          
            {/* File Requirements */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium mb-1">Required Documents:</p>
              <div className="text-sm text-blue-600 space-y-1">
                <div className="flex items-center space-x-2">
                  {hasDesignFile ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-blue-400 rounded-full"></div>
                  )}
                  <span>Design Document</span>
                </div>
                <div className="flex items-center space-x-2">
                  {hasMsaFile ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-blue-400 rounded-full"></div>
                  )}
                  <span>Master Service Agreement (MSA)</span>
                </div>
              </div>
            </div>
            
            {/* Upload Drop Zone - Made much shorter */}
            <div
              className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ aspectRatio: '2.5', minHeight: '150px' }}
            >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  handleFileSelect(e.target.files);
                }
              }}
              className="hidden"
            />
            
            {uploadedFiles.length === 0 ? (
              <div>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drop documents here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  PDF and DOCX files (.pdf, .docx)
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  You can upload multiple files at once
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedFiles.map((uploadedFile, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className={`h-8 w-8 ${uploadedFile.uploaded ? 'text-green-600' : 'text-blue-600'}`} />
                      <div>
                        <p className="font-medium text-gray-900">{uploadedFile.file.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{(uploadedFile.file.size / 1024).toFixed(1)} KB</span>
                          <span className="capitalize">
                            {uploadedFile.type === 'design' ? 'Design Document' : 'MSA Document'}
                          </span>
                          {uploadedFile.uploaded && (
                            <span className="text-green-600 font-medium">✓ Uploaded</span>
                          )}
                          {uploadedFile.uploading && (
                            <span className="text-blue-600">Uploading...</span>
                          )}
                        </div>
                        {uploadedFile.error && (
                          <p className="text-red-600 text-sm mt-1">{uploadedFile.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!uploadedFile.uploaded && !uploadedFile.uploading && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            uploadFile(index);
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Upload
                        </button>
                      )}
                      {uploadedFile.uploading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        disabled={uploadedFile.uploading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {uploadedFiles.length < 2 && (
                  <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 text-sm">
                      {uploadedFiles.length === 1 ? 'Add one more document' : 'Click to add more documents'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

            {/* Upload All Button */}
            {hasFilesToUpload && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={uploadAllFiles}
                  disabled={isUploading}
                  className={`btn ${!isUploading ? 'btn-primary' : 'btn-secondary'} px-8 py-3 text-base`}
                >
                  {isUploading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    `Upload ${uploadedFiles.filter(f => !f.uploaded).length} Document${uploadedFiles.filter(f => !f.uploaded).length > 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
        
      </div>
      
      {/* Create Project Button - Positioned at bottom, much smaller */}
      <div className="flex justify-center mt-8">
        <button
          disabled={!allFilesUploaded}
          onClick={handleCreateProject}
          className={`btn ${allFilesUploaded ? 'btn-primary' : 'btn-secondary'} px-4 py-1 text-sm font-normal disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none`}
        >
          Create Project
        </button>
      </div>

      {/* Salesforce Connection Modal */}
      {showConnectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            
            {/* Login Step */}
            {connectionStep === 'login' && (
              <div className="text-center">
                <div className="mb-4">
                  <img 
                    src="/Salesforcelogo.svp" 
                    alt="Salesforce" 
                    className="h-12 w-12 mx-auto mb-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <h3 className="text-xl font-semibold text-gray-900">Connect to Salesforce</h3>
                  <p className="text-gray-600 mt-2">Sign in with your Google account to connect</p>
                </div>
                
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center space-x-3 border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <span className="text-gray-700 font-medium">Continue with Google</span>
                </button>
                
                <button
                  onClick={closeModal}
                  className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Connecting Step */}
            {connectionStep === 'connecting' && (
              <div className="text-center">
                <div className="mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900">Connecting to Salesforce</h3>
                  <p className="text-gray-600 mt-2">Authenticating and syncing your account...</p>
                </div>
              </div>
            )}

            {/* Opportunities Selection Step */}
            {connectionStep === 'opportunities' && (
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">New Opportunities Found</h3>
                  <p className="text-gray-600 mt-2">Select which opportunities to import as projects</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex space-x-2 mb-3">
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={handleDeselectAll}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Deselect All
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {opportunities.map((opp) => (
                      <div key={opp.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedOpportunities.includes(opp.id)}
                          onChange={() => handleOpportunityToggle(opp.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{opp.name}</h4>
                          <p className="text-sm text-gray-600">{opp.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportProjects}
                    disabled={selectedOpportunities.length === 0}
                    className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Import {selectedOpportunities.length} Project{selectedOpportunities.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            )}

            {/* Success Step */}
            {connectionStep === 'success' && (
              <div className="text-center">
                <div className="mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900">Success!</h3>
                  <p className="text-gray-600 mt-2">
                    {importedCount} Project{importedCount !== 1 ? 's' : ''} Successfully Imported
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  You can now view your imported projects on the home page
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}