'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { apiService } from '@/services/api';

interface FileUploadTabProps {
  onDataUploaded: () => void;
  onDataAvailable: () => void;
}

interface DataStatus {
  data_loaded: boolean;
  data_info?: {
    row_count: number;
    column_count: number;
    columns: string[];
  };
  source?: string;
}

export default function FileUploadTab({ onDataUploaded, onDataAvailable }: FileUploadTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check data status on component mount
  useEffect(() => {
    checkDataStatus();
  }, []);

  const checkDataStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const status = await apiService.getDataStatus();
      setDataStatus(status);
      
      if (status.data_loaded) {
        // Call onDataAvailable() for loaded data
        onDataAvailable();
      }
    } catch (error) {
      console.error('Error checking data status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setUploadError('Please select a CSV file only');
      return;
    }
    
    setFile(selectedFile);
    setUploadError(null);
    setUploadSuccess(false);
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
      handleFileSelect(droppedFiles[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await apiService.uploadData(file);
      
      setUploadSuccess(true);
      // Update data status
      await checkDataStatus();
      onDataUploaded();
      
    } catch (error: any) {
      setUploadError('Upload failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">File Upload</h1>
        <p className="text-gray-600">
          Upload your CSV file to begin processing
        </p>
      </div>

      {/* Data Status */}
      {isCheckingStatus ? (
        <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-blue-700">Checking for existing data...</p>
        </div>
      ) : dataStatus?.data_loaded ? (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-green-700 font-medium">
                Data already loaded
              </p>
              {dataStatus.data_info && (
                <p className="text-green-600 text-sm">
                  {dataStatus.data_info.row_count} rows, {dataStatus.data_info.column_count} columns
                </p>
              )}
            </div>
          </div>
          <p className="text-green-600 text-sm">
            Upload new file to replace
          </p>
        </div>
      ) : null}

      {/* Status Messages */}
      {uploadError && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{uploadError}</p>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-700">Data uploaded successfully!</p>
        </div>
      )}

      {/* File Upload Section */}
      <div className="max-w-lg mx-auto">
        <div className="card">
          <div className="card-content">
            <h3 className="font-semibold text-gray-900 mb-2">CSV Data File</h3>
            <p className="text-sm text-gray-600 mb-4">Upload your CSV file for analysis</p>
            
            <div
              className={`file-upload-area ${dragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    handleFileSelect(selectedFile);
                  }
                }}
                className="hidden"
              />
              
              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
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
                    Drop your CSV file here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    CSV files only
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div className="flex justify-center">
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`btn ${file && !isUploading ? 'btn-primary' : 'btn-secondary'} px-8 py-3 text-base`}
        >
          {isUploading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            'Upload Data'
          )}
        </button>
      </div>
    </div>
  );
}