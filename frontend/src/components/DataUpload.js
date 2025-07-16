import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Database, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DataUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: ''
  });

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setUploadStatus(null);
      handleFileUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json']
    },
    multiple: false
  });

  const handleFileUpload = async (file) => {
    if (!formData.name) {
      setUploadStatus({ type: 'error', message: 'Please enter a dataset name' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('name', formData.name);
      uploadData.append('description', formData.description);
      uploadData.append('tags', formData.tags);

      const response = await axios.post(`${API}/datasets/upload`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadStatus({ 
        type: 'success', 
        message: 'Dataset uploaded successfully!',
        dataset: response.data.dataset
      });

      // Reset form
      setFormData({ name: '', description: '', tags: '' });
      
      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(response.data.dataset);
      }

    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: error.response?.data?.detail || 'Upload failed. Please try again.' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Database className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Upload Dataset</h2>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dataset Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter dataset name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter dataset description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., survey, sales, research"
          />
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Uploading and processing...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag & drop a file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: CSV, Excel (.xlsx, .xls), JSON
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Messages */}
      {uploadStatus && (
        <div className={`mt-4 p-4 rounded-md flex items-center ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          )}
          <div className="flex-1">
            <p className={`font-medium ${
              uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {uploadStatus.message}
            </p>
            {uploadStatus.dataset && (
              <p className="text-sm text-green-600 mt-1">
                {uploadStatus.dataset.rows} rows, {uploadStatus.dataset.columns} columns
              </p>
            )}
          </div>
        </div>
      )}

      {/* File Format Help */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium text-gray-800 mb-2">File Format Guidelines:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• CSV files should have headers in the first row</li>
          <li>• Excel files will use the first sheet by default</li>
          <li>• JSON files should contain an array of objects</li>
          <li>• Maximum file size: 50MB</li>
          <li>• Ensure data is clean and properly formatted</li>
        </ul>
      </div>
    </div>
  );
};

export default DataUpload;