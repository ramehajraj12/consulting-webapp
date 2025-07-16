import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusIcon, 
  ChartBarIcon, 
  DatabaseIcon, 
  CpuChipIcon,
  UserIcon,
  LogoutIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import DataUpload from '../DataUpload';
import DatasetList from '../DatasetList';
import DatasetViewer from '../DatasetViewer';
import AIAssistant from '../AIAssistant';

const UserDashboard = () => {
  const [activeView, setActiveView] = useState('datasets');
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const { user, logout } = useAuth();

  const handleUploadSuccess = (dataset) => {
    setRefreshTrigger(prev => prev + 1);
    setShowUpload(false);
  };

  const handleSelectDataset = (dataset) => {
    setSelectedDataset(dataset);
    setActiveView('analysis');
  };

  const handleBackToDatasets = () => {
    setSelectedDataset(null);
    setActiveView('datasets');
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'researcher':
        return 'Researcher';
      case 'student':
        return 'Student';
      case 'analyst':
        return 'Analyst';
      default:
        return 'User';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'researcher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      case 'analyst':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">SPSSAU</h1>
                  <p className="text-sm text-gray-600">Professional Statistical Analysis</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveView('datasets')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'datasets'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <DatabaseIcon className="w-5 h-5 mr-2" />
                Datasets
              </button>
              <button
                onClick={() => setShowAI(true)}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                <CpuChipIcon className="w-5 h-5 mr-2" />
                AI Assistant
              </button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Upload Data
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.organization}</p>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {user?.full_name?.charAt(0)}
                    </span>
                  </div>
                  <span className={`absolute -bottom-1 -right-1 px-1 py-0.5 text-xs font-medium rounded-full ${getRoleColor(user?.role)}`}>
                    {user?.role?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Logout"
                >
                  <LogoutIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        {activeView === 'datasets' && !selectedDataset && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome back, {user?.full_name}!
                  </h2>
                  <p className="text-blue-100 mb-4">
                    Ready to dive into your statistical analysis? Upload data or explore your existing datasets.
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      <span>{getRoleDisplayName(user?.role)}</span>
                    </div>
                    {user?.organization && (
                      <div className="flex items-center">
                        <span>•</span>
                        <span className="ml-1">{user.organization}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <ChartBarIcon className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {activeView === 'datasets' && !selectedDataset && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <PlusIcon className="w-6 h-6 text-blue-600 mr-2" />
                  <span className="text-blue-600 font-medium">Upload New Dataset</span>
                </button>
                <button
                  onClick={() => setShowAI(true)}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
                >
                  <CpuChipIcon className="w-6 h-6 text-purple-600 mr-2" />
                  <span className="text-purple-600 font-medium">AI Assistant</span>
                </button>
                <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
                  <CogIcon className="w-6 h-6 text-gray-600 mr-2" />
                  <span className="text-gray-600 font-medium">Settings</span>
                </button>
              </div>
            </div>

            {/* Dataset List */}
            <DatasetList 
              onSelectDataset={handleSelectDataset}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {activeView === 'analysis' && selectedDataset && (
          <DatasetViewer 
            dataset={selectedDataset} 
            onBack={handleBackToDatasets}
          />
        )}
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Upload Dataset</h3>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <DataUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {showAI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">AI Statistical Assistant</h3>
                <button
                  onClick={() => setShowAI(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AIAssistant />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;