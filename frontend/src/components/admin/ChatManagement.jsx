import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';

const ChatManagement = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const baseURL = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        // Mock data for testing
        setConversations([
          {
            id: '1',
            user_name: 'Dr. Fatmir Leshi',
            user_email: 'fatmir.leshi@qsut.al',
            last_message: 'Kam nevojë për ndihmë me analizën e të dhënave',
            last_message_time: '2024-01-15 10:30',
            status: 'active',
            unread_count: 2,
            priority: 'high'
          },
          {
            id: '2',
            user_name: 'Marina Tirana',
            user_email: 'marina.tirana@student.al',
            last_message: 'Faleminderit për ndihmën!',
            last_message_time: '2024-01-14 16:45',
            status: 'resolved',
            unread_count: 0,
            priority: 'low'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/chat/conversation/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        // Mock messages
        setMessages([
          {
            id: '1',
            sender: 'user',
            message: 'Përshëndetje! Kam nevojë për ndihmë me analizën e të dhënave.',
            timestamp: '2024-01-15 10:30',
            user_name: 'Dr. Fatmir Leshi'
          },
          {
            id: '2',
            sender: 'expert',
            message: 'Përshëndetje! Sigurisht që mund t\'ju ndihmoj. Çfarë lloj analiza dëshironi të bëni?',
            timestamp: '2024-01-15 10:35',
            expert_name: 'Admin'
          },
          {
            id: '3',
            sender: 'user',
            message: 'Duhet të bëj një analizë regresioni për të dhënat e studimit tim.',
            timestamp: '2024-01-15 10:40',
            user_name: 'Dr. Fatmir Leshi'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/chat/send-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          message: newMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data]);
        setNewMessage('');
      } else {
        // Mock reply
        const mockReply = {
          id: Date.now().toString(),
          sender: 'expert',
          message: newMessage,
          timestamp: new Date().toLocaleString(),
          expert_name: 'Admin'
        };
        setMessages([...messages, mockReply]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const updateConversationStatus = async (conversationId, status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${baseURL}/api/chat/conversation/${conversationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      // Update local state
      setConversations(conversations.map(conv => 
        conv.id === conversationId ? { ...conv, status } : conv
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Duke ngarkuar...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversations List */}
      <div className="w-1/3 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Mesazhet</h2>
          
          {/* Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Kërko përdorues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">Të gjitha</option>
              <option value="active">Aktive</option>
              <option value="pending">Në pritje</option>
              <option value="resolved">Zgjidhur</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-y-auto h-full">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleConversationClick(conversation)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-sm">{conversation.user_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(conversation.priority)}>
                    {conversation.priority}
                  </Badge>
                  {conversation.unread_count > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {conversation.last_message}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">{conversation.last_message_time}</span>
                </div>
                <Badge className={getStatusColor(conversation.status)}>
                  {conversation.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{selectedConversation.user_name}</h3>
                  <p className="text-sm text-gray-600">{selectedConversation.user_email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConversationStatus(selectedConversation.id, 'resolved')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mbyll
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConversationStatus(selectedConversation.id, 'pending')}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Pending
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'expert' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'expert'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs mt-1 opacity-75">{message.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Shkruani përgjigjen tuaj..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Zgjidhni një bisedë për të filluar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatManagement;