import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Send, Loader2, X, Sparkles, 
  ChevronDown, ChevronUp, Building2, Minus
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

  // Detect dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

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
      
      let endpoint;
      if (projectId) {
        endpoint = `${API_BASE_URL}/ai/project/${projectId}/ask`;
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
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 z-50 group"
      >
        <div className="relative">
          <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-white flex justify-between items-center cursor-pointer"
           onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2">
          <Building2 size={18} />
          <h3 className="font-semibold text-sm">Bochi Assistant</h3>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">AI</span>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <ChevronDown size={16} className={`transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Messages Area - Limited height with scroll */}
          <div className="h-[350px] overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800/50 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                    message.type === 'user'
                      ? 'bg-amber-500 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-amber-100' : 'text-gray-400 dark:text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-bl-none px-3 py-2">
                  <Loader2 size={16} className="animate-spin text-amber-500" />
                </div>
              </div>
            )}
          </div>
          
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested Questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-2.5 py-1 hover:border-amber-300 hover:text-amber-600 dark:hover:text-amber-400 transition text-gray-600 dark:text-gray-300"
                  >
                    {suggestion.length > 35 ? suggestion.substring(0, 35) + '...' : suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input Area */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex gap-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), askQuestion())}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '80px' }}
              />
              <button
                onClick={askQuestion}
                disabled={loading || !question.trim()}
                className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition self-end"
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