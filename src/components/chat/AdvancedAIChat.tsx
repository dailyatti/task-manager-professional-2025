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
  X,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTranslation } from '../../utils/translations';
import type { Task, AIConfig, TaskData } from '../../types';
import { createSmartTaskFromAI } from '../../utils/aiChatUtils';
import { 
  TaskManagementSystem, 
  validateAPIConfiguration, 
  generateFeedbackMessage,
  type TaskDeletionResult,
  type APIValidationResult
} from '../../utils/taskManagement';

interface AdvancedAIChatProps {
  aiConfig: AIConfig;
  taskData: TaskData;
  onCreateTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, category?: string, subcategory?: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskData: (data: TaskData | ((prev: TaskData) => TaskData)) => void;
  language: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export function AdvancedAIChat({
  aiConfig,
  taskData,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateTaskData,
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
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<APIValidationResult | null>(null);

  // Initialize task management system
  const taskManager = new TaskManagementSystem(taskData, onUpdateTaskData);

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
        timestamp: new Date(),
        type: 'info'
      }]);
    }
  }, [t, messages.length]);

  // Professional API validation
  const handleValidateAPI = async () => {
    if (!apiKeyInput) {
      setValidationResult({ isValid: false, error: 'API key is required' });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const config: AIConfig = {
        ...aiConfig,
        apiKey: apiKeyInput,
        model: modelInput
      };

      const result = await validateAPIConfiguration(config);
      setValidationResult(result);

      const feedbackMessage = generateFeedbackMessage('validate', result, language);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: feedbackMessage,
        timestamp: new Date(),
        type: result.isValid ? 'success' : 'error'
      }]);

      if (result.isValid && setAiConfig) {
        setAiConfig({ 
          apiKey: apiKeyInput, 
          model: modelInput, 
          enabled: true 
        });
      }

    } catch (error) {
      const errorResult: APIValidationResult = {
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      };
      setValidationResult(errorResult);
    } finally {
      setIsValidating(false);
    }
  };

  // Enhanced AI message processing with advanced task management
  const processAICommand = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    // Delete commands
    if (lowerMessage.includes('töröl') || lowerMessage.includes('delete')) {
      if (lowerMessage.includes('minden') || lowerMessage.includes('all')) {
        // Delete all tasks
        const result = await taskManager.deleteAllTasks();
        return generateFeedbackMessage('delete', result, language);
      } else if (lowerMessage.includes('kategória') || lowerMessage.includes('category')) {
        // Extract category from message
        const categoryMatch = lowerMessage.match(/(year|month|week|day|év|hónap|hét|nap)/);
        if (categoryMatch) {
          const category = categoryMatch[1];
          const mappedCategory = category === 'év' ? 'Year' : 
                                 category === 'hónap' ? 'Month' : 
                                 category === 'hét' ? 'Week' : 
                                 category === 'nap' ? 'Day' : category;
          
          const result = await taskManager.deleteAllTasksFromCategory(mappedCategory);
          return generateFeedbackMessage('delete', result, language);
        }
      }
    }

    // Task creation commands
    if (lowerMessage.includes('új feladat') || lowerMessage.includes('create task') || lowerMessage.includes('add task')) {
      // Extract task details from message
      const taskText = userMessage.replace(/(új feladat|create task|add task)[:.]?\s*/i, '');
      
      if (taskText.trim()) {
        const taskObj: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
          text: taskText,
          time: '',
          completed: false,
          priority: 'medium',
          subtasks: [],
          collapsed: true,
          color: '#ffffff',
          notes: `Created by AI on ${new Date().toLocaleString()}`
        };
        
        onCreateTask(taskObj, 'Day');
        return generateFeedbackMessage('create', { success: true, message: `Task "${taskText}" created` }, language);
      }
    }

    // Default AI response
    return '';
  };

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
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // First check for AI commands
      const commandResponse = await processAICommand(currentInput);
      
      if (commandResponse) {
        // Command was processed, show result
        const commandMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'system',
          content: commandResponse,
          timestamp: new Date(),
          type: commandResponse.includes('✅') ? 'success' : 'error'
        };

        setMessages(prev => prev.map(msg => msg.isLoading ? commandMessage : msg));
      } else {
        // Regular AI chat
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
                content: `You are a professional AI assistant for task management and productivity. 
                You can help with creating, updating, and managing tasks across Year, Month, Week, and Day categories.
                
                Available commands:
                - "delete all" or "töröl minden" - Delete all tasks
                - "delete category [name]" or "töröl kategória [név]" - Delete all tasks from a category
                - "create task [description]" or "új feladat [leírás]" - Create a new task
                
                Current language: ${language}
                Respond in the same language as the user's message.
                Be helpful, professional, and concise.`
              },
              {
                role: "user",
                content: currentInput
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

        // Enhanced task detection and creation
        const taskMatch = aiContent.match(/(?:Feladat|Task):(.+?)(?:\n|$)/i);
        if (taskMatch) {
          const taskText = taskMatch[1].trim();
          const priorityMatch = aiContent.match(/(?:Prioritás|Priority):\s*(low|medium|high)/i);
          const categoryMatch = aiContent.match(/(?:Kategória|Category):\s*(Year|Month|Week|Day)/i);
          const subcategoryMatch = aiContent.match(/(?:Alkategória|Subcategory):\s*([A-Za-z0-9]+)/i);

          const taskObj: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
            text: taskText,
            time: '',
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
      }
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
      timestamp: new Date(),
      type: 'info'
    }]);
  };

  const exportChat = () => {
    const chatText = messages
      .filter(msg => !msg.isLoading)
      .map(msg => `${msg.role === 'user' ? 'User' : msg.role === 'system' ? 'System' : 'AI'}: ${msg.content}`)
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

  // Quick action buttons
  const quickActions = [
    {
      label: t('deleteAllTasks'),
      action: () => setInputMessage('töröl minden feladatot'),
      icon: Trash2,
      variant: 'destructive' as const
    },
    {
      label: t('createDailyTask'),
      action: () => setInputMessage('új feladat: '),
      icon: Zap,
      variant: 'default' as const
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('aiAssistant')}
          </h2>
          {validationResult?.isValid && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
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
            <div className="p-4 space-y-4">
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
                    onClick={handleValidateAPI}
                    disabled={isValidating || !apiKeyInput}
                    className="min-w-[100px]"
                  >
                    {isValidating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-1" />
                        {t('validate')}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Validation Result */}
              {validationResult && (
                <div className={`p-3 rounded-lg border ${
                  validationResult.isValid 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    {validationResult.isValid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${
                      validationResult.isValid 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {validationResult.isValid 
                        ? `✅ API Valid (${validationResult.model})` 
                        : `❌ ${validationResult.error}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('quickActions')}
                </label>
                <div className="flex gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant}
                      size="sm"
                      onClick={action.action}
                      className="flex items-center space-x-1"
                    >
                      <action.icon className="w-3 h-3" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
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
                    : message.role === 'system'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : message.role === 'system' ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                
                <div className={`flex-1 p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.role === 'system'
                    ? message.type === 'success' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : message.type === 'error'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
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
                        {message.role !== 'user' && message.id !== 'welcome' && (
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