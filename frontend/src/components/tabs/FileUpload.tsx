'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { apiService } from '@/services/api';

interface FileUploadTabProps {
  onDataUploaded: () => void;
  onDataAvailable: () => void;
}

export default function FileUploadTab({ onDataUploaded, onDataAvailable }: FileUploadTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type - only accept PDF files
    if (selectedFile.type !== 'application/pdf') {
      setUploadError('Only PDF files are supported. Please select a PDF file.');
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
      setUploadError('Please select a file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await apiService.uploadFile(file);
      
      setUploadSuccess(true);
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
          Upload Design Document Here
        </p>
      </div>

      {/* Centered Upload Section */}
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-8">

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
              <h3 className="font-semibold text-gray-900 mb-2">Design Document Upload</h3>
              <p className="text-sm text-gray-600 mb-4">Upload Design Document (PDF)</p>
              
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
                  accept=".pdf,application/pdf"
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
                      Drop your document here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF files only (.pdf)
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
              'Upload PDF'
            )}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}