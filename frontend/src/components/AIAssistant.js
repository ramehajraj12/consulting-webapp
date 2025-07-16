import React, { useState } from 'react';
import { 
  ChatBubbleLeftIcon, 
  CpuChipIcon, 
  LightBulbIcon, 
  QuestionMarkCircleIcon,
  SparklesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: "Hello! I'm your AI Statistical Assistant. I can help you with:\n\n• Statistical analysis recommendations\n• APA-style result interpretation\n• Research methodology guidance\n• Statistical concept explanations\n\nWhat would you like to know about your data or statistical analysis?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/ai/chat`, {
        session_id: sessionId,
        message: inputMessage,
        context: {
          type: 'general_assistance'
        }
      });

      const aiMessage = {
        type: 'ai',
        content: response.data.response
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response when AI service is not available
      const fallbackMessage = {
        type: 'ai',
        content: "I'm sorry, but I'm currently unavailable. The AI service requires an OpenAI API key to be configured. In the meantime, you can:\n\n• Use the statistical analysis tools in the platform\n• Refer to statistical textbooks for interpretation guidance\n• Consult with a statistician for complex analyses\n\nPlease contact your administrator to set up AI assistance."
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const quickQuestions = [
    "What statistical test should I use for my data?",
    "How do I interpret a p-value?",
    "What is the difference between correlation and causation?",
    "How do I choose the right sample size?",
    "What assumptions should I check for regression analysis?",
    "How do I report results in APA style?"
  ];

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <CpuChipIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Statistical Assistant</h3>
            <p className="text-sm text-gray-600">Powered by GPT-4</p>
          </div>
        </div>
        <SparklesIcon className="w-6 h-6 text-blue-600" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type === 'ai' && (
                <div className="flex items-center mb-2">
                  <CpuChipIcon className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-xs font-medium text-blue-600">AI Assistant</span>
                </div>
              )}
              <pre className="whitespace-pre-wrap text-sm font-sans">{message.content}</pre>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center mb-3">
            <QuestionMarkCircleIcon className="w-5 h-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Quick Questions</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickQuestions.slice(0, 4).map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about statistics..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              disabled={loading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <LightBulbIcon className="w-4 h-4 mr-1" />
          <span>Press Enter to send • Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;