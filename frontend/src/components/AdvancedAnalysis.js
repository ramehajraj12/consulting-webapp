import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Scatter, 
  Play, 
  Settings,
  ChevronDown,
  ChevronUp,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdvancedAnalysis = ({ dataset, onAnalysisComplete }) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [parameters, setParameters] = useState({});
  const [running, setRunning] = useState(false);
  const [expandedSection, setExpandedSection] = useState('statistical');

  const analysisTypes = {
    statistical: {
      title: 'Statistical Tests',
      icon: Calculator,
      color: 'blue',
      tests: [
        {
          id: 'ttest_one',
          name: 'One-Sample T-Test',
          description: 'Test if sample mean differs from population mean',
          parameters: [
            { name: 'column', type: 'select', label: 'Column', options: 'numeric' },
            { name: 'test_value', type: 'number', label: 'Test Value', default: 0 }
          ]
        },
        {
          id: 'ttest_two',
          name: 'Two-Sample T-Test',
          description: 'Compare means of two groups',
          parameters: [
            { name: 'column1', type: 'select', label: 'Group 1', options: 'numeric' },
            { name: 'column2', type: 'select', label: 'Group 2', options: 'numeric' }
          ]
        },
        {
          id: 'anova',
          name: 'One-Way ANOVA',
          description: 'Compare means across multiple groups',
          parameters: [
            { name: 'dependent_var', type: 'select', label: 'Dependent Variable', options: 'numeric' },
            { name: 'independent_var', type: 'select', label: 'Independent Variable', options: 'categorical' }
          ]
        },
        {
          id: 'chi_square',
          name: 'Chi-Square Test',
          description: 'Test independence of categorical variables',
          parameters: [
            { name: 'var1', type: 'select', label: 'Variable 1', options: 'categorical' },
            { name: 'var2', type: 'select', label: 'Variable 2', options: 'categorical' }
          ]
        }
      ]
    },
    regression: {
      title: 'Regression Analysis',
      icon: TrendingUp,
      color: 'green',
      tests: [
        {
          id: 'regression',
          name: 'Linear Regression',
          description: 'Predict dependent variable from independent variables',
          parameters: [
            { name: 'dependent_var', type: 'select', label: 'Dependent Variable', options: 'numeric' },
            { name: 'independent_vars', type: 'multiselect', label: 'Independent Variables', options: 'numeric' }
          ]
        }
      ]
    },
    visualization: {
      title: 'Data Visualization',
      icon: BarChart3,
      color: 'purple',
      tests: [
        {
          id: 'visualization',
          name: 'Generate Chart',
          description: 'Create various types of charts',
          parameters: [
            { 
              name: 'chart_type', 
              type: 'select', 
              label: 'Chart Type', 
              options: [
                { value: 'histogram', label: 'Histogram' },
                { value: 'boxplot', label: 'Box Plot' },
                { value: 'scatter', label: 'Scatter Plot' },
                { value: 'bar', label: 'Bar Chart' }
              ]
            },
            { name: 'columns', type: 'multiselect', label: 'Columns', options: 'all' }
          ]
        }
      ]
    }
  };

  const getColumnOptions = (optionType) => {
    if (!dataset || !dataset.column_info) return [];
    
    const columns = Object.entries(dataset.column_info);
    
    switch (optionType) {
      case 'numeric':
        return columns
          .filter(([_, info]) => info.data_type === 'numeric')
          .map(([name, _]) => ({ value: name, label: name }));
      case 'categorical':
        return columns
          .filter(([_, info]) => info.data_type === 'categorical')
          .map(([name, _]) => ({ value: name, label: name }));
      case 'all':
        return columns.map(([name, _]) => ({ value: name, label: name }));
      default:
        return [];
    }
  };

  const handleParameterChange = (paramName, value) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const runAnalysis = async () => {
    if (!selectedAnalysis) return;
    
    setRunning(true);
    try {
      const response = await axios.post(`${API}/datasets/${dataset.id}/analyze`, {
        dataset_id: dataset.id,
        analysis_type: selectedAnalysis.id,
        parameters: parameters
      });
      
      if (onAnalysisComplete) {
        onAnalysisComplete(response.data);
      }
    } catch (error) {
      alert('Analysis failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setRunning(false);
    }
  };

  const renderParameterInput = (param) => {
    const value = parameters[param.name] || param.default || '';
    
    switch (param.type) {
      case 'select':
        const options = Array.isArray(param.options) ? param.options : getColumnOptions(param.options);
        return (
          <select
            key={param.name}
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select {param.label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'multiselect':
        const multiOptions = Array.isArray(param.options) ? param.options : getColumnOptions(param.options);
        return (
          <select
            key={param.name}
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              handleParameterChange(param.name, selected);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            size={Math.min(multiOptions.length, 5)}
          >
            {multiOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'number':
        return (
          <input
            key={param.name}
            type="number"
            value={value}
            onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="any"
          />
        );
        
      default:
        return (
          <input
            key={param.name}
            type="text"
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Activity className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Advanced Analysis</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Selection */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis Types</h3>
          <div className="space-y-3">
            {Object.entries(analysisTypes).map(([key, category]) => {
              const Icon = category.icon;
              const isExpanded = expandedSection === key;
              
              return (
                <div key={key} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection(key)}
                    className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors ${
                      isExpanded ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 text-${category.color}-600 mr-3`} />
                      <span className="font-medium text-gray-800">{category.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-2">
                      {category.tests.map(test => (
                        <button
                          key={test.id}
                          onClick={() => {
                            setSelectedAnalysis(test);
                            setParameters({});
                          }}
                          className={`w-full text-left p-3 rounded-md mb-2 transition-colors ${
                            selectedAnalysis?.id === test.id
                              ? 'bg-blue-50 border-2 border-blue-200'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                        >
                          <div className="font-medium text-gray-800">{test.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{test.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Parameters and Execution */}
        <div className="lg:col-span-2">
          {selectedAnalysis ? (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {selectedAnalysis.name}
                </h3>
                <p className="text-gray-600">{selectedAnalysis.description}</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Parameters</h4>
                {selectedAnalysis.parameters.map(param => (
                  <div key={param.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {param.label}
                    </label>
                    {renderParameterInput(param)}
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={runAnalysis}
                  disabled={running}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {running ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Running Analysis...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Run Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Select Analysis Type
              </h3>
              <p className="text-gray-500">
                Choose an analysis type from the left panel to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalysis;