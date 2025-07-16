import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DataUpload from "./components/DataUpload";
import DatasetList from "./components/DatasetList";
import DatasetViewer from "./components/DatasetViewer";
import { Database, BarChart3, Brain, TrendingUp } from "lucide-react";

function App() {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = (dataset) => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectDataset = (dataset) => {
    setSelectedDataset(dataset);
  };

  const handleBackToList = () => {
    setSelectedDataset(null);
  };

  const HomePage = () => {
    if (selectedDataset) {
      return (
        <DatasetViewer 
          dataset={selectedDataset} 
          onBack={handleBackToList}
        />
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">SPSSAU</h1>
                  <p className="text-sm text-gray-600">4th Generation Statistical Analysis Software</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-4 h-4" />
                <span>500+ Algorithms</span>
              </div>
              <div className="flex items-center space-x-1">
                <Brain className="w-4 h-4" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>Real-time Analysis</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <div className="lg:col-span-1">
              <DataUpload onUploadSuccess={handleUploadSuccess} />
            </div>

            {/* Dataset List Section */}
            <div className="lg:col-span-2">
              <DatasetList 
                onSelectDataset={handleSelectDataset}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Powerful Statistical Analysis Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Data Management</h3>
                <p className="text-sm text-gray-600">
                  Upload CSV, Excel, and JSON files. Automatic data type detection and cleaning.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Descriptive Statistics</h3>
                <p className="text-sm text-gray-600">
                  Mean, median, mode, standard deviation, and comprehensive data summaries.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Correlation Analysis</h3>
                <p className="text-sm text-gray-600">
                  Discover relationships between variables with advanced correlation matrices.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">AI-Powered Insights</h3>
                <p className="text-sm text-gray-600">
                  Intelligent analysis suggestions and automated pattern recognition.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">SPSSAU</span>
              </div>
              <p className="text-gray-400 mb-4">
                4th Generation Statistical Analysis Software - Web-based, AI-powered, and intuitive
              </p>
              <div className="flex justify-center space-x-6 text-sm text-gray-400">
                <span>Serving 10,000+ Universities</span>
                <span>•</span>
                <span>5 Million+ Users</span>
                <span>•</span>
                <span>50 Million+ Analyses</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
