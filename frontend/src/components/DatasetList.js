import React, { useState, useEffect } from 'react';
import { Database, Calendar, FileText, Tag, Trash2, Eye, BarChart3, Download } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DatasetList = ({ onSelectDataset, refreshTrigger }) => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDatasets();
  }, [refreshTrigger]);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/datasets`);
      setDatasets(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch datasets');
      console.error('Error fetching datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (datasetId) => {
    if (window.confirm('Are you sure you want to delete this dataset?')) {
      try {
        await axios.delete(`${API}/datasets/${datasetId}`);
        setDatasets(datasets.filter(d => d.id !== datasetId));
      } catch (err) {
        alert('Failed to delete dataset');
        console.error('Error deleting dataset:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading datasets...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchDatasets}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Database className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">My Datasets</h2>
        </div>
        <span className="text-sm text-gray-500">
          {datasets.length} dataset{datasets.length !== 1 ? 's' : ''}
        </span>
      </div>

      {datasets.length === 0 ? (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No datasets yet</h3>
          <p className="text-gray-500">Upload your first dataset to get started with analysis</p>
        </div>
      ) : (
        <div className="space-y-4">
          {datasets.map((dataset) => (
            <div
              key={dataset.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {dataset.name}
                    </h3>
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {dataset.file_type.toUpperCase()}
                    </span>
                  </div>

                  {dataset.description && (
                    <p className="text-gray-600 mb-2">{dataset.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      {dataset.rows} rows, {dataset.columns} columns
                    </div>
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      {formatFileSize(dataset.file_size)}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(dataset.upload_date)}
                    </div>
                  </div>

                  {dataset.tags && dataset.tags.length > 0 && (
                    <div className="flex items-center mb-3">
                      <Tag className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="flex flex-wrap gap-1">
                        {dataset.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => onSelectDataset(dataset)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(dataset.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Column Preview */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Columns:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.entries(dataset.column_info).slice(0, 5).map(([colName, colInfo]) => (
                      <span
                        key={colName}
                        className={`px-2 py-1 text-xs rounded-full ${
                          colInfo.data_type === 'numeric' 
                            ? 'bg-green-100 text-green-800'
                            : colInfo.data_type === 'categorical'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {colName} ({colInfo.data_type})
                      </span>
                    ))}
                    {Object.keys(dataset.column_info).length > 5 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{Object.keys(dataset.column_info).length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatasetList;