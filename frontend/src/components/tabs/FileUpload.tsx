'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { apiService } from '@/services/api';

interface FileUploadTabProps {
  onDataUploaded: () => void;
  onDataAvailable: () => void;
}

export default function FileUploadTab({ onDataUploaded, onDataAvailable }: FileUploadTabProps) {
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [msaFile, setMsaFile] = useState<File | null>(null);
  const [isUploadingDesign, setIsUploadingDesign] = useState(false);
  const [isUploadingMsa, setIsUploadingMsa] = useState(false);
  const [designUploadSuccess, setDesignUploadSuccess] = useState(false);
  const [msaUploadSuccess, setMsaUploadSuccess] = useState(false);
  const [designUploadError, setDesignUploadError] = useState<string | null>(null);
  const [msaUploadError, setMsaUploadError] = useState<string | null>(null);
  const [designDragOver, setDesignDragOver] = useState(false);
  const [msaDragOver, setMsaDragOver] = useState(false);

  const designFileInputRef = useRef<HTMLInputElement>(null);
  const msaFileInputRef = useRef<HTMLInputElement>(null);

  // Design Document file handlers
  const handleDesignFileSelect = (selectedFile: File) => {
    // Validate file type - accept PDF and DOCX files
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!supportedTypes.includes(selectedFile.type)) {
      setDesignUploadError('Only PDF and DOCX files are supported. Please select a PDF or DOCX file.');
      return;
    }
    
    setDesignFile(selectedFile);
    setDesignUploadError(null);
    setDesignUploadSuccess(false);
  };

  const handleDesignDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDesignDragOver(true);
  };

  const handleDesignDragLeave = () => {
    setDesignDragOver(false);
  };

  const handleDesignDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDesignDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleDesignFileSelect(droppedFiles[0]);
    }
  };

  const removeDesignFile = () => {
    setDesignFile(null);
  };

  // MSA file handlers
  const handleMsaFileSelect = (selectedFile: File) => {
    // Validate file type - accept PDF and DOCX files
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!supportedTypes.includes(selectedFile.type)) {
      setMsaUploadError('Only PDF and DOCX files are supported. Please select a PDF or DOCX file.');
      return;
    }
    
    setMsaFile(selectedFile);
    setMsaUploadError(null);
    setMsaUploadSuccess(false);
  };

  const handleMsaDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setMsaDragOver(true);
  };

  const handleMsaDragLeave = () => {
    setMsaDragOver(false);
  };

  const handleMsaDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setMsaDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleMsaFileSelect(droppedFiles[0]);
    }
  };

  const removeMsaFile = () => {
    setMsaFile(null);
  };

  // Design document upload
  const handleDesignUpload = async () => {
    if (!designFile) {
      setDesignUploadError('Please select a file');
      return;
    }

    setIsUploadingDesign(true);
    setDesignUploadError(null);

    try {
      const result = await apiService.uploadFile(designFile);
      
      setDesignUploadSuccess(true);
      onDataUploaded();
      
    } catch (error: any) {
      setDesignUploadError('Upload failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsUploadingDesign(false);
    }
  };

  // MSA document upload
  const handleMsaUpload = async () => {
    if (!msaFile) {
      setMsaUploadError('Please select a file');
      return;
    }

    setIsUploadingMsa(true);
    setMsaUploadError(null);

    try {
      const result = await apiService.uploadMsaFile(msaFile);
      
      setMsaUploadSuccess(true);
      onDataUploaded();
      
    } catch (error: any) {
      setMsaUploadError('Upload failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsUploadingMsa(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">File Upload</h1>
        <p className="text-gray-600">
          Upload Project Documents
        </p>
      </div>

      {/* File Upload Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Design Document Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Design Document</h2>
          
          {/* Status Messages */}
          {designUploadError && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700">{designUploadError}</p>
            </div>
          )}

          {designUploadSuccess && (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-700">Design document uploaded successfully!</p>
            </div>
          )}

          {/* Design File Upload Box */}
          <div className="card">
            <div className="card-content">
              <h3 className="font-semibold text-gray-900 mb-2">Design Document Upload</h3>
              <p className="text-sm text-gray-600 mb-4">Upload Design Document (PDF or DOCX)</p>
              
              <div
                className={`file-upload-area ${designDragOver ? 'dragover' : ''}`}
                onDragOver={handleDesignDragOver}
                onDragLeave={handleDesignDragLeave}
                onDrop={handleDesignDrop}
                onClick={() => designFileInputRef.current?.click()}
              >
                <input
                  ref={designFileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      handleDesignFileSelect(selectedFile);
                    }
                  }}
                  className="hidden"
                />
                
                {designFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{designFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(designFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDesignFile();
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drop design document here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF and DOCX files (.pdf, .docx)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Design Upload Button */}
          <div className="flex justify-center">
            <button
              onClick={handleDesignUpload}
              disabled={!designFile || isUploadingDesign}
              className={`btn ${designFile && !isUploadingDesign ? 'btn-primary' : 'btn-secondary'} px-8 py-3 text-base`}
            >
              {isUploadingDesign ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                'Upload Design Document'
              )}
            </button>
          </div>
        </div>

        {/* MSA Document Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">MSA Document</h2>
          
          {/* Status Messages */}
          {msaUploadError && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700">{msaUploadError}</p>
            </div>
          )}

          {msaUploadSuccess && (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-700">MSA document uploaded successfully!</p>
            </div>
          )}

          {/* MSA File Upload Box */}
          <div className="card">
            <div className="card-content">
              <h3 className="font-semibold text-gray-900 mb-2">MSA Document Upload</h3>
              <p className="text-sm text-gray-600 mb-4">Upload Master Service Agreement (PDF or DOCX)</p>
              
              <div
                className={`file-upload-area ${msaDragOver ? 'dragover' : ''}`}
                onDragOver={handleMsaDragOver}
                onDragLeave={handleMsaDragLeave}
                onDrop={handleMsaDrop}
                onClick={() => msaFileInputRef.current?.click()}
              >
                <input
                  ref={msaFileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      handleMsaFileSelect(selectedFile);
                    }
                  }}
                  className="hidden"
                />
                
                {msaFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{msaFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(msaFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMsaFile();
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drop MSA document here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF and DOCX files (.pdf, .docx)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MSA Upload Button */}
          <div className="flex justify-center">
            <button
              onClick={handleMsaUpload}
              disabled={!msaFile || isUploadingMsa}
              className={`btn ${msaFile && !isUploadingMsa ? 'btn-primary' : 'btn-secondary'} px-8 py-3 text-base`}
            >
              {isUploadingMsa ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                'Upload MSA Document'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}