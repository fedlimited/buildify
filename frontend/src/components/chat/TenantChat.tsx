import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Send, Loader2, X, Sparkles, 
  ChevronDown, ChevronUp, Building2, Users, DollarSign,
  Calendar, CheckCircle, AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface TenantChatProps {
  projectId?: number;
  projectName?: string;
}

export function TenantChat({ projectId, projectName }: TenantChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: projectId 
        ? `Hello! I'm your AI assistant for "${projectName}". Ask me about budget, timeline, tasks, or any project concerns.`
        : "Hello! I'm your AI assistant for Bochi. Ask me about managing projects, team coordination, or financial tracking.",
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Tenant-specific suggestions
  const getTenantSuggestions = () => {
    if (projectId) {
      return [
        "What's the current budget vs actual?",
        "Any overdue tasks?",
        "Show me resource allocation",
        "When will this project complete?",
        "Any risks I should know about?"
      ];
    }
    return [
      "How do I create a new project?",
      "Add a team member?",
      "Generate a financial report",
      "Set up subcontractors",
      "Track worker attendance"
    ];
  };

  useEffect(() => {
    setSuggestions(getTenantSuggestions());
  }, [projectId]);

  const askQuestion = async () => {
    if (!question.trim() || loading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      let endpoint = `${API_BASE_URL}/ai/ask`;
      
      if (projectId) {
        endpoint = `${API_BASE_URL}/ai/project/${projectId}/ask`;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question })
      });
      
      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.answer || "I'm sorry, I couldn't process that request.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm having trouble connecting. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
    setTimeout(() => askQuestion(), 100);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 z-50 group"
      >
        <div className="relative">
          <Building2 size={24} className="group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[450px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
      {/* Header - Blue theme for Tenant */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Building2 size={20} />
          <h3 className="font-semibold">Bochi Assistant</h3>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Tenant AI</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition"
          >
            {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="h-[400px] overflow-y-auto p-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2">
                  <Loader2 size={18} className="animate-spin text-blue-500" />
                </div>
              </div>
            )}
          </div>
          
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">Suggested Questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 hover:border-blue-300 hover:text-blue-600 transition"
                  >
                    {suggestion.length > 40 ? suggestion.substring(0, 40) + '...' : suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), askQuestion())}
                placeholder="Ask about budget, timeline, tasks..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
              />
              <button
                onClick={askQuestion}
                disabled={loading || !question.trim()}
                className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition self-end"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}