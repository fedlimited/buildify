import React, { useState, useEffect } from 'react';
import { 
  Send, Loader2, X, Sparkles, 
  ChevronDown, Building2
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface StakeholderChatProps {
  projectId?: number;
  projectName?: string;
}

export function StakeholderChat({ projectId, projectName }: StakeholderChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: projectId 
        ? `Hello! Ask me about "${projectName}" - progress, documents, or meetings.`
        : "Hello! Ask me about project progress, documents, or meetings.",
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Current progress?",
    "Completion date?",
    "Recent documents",
    "Upcoming meetings",
    "Next milestone?"
  ]);

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
      
      let endpoint;
      if (projectId) {
        endpoint = `${API_BASE_URL}/ai/stakeholder/project/${projectId}/ask`;
      } else {
        endpoint = `${API_BASE_URL}/ai/ask`;
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
        content: data.answer || "Sorry, I couldn't process that.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "Having trouble connecting. Please try again.",
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
        className="fixed bottom-6 right-6 p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 z-50 group"
      >
        <div className="relative">
          <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse"></span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[340px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2.5 text-white">
        <div className="flex justify-between items-center w-full">
          <div 
            className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Building2 size={16} className="flex-shrink-0" />
            <h3 className="font-semibold text-sm truncate">Project Assistant</h3>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full flex-shrink-0">AI</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              <ChevronDown size={14} className={`transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Messages Area - Smaller height */}
          <div className="h-[250px] overflow-y-auto p-2.5 bg-gray-50 dark:bg-gray-800/50 space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-2.5 py-1.5 ${
                    message.type === 'user'
                      ? 'bg-emerald-500 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-xs break-words">{message.content}</p>
                  <p className={`text-[10px] mt-1 ${message.type === 'user' ? 'text-emerald-100' : 'text-gray-400 dark:text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl rounded-bl-none px-2.5 py-1.5">
                  <Loader2 size={14} className="animate-spin text-emerald-500" />
                </div>
              </div>
            )}
          </div>
          
          {/* Suggestions - Smaller */}
          {suggestions.length > 0 && (
            <div className="px-2.5 py-1.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5">Suggested:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-[10px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-2 py-0.5 hover:border-emerald-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition text-gray-600 dark:text-gray-300"
                  >
                    {suggestion.length > 25 ? suggestion.substring(0, 25) + '...' : suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input Area - Smaller */}
          <div className="p-2.5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex gap-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), askQuestion())}
                placeholder="Ask a question..."
                className="flex-1 px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                rows={1}
                style={{ minHeight: '32px', maxHeight: '60px' }}
              />
              <button
                onClick={askQuestion}
                disabled={loading || !question.trim()}
                className="p-1.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition self-end"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}