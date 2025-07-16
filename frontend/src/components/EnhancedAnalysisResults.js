import React, { useState } from 'react';
import { 
  AcademicCapIcon, 
  LightBulbIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import APATable from './APATable';
import AnalysisResults from './AnalysisResults';

const EnhancedAnalysisResults = ({ result, onClose }) => {
  const [activeTab, setActiveTab] = useState('results');

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

  const tabs = [
    { id: 'results', label: 'Results', icon: ChartBarIcon },
    { id: 'apa', label: 'APA Table', icon: DocumentTextIcon },
    { id: 'recommendations', label: 'AI Recommendations', icon: LightBulbIcon }
  ];

  const renderRecommendations = () => {
    if (!result.ai_recommendations) {
      return (
        <div className="bg-yellow-50 rounded-lg p-6 text-center">
          <InformationCircleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">AI Recommendations Unavailable</h3>
          <p className="text-yellow-700 mb-4">
            AI-powered recommendations require an OpenAI API key to be configured by your administrator.
          </p>
          <div className="bg-yellow-100 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Manual Interpretation Guidelines:</h4>
            <ul className="text-sm text-yellow-700 space-y-1 text-left">
              <li>• Check statistical significance (p-value < 0.05)</li>
              <li>• Consider practical significance (effect size)</li>
              <li>• Verify assumptions have been met</li>
              <li>• Consider limitations and alternative explanations</li>
              <li>• Report results in APA format</li>
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Statistical Recommendations</h3>
              <p className="text-sm text-gray-600">Professional interpretation and next steps</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="prose prose-sm max-w-none">
            <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
              {result.ai_recommendations}
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <LightBulbIcon className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-900">Key Takeaways:</h4>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Always verify statistical assumptions before interpreting results</li>
              <li>• Consider both statistical and practical significance</li>
              <li>• Report confidence intervals along with p-values</li>
              <li>• Discuss limitations and potential confounding factors</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold capitalize">
                  {result.analysis_type.replace('_', ' ')} Analysis
                </h2>
                <p className="text-blue-100">
                  Professional statistical analysis with AI-powered insights
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'results' && (
            <div className="p-6">
              <AnalysisResults result={result} />
            </div>
          )}
          
          {activeTab === 'apa' && (
            <div className="p-6">
              <APATable analysisResult={result} />
            </div>
          )}
          
          {activeTab === 'recommendations' && (
            <div className="p-6">
              {renderRecommendations()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Analysis completed in {result.execution_time.toFixed(2)} seconds
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                Export Report
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Save Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalysisResults;