import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Download, 
  Settings,
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTranslation } from '../../utils/translations';
import type { Task, AIConfig } from '../../types';
import { createSmartTaskFromAI } from '../../utils/aiChatUtils';

interface AdvancedAIChatProps {
  aiConfig: AIConfig;
  taskData: any;
  onCreateTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, category?: string, subcategory?: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  language: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export function AdvancedAIChat({
  aiConfig,
  taskData,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  language,
  setAiConfig
}: AdvancedAIChatProps & { setAiConfig?: (config: Partial<AIConfig>) => void }) {
  const { t } = useTranslation(language);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [apiKeyInput, setApiKeyInput] = useState(aiConfig.apiKey || '');
  const [modelInput, setModelInput] = useState(aiConfig.model || 'gpt-4o');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: t('chatWelcome'),
        timestamp: new Date()
      }]);
    }
  }, [t, messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!aiConfig.enabled || !aiConfig.apiKey) {
      setError(t('aiNotConfigured'));
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            {
              role: "system",
              content: `You are a helpful AI assistant for task management and productivity. \nThe user has tasks organized by Year, Month, Week, and Day. \nYou can help with creating, updating, and managing tasks.\nCurrent language: ${language}\nRespond in the same language as the user's message.`
            },
            {
              role: "user",
              content: inputMessage
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let aiContent = data.choices && data.choices.length > 0 ? data.choices[0].message.content : '';

      // --- ÚJ: Feladat automatikus felismerése és hozzáadása ---
      // Egyszerű regex keresés: "Feladat:" vagy "Task:" kulcsszóval
      const taskMatch = aiContent.match(/(?:Feladat|Task):(.+?)(?:\n|$)/i);
      if (taskMatch) {
        const taskText = taskMatch[1].trim();
        // Próbáljuk meg a dátumot is kinyerni
        const dateMatch = aiContent.match(/(?:Dátum|Date):\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
        const timeMatch = aiContent.match(/(?:Idő|Time):\s*([0-9]{2}:[0-9]{2})/i);
        const priorityMatch = aiContent.match(/(?:Prioritás|Priority):\s*(low|medium|high)/i);
        const categoryMatch = aiContent.match(/(?:Kategória|Category):\s*(Year|Month|Week|Day)/i);
        const subcategoryMatch = aiContent.match(/(?:Alkategória|Subcategory):\s*([A-Za-z0-9]+)/i);

        const taskObj: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
          text: taskText,
          time: timeMatch ? timeMatch[1] : '',
          completed: false,
          priority: priorityMatch ? priorityMatch[1] as any : 'medium',
          subtasks: [],
          collapsed: true,
          color: '#ffffff',
          notes: aiContent
        };
        const category = categoryMatch ? categoryMatch[1] : 'Day';
        const subcategory = subcategoryMatch ? subcategoryMatch[1] : undefined;
        onCreateTask(taskObj, category, subcategory);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date()
      };

      setMessages(prev => prev.map(msg => msg.isLoading ? assistantMessage : msg));
    } catch (error) {
      console.error("AI Chat error:", error);
      setError(t('aiError'));
      setMessages(prev => prev.filter(msg => !msg.isLoading));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: t('chatWelcome'),
      timestamp: new Date()
    }]);
  };

  const exportChat = () => {
    const chatText = messages
      .filter(msg => !msg.isLoading)
      .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  // --- API kulcs beállítás kezelése ---
  const handleSaveApiKey = () => {
    if (setAiConfig) {
      setAiConfig({ apiKey: apiKeyInput, model: modelInput, enabled: !!apiKeyInput });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('aiAssistant')}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={exportChat}
            className="p-2"
            title={t('exportChat')}
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="p-2 text-error-600 hover:text-error-700"
            title={t('clearChat')}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
          >
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('aiModel')}
                </label>
                <select
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('apiKey')}
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={t('enterApiKey')}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveApiKey}
                  >
                    {t('save')}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                
                <div className={`flex-1 p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('aiThinking')}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="flex items-center justify-between text-xs opacity-70">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.role === 'assistant' && message.id !== 'welcome' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMessage(message.id)}
                            className="p-1 h-auto text-xs opacity-50 hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="p-1 h-auto ml-auto"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chatPlaceholder')}
            disabled={isLoading || !aiConfig.enabled}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || !aiConfig.enabled}
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {!aiConfig.enabled && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('aiNotConfigured')}
          </p>
        )}
      </div>
    </div>
  );
} 