import React from 'react';
import { DocumentTextIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

const APATable = ({ analysisResult }) => {
  if (!analysisResult || !analysisResult.apa_table) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">APA table not available</p>
      </div>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(analysisResult.apa_table);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DocumentTextIcon className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">APA-Style Table</h3>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
            Copy
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
          <pre className="whitespace-pre-wrap text-gray-900 leading-relaxed">
            {analysisResult.apa_table}
          </pre>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Usage Instructions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Copy the table above and paste it into your manuscript</li>
            <li>• Adjust formatting as needed for your publication requirements</li>
            <li>• Ensure all decimal places and significance levels are correct</li>
            <li>• Add appropriate table notes if required by your journal</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default APATable;