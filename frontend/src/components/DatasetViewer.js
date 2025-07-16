import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Database, 
  BarChart3, 
  Table, 
  Calculator, 
  TrendingUp,
  Download,
  RefreshCw,
  Activity,
  Zap
} from 'lucide-react';
import axios from 'axios';
import AdvancedAnalysis from './AdvancedAnalysis';
import EnhancedAnalysisResults from './EnhancedAnalysisResults';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DatasetViewer = ({ dataset, onBack }) => {
  const [preview, setPreview] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [runningAnalysis, setRunningAnalysis] = useState(null);
  const [selectedAnalysisResult, setSelectedAnalysisResult] = useState(null);

  useEffect(() => {
    fetchDatasetPreview();
    fetchAnalyses();
  }, [dataset.id]);

  const fetchDatasetPreview = async () => {
    try {
      const response = await axios.get(`${API}/datasets/${dataset.id}/preview`);
      setPreview(response.data);
    } catch (error) {
      console.error('Error fetching preview:', error);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const response = await axios.get(`${API}/analysis/results/${dataset.id}`);
      setAnalyses(response.data);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (analysisType, parameters = {}) => {
    try {
      setRunningAnalysis(analysisType);
      const response = await axios.post(`${API}/analysis/analyze`, {
        dataset_id: dataset.id,
        analysis_type: analysisType,
        parameters: parameters
      });
      
      setAnalyses(prev => [response.data, ...prev]);
      setSelectedAnalysisResult(response.data);
      setActiveTab('analyses');
    } catch (error) {
      alert('Analysis failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setRunningAnalysis(null);
    }
  };

  const handleAdvancedAnalysisComplete = (result) => {
    setAnalyses(prev => [result, ...prev]);
    setSelectedAnalysisResult(result);
    setActiveTab('analyses');
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Dataset Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Dataset Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{dataset.rows}</div>
            <div className="text-sm text-gray-600">Rows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{dataset.columns}</div>
            <div className="text-sm text-gray-600">Columns</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{dataset.file_type.toUpperCase()}</div>
            <div className="text-sm text-gray-600">Format</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(dataset.file_size / 1024)}KB
            </div>
            <div className="text-sm text-gray-600">Size</div>
          </div>
        </div>
      </div>

      {/* Column Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Column Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(dataset.column_info).map(([colName, colInfo]) => (
            <div key={colName} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">{colName}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  colInfo.data_type === 'numeric' 
                    ? 'bg-green-100 text-green-800'
                    : colInfo.data_type === 'categorical'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {colInfo.data_type}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Unique:</span>
                  <span>{colInfo.unique_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Missing:</span>
                  <span>{colInfo.null_count}</span>
                </div>
                {colInfo.sample_values && colInfo.sample_values.length > 0 && (
                  <div>
                    <span className="text-gray-500">Sample:</span>
                    <div className="mt-1 text-xs">
                      {colInfo.sample_values.slice(0, 3).map(v => 
                        v === null ? 'null' : String(v)
                      ).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => runAnalysis('descriptive')}
            disabled={runningAnalysis === 'descriptive'}
            className="flex items-center justify-center p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {runningAnalysis === 'descriptive' ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Calculator className="w-5 h-5 mr-2 text-blue-600" />
            )}
            Descriptive Statistics
          </button>
          
          <button
            onClick={() => runAnalysis('correlation')}
            disabled={runningAnalysis === 'correlation'}
            className="flex items-center justify-center p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {runningAnalysis === 'correlation' ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            )}
            Correlation Analysis
          </button>
          
          <button
            onClick={() => {
              const column = Object.keys(dataset.column_info)[0];
              runAnalysis('frequency', { column });
            }}
            disabled={runningAnalysis === 'frequency'}
            className="flex items-center justify-center p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
          >
            {runningAnalysis === 'frequency' ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            )}
            Frequency Analysis
          </button>
        </div>
      </div>

      {/* Advanced Analysis Teaser */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
        <div className="flex items-center mb-4">
          <Zap className="w-6 h-6 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Advanced Statistical Analysis</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Unlock the power of professional statistical analysis with t-tests, ANOVA, regression, 
          chi-square tests, and advanced data visualization with AI-powered recommendations.
        </p>
        <button
          onClick={() => setActiveTab('advanced')}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Activity className="w-5 h-5 mr-2" />
          Launch Advanced Analysis
        </button>
      </div>
    </div>
  );

  const renderDataPreview = () => {
    if (!preview) return <div>Loading preview...</div>;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Data Preview ({preview.preview_rows} of {preview.total_rows} rows)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {preview.columns.map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {preview.data.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {preview.columns.map((col) => (
                    <td
                      key={col}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {row[col] === null ? (
                        <span className="text-gray-400 italic">null</span>
                      ) : (
                        String(row[col])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAnalyses = () => (
    <div className="space-y-6">
      {analyses.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No analyses yet</h3>
          <p className="text-gray-500">Run your first analysis from the Overview or Advanced tabs</p>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 capitalize flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  {analysis.analysis_type.replace('_', ' ')} Analysis
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    {formatDate(analysis.created_date)} • {analysis.execution_time.toFixed(2)}s
                  </div>
                  <button
                    onClick={() => setSelectedAnalysisResult(analysis)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(analysis.results, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAdvancedAnalysis = () => (
    <AdvancedAnalysis 
      dataset={dataset} 
      onAnalysisComplete={handleAdvancedAnalysisComplete}
    />
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Database },
    { id: 'data', label: 'Data Preview', icon: Table },
    { id: 'advanced', label: 'Advanced Analysis', icon: Activity },
    { id: 'analyses', label: 'Results', icon: BarChart3 }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{dataset.name}</h1>
              <p className="text-gray-600">{dataset.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {dataset.file_type.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'data' && renderDataPreview()}
        {activeTab === 'advanced' && renderAdvancedAnalysis()}
        {activeTab === 'analyses' && renderAnalyses()}
      </div>
    </div>
  );
};

export default DatasetViewer;