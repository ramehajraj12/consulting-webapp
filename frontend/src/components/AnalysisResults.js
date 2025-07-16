import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Eye, 
  FileText, 
  Image, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy
} from 'lucide-react';

const AnalysisResults = ({ result }) => {
  const [activeTab, setActiveTab] = useState('summary');

  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    return num.toFixed(4);
  };

  const getSignificanceColor = (pValue) => {
    if (pValue < 0.001) return 'text-green-600';
    if (pValue < 0.01) return 'text-blue-600';
    if (pValue < 0.05) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSignificanceText = (pValue) => {
    if (pValue < 0.001) return 'Highly Significant (p < 0.001)';
    if (pValue < 0.01) return 'Very Significant (p < 0.01)';
    if (pValue < 0.05) return 'Significant (p < 0.05)';
    return 'Not Significant (p ≥ 0.05)';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const renderSummary = () => {
    const { results, analysis_type } = result;
    
    switch (analysis_type) {
      case 'ttest_one':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">One-Sample T-Test Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test Value:</span>
                    <span className="font-medium">{results.test_value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sample Mean:</span>
                    <span className="font-medium">{formatNumber(results.sample_mean)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sample SD:</span>
                    <span className="font-medium">{formatNumber(results.sample_std)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sample Size:</span>
                    <span className="font-medium">{results.sample_size}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">T-Statistic:</span>
                    <span className="font-medium">{formatNumber(results.t_statistic)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">P-Value:</span>
                    <span className={`font-medium ${getSignificanceColor(results.p_value)}`}>
                      {formatNumber(results.p_value)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Degrees of Freedom:</span>
                    <span className="font-medium">{results.degrees_of_freedom}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Significance:</span>
                    {results.significant ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`ml-2 text-sm ${getSignificanceColor(results.p_value)}`}>
                      {getSignificanceText(results.p_value)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'ttest_two':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Two-Sample T-Test Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Group Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Group 1 Mean:</span>
                      <span className="font-medium">{formatNumber(results.group1_mean)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Group 1 SD:</span>
                      <span className="font-medium">{formatNumber(results.group1_std)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Group 1 Size:</span>
                      <span className="font-medium">{results.group1_size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Group 2 Mean:</span>
                      <span className="font-medium">{formatNumber(results.group2_mean)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Group 2 SD:</span>
                      <span className="font-medium">{formatNumber(results.group2_std)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Group 2 Size:</span>
                      <span className="font-medium">{results.group2_size}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Test Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">T-Statistic:</span>
                      <span className="font-medium">{formatNumber(results.t_statistic)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">P-Value:</span>
                      <span className={`font-medium ${getSignificanceColor(results.p_value)}`}>
                        {formatNumber(results.p_value)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Degrees of Freedom:</span>
                      <span className="font-medium">{results.degrees_of_freedom}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">Significance:</span>
                      {results.significant ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'anova':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">One-Way ANOVA Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Test Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">F-Statistic:</span>
                      <span className="font-medium">{formatNumber(results.f_statistic)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">P-Value:</span>
                      <span className={`font-medium ${getSignificanceColor(results.p_value)}`}>
                        {formatNumber(results.p_value)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DF Between:</span>
                      <span className="font-medium">{results.degrees_of_freedom_between}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DF Within:</span>
                      <span className="font-medium">{results.degrees_of_freedom_within}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Group Statistics</h4>
                  <div className="space-y-2">
                    {results.group_statistics.map((group, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-700">{group.group}</div>
                        <div className="text-sm text-gray-600">
                          Mean: {formatNumber(group.mean)} | 
                          SD: {formatNumber(group.std)} | 
                          N: {group.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'regression':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Linear Regression Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Model Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">R-Squared:</span>
                      <span className="font-medium">{formatNumber(results.r_squared)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Adj. R-Squared:</span>
                      <span className="font-medium">{formatNumber(results.adjusted_r_squared)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">F-Statistic:</span>
                      <span className="font-medium">{formatNumber(results.f_statistic)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">F P-Value:</span>
                      <span className={`font-medium ${getSignificanceColor(results.f_pvalue)}`}>
                        {formatNumber(results.f_pvalue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RMSE:</span>
                      <span className="font-medium">{formatNumber(results.rmse)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Coefficients</h4>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded border">
                      <div className="font-medium text-gray-700">Intercept</div>
                      <div className="text-sm text-gray-600">
                        {formatNumber(results.coefficients.intercept)}
                      </div>
                    </div>
                    {Object.entries(results.coefficients.slopes).map(([variableName, coef]) => (
                      <div key={variableName} className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-700">{variableName}</div>
                        <div className="text-sm text-gray-600">
                          Coefficient: {formatNumber(coef)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'visualization':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {results.chart_type.charAt(0).toUpperCase() + results.chart_type.slice(1)} Chart
              </h3>
              <div className="text-center">
                <img 
                  src={`data:image/png;base64,${results.image_data}`} 
                  alt={`${results.chart_type} chart`}
                  className="max-w-full h-auto mx-auto rounded border"
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        );
    }
  };

  const renderRawData = () => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Raw Results</h3>
        <button
          onClick={() => copyToClipboard(JSON.stringify(result.results, null, 2))}
          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <Copy className="w-4 h-4 mr-1" />
          Copy
        </button>
      </div>
      <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
        {JSON.stringify(result.results, null, 2)}
      </pre>
    </div>
  );

  const tabs = [
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'raw', label: 'Raw Data', icon: FileText }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
            <div>
              <h2 className="text-xl font-bold text-gray-800 capitalize">
                {result.analysis_type.replace('_', ' ')} Analysis
              </h2>
              <p className="text-sm text-gray-600">
                Executed in {result.execution_time.toFixed(2)} seconds
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
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
        {activeTab === 'summary' && renderSummary()}
        {activeTab === 'raw' && renderRawData()}
      </div>
    </div>
  );
};

export default AnalysisResults;