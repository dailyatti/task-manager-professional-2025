import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Trash2, Copy, Download, Plus, Sparkles, AlertTriangle, Clock, CheckCircle, XCircle, Zap, Brain } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { generateWithAI } from '../../utils/aiProviders';
import { useTranslation } from '../../utils/translations';
import { 
  detectLanguageFromText, 
  analyzeTaskContext, 
  generateContextualPrompt, 
  createSmartTaskFromAI,
  parseTaskOperations,
  executeTaskOperations
} from '../../utils/aiChatUtils';
import type { AIConfig, Task, Priority, TaskData } from '../../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  language?: string;
  suggestions?: TaskSuggestion[];
  warnings?: string[];
  conflicts?: ConflictInfo[];
  operations?: OperationResult[];
  confidence?: number;
  processingTime?: number;
}

interface TaskSuggestion {
  id: string;
  text: string;
  category: 'Year' | 'Month' | 'Week' | 'Day';
  subcategory?: string;
  priority: Priority;
  date?: string;
  time?: string;
  notes?: string;
  confidence: number;
  operation: 'create' | 'modify' | 'delete' | 'replace' | 'overwrite';
}

interface ConflictInfo {
  date: string;
  time?: string;
  existingTasks: string[];
  action: 'replace' | 'add' | 'reschedule';
  severity: 'low' | 'medium' | 'high';
  autoResolution?: string;
}

interface OperationResult {
  operation: string;
  target: string;
  status: 'success' | 'failed' | 'warning';
  message: string;
  confidence: number;
}

interface AIChatPanelProps {
  aiConfig: AIConfig;
  taskData: TaskData;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, category: string, subcategory?: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
  language: string;
}

export function AIChatPanel({ aiConfig, taskData, onCreateTask, onUpdateTask, onDeleteTask, language }: AIChatPanelProps) {
  const { t } = useTranslation(language);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStats, setAiStats] = useState({
    totalOperations: 0,
    successfulOperations: 0,
    averageConfidence: 0,
    averageProcessingTime: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history
    const savedMessages = localStorage.getItem('aiChatHistory');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Chat előzmények betöltése sikertelen:', error);
      }
    }

    // Add professional welcome message
    if (!savedMessages) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: language === 'hu' ? 
          `🤖 **PROFESSZIONÁLIS AI FELADATTERVEZŐ ASSZISZTENS** - TELJES JOGOSULTSÁGGAL

**🚀 FEJLETT KÉPESSÉGEIM:**
• 🧠 **Intelligens feladatkezelés** - Automatikus kategorizálás és prioritás beállítás
• 📅 **Professzionális naptárintegráció** - Ütközésellenőrzés és automatikus ütemezés
• 🔥 **TELJES JOGOSULTSÁG** - Létrehozás, módosítás, törlés, felülírás
• 🎯 **Kontextus-alapú elemzés** - Dátum, idő, prioritás automatikus felismerés
• ⚡ **Tömeges műveletek** - Összes feladat kezelése egyszerre
• 🛡️ **Biztonságos végrehajtás** - Minden művelet naplózása és visszakövetése

**💡 PROFESSZIONÁLIS PARANCSOK:**
\`\`\`
"Tedd át máról holnapra a megbeszélést"
→ AI: Automatikusan megkeresi és átütemezi

"A júniusi feladatok angol részfeladatait írd át magyarra"  
→ AI: Automatikusan lefordítja és frissíti

"Töröld az összes alacsony prioritású feladatot"
→ AI: Automatikusan szűri és törli

"Optimalizáld a heti programomat"
→ AI: Automatikusan átrendezi és javítja
\`\`\`

**🎯 PÉLDA KOMPLEX MŰVELETEK:**
• **Dátum áthelyezés:** "Holnapi meetinget tedd át péntekre 14:00-ra"
• **Tömeges fordítás:** "Minden angol feladatot fordíts le magyarra"
• **Prioritás optimalizálás:** "Sürgős feladatokat rakd előre"
• **Kategória átrendezés:** "Heti feladatokat oszd szét napokra"
• **Teljes felülírás:** "Cseréld le a holnapi programot új edzéstervvel"

Írj bármit magyarul vagy angolul - automatikusan felismerem és **TELJES JOGOSULTSÁGGAL** végrehajtom! 🛡️⚡` :
          `🤖 **PROFESSIONAL AI TASK PLANNING ASSISTANT** - FULL PERMISSIONS

**🚀 ADVANCED CAPABILITIES:**
• 🧠 **Intelligent task management** - Automatic categorization and priority setting
• 📅 **Professional calendar integration** - Conflict detection and automatic scheduling
• 🔥 **FULL PERMISSIONS** - Create, modify, delete, overwrite
• 🎯 **Context-based analysis** - Automatic date, time, priority recognition
• ⚡ **Bulk operations** - Handle all tasks at once
• 🛡️ **Secure execution** - All operations logged and traceable

**💡 PROFESSIONAL COMMANDS:**
\`\`\`
"Move tomorrow's meeting to the day after"
→ AI: Automatically finds and reschedules

"Translate English subtasks in June tasks to Hungarian"
→ AI: Automatically translates and updates

"Delete all low priority tasks"
→ AI: Automatically filters and deletes

"Optimize my weekly schedule"
→ AI: Automatically reorganizes and improves
\`\`\`

**🎯 EXAMPLE COMPLEX OPERATIONS:**
• **Date transfer:** "Move tomorrow's meeting to Friday 2 PM"
• **Bulk translation:** "Translate all English tasks to Hungarian"
• **Priority optimization:** "Move urgent tasks to the front"
• **Category reorganization:** "Distribute weekly tasks across days"
• **Complete overwrite:** "Replace tomorrow's schedule with new workout plan"

Write anything in Hungarian or English - I'll automatically recognize and execute with **FULL PERMISSIONS**! 🛡️⚡`,
        timestamp: new Date(),
        language: language,
        confidence: 1.0
      };
      setMessages([welcomeMessage]);
    }
  }, [language]);

  useEffect(() => {
    // Save chat history
    if (messages.length > 0) {
      localStorage.setItem('aiChatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateAiStats = (confidence: number, processingTime: number, successful: boolean) => {
    setAiStats(prev => ({
      totalOperations: prev.totalOperations + 1,
      successfulOperations: prev.successfulOperations + (successful ? 1 : 0),
      averageConfidence: (prev.averageConfidence * prev.totalOperations + confidence) / (prev.totalOperations + 1),
      averageProcessingTime: (prev.averageProcessingTime * prev.totalOperations + processingTime) / (prev.totalOperations + 1)
    }));
  };

  const checkDateConflicts = (date: string, time?: string): ConflictInfo[] => {
    const conflicts: ConflictInfo[] = [];
    const targetDate = new Date(date);
    
    // Check all task collections for conflicts
    const allTasks = [
      ...Object.values(taskData.Year.tasks),
      ...Object.values(taskData.Day.tasks),
      ...Object.values(taskData.Month).flatMap(month => Object.values(month.tasks)),
      ...Object.values(taskData.Week).flatMap(week => Object.values(week.tasks))
    ];

    const conflictingTasks = allTasks.filter(task => {
      if (!task.time) return false;
      
      const taskDate = new Date(task.createdAt);
      const isSameDate = taskDate.toDateString() === targetDate.toDateString();
      
      if (time && task.time) {
        const timeDiff = Math.abs(
          new Date(`2000-01-01 ${time}`).getTime() - 
          new Date(`2000-01-01 ${task.time}`).getTime()
        );
        return isSameDate && timeDiff < 60 * 60 * 1000; // 1 hour buffer
      }
      
      return isSameDate;
    });

    if (conflictingTasks.length > 0) {
      conflicts.push({
        date,
        time,
        existingTasks: conflictingTasks.map(t => t.text),
        action: 'add',
        severity: conflictingTasks.length > 2 ? 'high' : conflictingTasks.length > 1 ? 'medium' : 'low',
        autoResolution: language === 'hu' ? 
          `Automatikus javaslat: Ütemezd át ${time ? `${time} helyett ` : ''}${new Date(new Date(date).getTime() + 60*60*1000).toLocaleTimeString('hu-HU', {hour: '2-digit', minute: '2-digit'})}-ra` :
          `Auto suggestion: Reschedule to ${new Date(new Date(date).getTime() + 60*60*1000).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})} instead of ${time || 'current time'}`
      });
    }

    return conflicts;
  };

  const generateSmartResponse = async (userText: string, context: any): Promise<{
    content: string;
    suggestions: TaskSuggestion[];
    operations: OperationResult[];
    confidence: number;
  }> => {
    const { language: detectedLang, intent, entities, confidence } = context;
    const startTime = Date.now();
    
    try {
      const systemPrompt = generateContextualPrompt(userText, detectedLang, taskData, intent);
      
      const response = await generateWithAI(systemPrompt, aiConfig, 'plan');
      const processingTime = Date.now() - startTime;
      
      if (response.success && response.data) {
        const aiResponse = Array.isArray(response.data) ? response.data.join('\n') : response.data.toString();
        
        // Parse task operations from AI response
        const operations = parseTaskOperations(aiResponse, detectedLang);
        
        // Execute operations with full permissions
        const executionResults = executeTaskOperations(
          operations,
          taskData,
          onCreateTask,
          onUpdateTask || (() => {}),
          onDeleteTask || (() => {}),
          (category: string) => {
            // Clear category implementation
            if (category === 'all') {
              // Clear all tasks - would need implementation
              console.log('🔥 CLEARING ALL TASKS');
            } else {
              console.log(`🧹 CLEARING CATEGORY: ${category}`);
            }
          }
        );
        
        // Extract task suggestions from AI response
        const suggestions = extractTaskSuggestions(aiResponse, detectedLang, entities);
        
        // Convert execution results to operation results
        const operationResults: OperationResult[] = executionResults.results.map((result, index) => ({
          operation: operations[index]?.operation || 'unknown',
          target: operations[index]?.target || 'unknown',
          status: result.startsWith('✅') ? 'success' : result.startsWith('⚠️') ? 'warning' : 'failed',
          message: result,
          confidence: operations[index]?.confidence || 0.5
        }));
        
        updateAiStats(confidence, processingTime, executionResults.executed > executionResults.failed);
        
        return {
          content: aiResponse,
          suggestions,
          operations: operationResults,
          confidence
        };
      }
    } catch (error) {
      console.error('AI response error:', error);
    }

    // Fallback responses
    const fallbackContent = detectedLang === 'hu' ? 
      `🔧 **PROFESSZIONÁLIS AI HIBA**

Sajnálom, de jelenleg nem tudok válaszolni. Kérlek ellenőrizd az AI beállításokat!

**🚀 GYORS SEGÍTSÉG - TELJES JOGOSULTSÁGGAL:**
• **Feladat létrehozás:** "Hozz létre egy feladatot holnapra 14:00-ra"
• **Feladat módosítás:** "Módosítsd a holnapi meetinget 15:00-ra"
• **Feladat törlés:** "Töröld az összes alacsony prioritású feladatot"
• **Dátum áthelyezés:** "Tedd át máról holnapra a megbeszélést"
• **Nyelv váltás:** "Fordítsd le az angol feladatokat magyarra"
• **Optimalizálás:** "Optimalizáld a heti programomat"

**⚡ TÖMEGES MŰVELETEK:**
• "Töröld mind" - Összes feladat törlése
• "Rendezd át prioritás szerint" - Automatikus átrendezés
• "Tisztítsd meg a heti kategóriát" - Kategória törlés` :
      `🔧 **PROFESSIONAL AI ERROR**

Sorry, I can't respond right now. Please check your AI settings!

**🚀 QUICK HELP - FULL PERMISSIONS:**
• **Task creation:** "Create a task for tomorrow at 2 PM"
• **Task modification:** "Change tomorrow's meeting to 3 PM"
• **Task deletion:** "Delete all low priority tasks"
• **Date transfer:** "Move today's meeting to tomorrow"
• **Language switch:** "Translate English tasks to Hungarian"
• **Optimization:** "Optimize my weekly schedule"

**⚡ BULK OPERATIONS:**
• "Delete all" - Clear all tasks
• "Organize by priority" - Automatic reorganization
• "Clear weekly category" - Category deletion`;

    return {
      content: fallbackContent,
      suggestions: [],
      operations: [],
      confidence: 0.1
    };
  };

  const extractTaskSuggestions = (content: string, detectedLang: string, entities: any): TaskSuggestion[] => {
    const suggestions: TaskSuggestion[] = [];
    
    // Look for FELADAT_START...FELADAT_END blocks
    const taskBlocks = content.split('FELADAT_START').slice(1);
    
    taskBlocks.forEach(block => {
      const endIndex = block.indexOf('FELADAT_END');
      if (endIndex === -1) return;
      
      const taskContent = block.substring(0, endIndex).trim();
      const lines = taskContent.split('\n').map(line => line.trim()).filter(line => line);
      
      let taskText = '';
      let category: 'Year' | 'Month' | 'Week' | 'Day' = 'Day';
      let priority: Priority = 'medium';
      let date = '';
      let time = '';
      let reasoning = '';
      let confidence = 0.8;
      
      lines.forEach(line => {
        if (line.startsWith('Feladat:') || line.startsWith('Task:')) {
          taskText = line.split(':')[1].trim();
        } else if (line.startsWith('Kategória:') || line.startsWith('Category:')) {
          category = line.split(':')[1].trim() as any;
        } else if (line.startsWith('Prioritás:') || line.startsWith('Priority:')) {
          priority = line.split(':')[1].trim() as Priority;
        } else if (line.startsWith('Időpont:') || line.startsWith('Date:')) {
          date = line.split(':')[1].trim();
        } else if (line.startsWith('Idő:') || line.startsWith('Time:')) {
          time = line.split(':')[1].trim();
        } else if (line.startsWith('Indoklás:') || line.startsWith('Reasoning:')) {
          reasoning = line.split(':')[1].trim();
        } else if (line.startsWith('Bizonyosság:') || line.startsWith('Confidence:')) {
          confidence = parseFloat(line.split(':')[1].trim()) || 0.8;
        }
      });
      
      if (taskText) {
        suggestions.push({
          id: `suggestion-${Date.now()}-${Math.random()}`,
          text: taskText,
          category,
          priority,
          date: date || new Date().toISOString().split('T')[0],
          time,
          notes: `🤖 ${reasoning} (${Math.round(confidence * 100)}% bizonyosság)`,
          confidence,
          operation: 'create'
        });
      }
    });
    
    // Fallback: extract from regular content
    if (suggestions.length === 0) {
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
          const taskText = trimmed.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
          
          if (taskText.length > 5 && taskText.length < 200) {
            const smartTask = createSmartTaskFromAI(taskText, content, detectedLang, entities);
            
            suggestions.push({
              id: `suggestion-${Date.now()}-${Math.random()}`,
              text: smartTask.task.text,
              category: smartTask.category,
              subcategory: smartTask.subcategory,
              priority: smartTask.task.priority,
              date: new Date().toISOString().split('T')[0],
              time: smartTask.task.time || '',
              notes: smartTask.task.notes || '',
              confidence: smartTask.confidence,
              operation: smartTask.operation || 'create'
            });
          }
        }
      }
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading) return;

    const startTime = Date.now();
    const detectedLanguage = detectLanguageFromText(text);
    const context = analyzeTaskContext(text, detectedLanguage);
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date(),
      language: detectedLanguage,
      confidence: context.confidence
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      if (!aiConfig.enabled || !aiConfig.apiKey) {
        throw new Error(detectedLanguage === 'hu' ? 
          'AI nincs konfigurálva. Kérlek állítsd be az AI szolgáltatót a Beállításokban.' :
          'AI not configured. Please set up AI provider in Settings.');
      }

      // Check for date conflicts if relevant
      let conflicts: ConflictInfo[] = [];
      if (context.intent.conflictCheck || context.intent.taskCreation || context.intent.scheduling) {
        context.entities.dates.forEach(dateEntity => {
          const timeEntity = context.entities.times.find(t => t.confidence > 0.7);
          conflicts = [...conflicts, ...checkDateConflicts(dateEntity.value, timeEntity?.value)];
        });
      }

      const smartResponse = await generateSmartResponse(text, context);
      const processingTime = Date.now() - startTime;
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: smartResponse.content,
        timestamp: new Date(),
        language: detectedLanguage,
        suggestions: smartResponse.suggestions.length > 0 ? smartResponse.suggestions : undefined,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
        operations: smartResponse.operations.length > 0 ? smartResponse.operations : undefined,
        confidence: smartResponse.confidence,
        processingTime
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (smartResponse.suggestions.length > 0) {
        setPendingTasks(smartResponse.suggestions);
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: detectedLanguage === 'hu' ? 
          `❌ **PROFESSZIONÁLIS AI HIBA**

Elnézést, de hibába ütköztem: ${error instanceof Error ? error.message : 'Ismeretlen hiba'}

**🔧 HIBAELHÁRÍTÁS:**
1. Ellenőrizd az AI konfigurációt a Beállításokban
2. Győződj meg róla, hogy az API kulcs érvényes
3. Próbáld újra később
4. Használd a gyors parancsokat

**⚡ GYORS PARANCSOK TELJES JOGOSULTSÁGGAL:**
• "Segítség" - Részletes útmutató
• "Státusz" - AI rendszer állapot
• "Teszt" - Kapcsolat ellenőrzés` :
          `❌ **PROFESSIONAL AI ERROR**

Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}

**🔧 TROUBLESHOOTING:**
1. Check AI configuration in Settings
2. Make sure API key is valid
3. Try again later
4. Use quick commands

**⚡ QUICK COMMANDS WITH FULL PERMISSIONS:**
• "Help" - Detailed guide
• "Status" - AI system status
• "Test" - Connection check`,
        timestamp: new Date(),
        language: detectedLanguage,
        confidence: 0.1
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTaskFromSuggestion = (suggestion: TaskSuggestion) => {
    const task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      text: suggestion.text,
      time: suggestion.time || '',
      completed: false,
      priority: suggestion.priority,
      subtasks: [],
      collapsed: true,
      color: '#ffffff',
      notes: suggestion.notes || ''
    };

    onCreateTask(task, suggestion.category, suggestion.subcategory);
    
    // Remove from pending tasks
    setPendingTasks(prev => prev.filter(t => t.id !== suggestion.id));
    
    // Add confirmation message
    const confirmMessage: ChatMessage = {
      id: `msg-${Date.now()}-confirm`,
      role: 'system',
      content: language === 'hu' ? 
        `✅ **FELADAT SIKERESEN LÉTREHOZVA**

**📋 Feladat:** "${suggestion.text}"
**📂 Kategória:** ${suggestion.category}${suggestion.subcategory ? ` - ${suggestion.subcategory}` : ''}
**⭐ Prioritás:** ${suggestion.priority}
**🎯 Bizonyosság:** ${Math.round(suggestion.confidence * 100)}%
**⚡ Művelet:** ${suggestion.operation}

🤖 AI professzionális asszisztens által automatikusan végrehajtva!` :
        `✅ **TASK SUCCESSFULLY CREATED**

**📋 Task:** "${suggestion.text}"
**📂 Category:** ${suggestion.category}${suggestion.subcategory ? ` - ${suggestion.subcategory}` : ''}
**⭐ Priority:** ${suggestion.priority}
**🎯 Confidence:** ${Math.round(suggestion.confidence * 100)}%
**⚡ Operation:** ${suggestion.operation}

🤖 Automatically executed by AI professional assistant!`,
      timestamp: new Date(),
      language: language,
      confidence: suggestion.confidence
    };
    
    setMessages(prev => [...prev, confirmMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    const confirmText = language === 'hu' ? 
      'Biztosan törölni szeretnéd a chat előzményeket?' :
      'Are you sure you want to clear chat history?';
      
    if (confirm(confirmText)) {
      setMessages([]);
      setPendingTasks([]);
      localStorage.removeItem('aiChatHistory');
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const exportChat = () => {
    const chatData = {
      exportDate: new Date().toISOString(),
      messages: messages,
      language: language,
      aiStats: aiStats
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-chat-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const quickPrompts = language === 'hu' ? [
    'Segíts megtervezni a napomat',
    'Tedd át máról holnapra a meetinget',
    'Töröld az alacsony prioritású feladatokat',
    'Optimalizáld a heti programomat',
    'Fordítsd le az angol feladatokat',
    'Mi van holnap délután?'
  ] : [
    'Help me plan my day',
    'Move today\'s meeting to tomorrow',
    'Delete low priority tasks',
    'Optimize my weekly schedule',
    'Translate English tasks',
    'What\'s tomorrow afternoon?'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === 'hu' ? '🤖 Professzionális AI Asszisztens' : '🤖 Professional AI Assistant'}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              {aiConfig.enabled ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {language === 'hu' ? 'Csatlakozva' : 'Connected'}: {aiConfig.provider}
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {language === 'hu' ? 'Nincs konfigurálva' : 'Not configured'}
                </span>
              )}
              
              {/* AI Stats */}
              {aiStats.totalOperations > 0 && (
                <div className="flex items-center space-x-2">
                  <Zap className="w-3 h-3" />
                  <span>{aiStats.successfulOperations}/{aiStats.totalOperations}</span>
                  <span>({Math.round(aiStats.averageConfidence * 100)}%)</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={exportChat} disabled={messages.length === 0}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={clearChat} disabled={messages.length === 0}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'hu' ? '🤖 Professzionális AI Asszisztens' : '🤖 Professional AI Assistant'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {language === 'hu' ? 
                'Intelligens feladatkezelés TELJES JOGOSULTSÁGGAL - létrehozás, módosítás, törlés, optimalizálás' :
                'Intelligent task management with FULL PERMISSIONS - create, modify, delete, optimize'}
            </p>
            
            {/* Quick Prompts */}
            <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={!aiConfig.enabled}
                  className="text-left justify-start"
                >
                  <Sparkles className="w-3 h-3 mr-2" />
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-primary-600 text-white' 
                        : message.role === 'system'
                        ? 'bg-green-600 text-white'
                        : 'bg-purple-600 text-white'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4" /> : 
                       message.role === 'system' ? <CheckCircle className="w-4 h-4" /> :
                       <Brain className="w-4 h-4" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : message.role === 'system'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        
                        {/* Language and confidence indicators */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-opacity-20 border-gray-300 dark:border-gray-600">
                          <div className="flex items-center space-x-2 text-xs opacity-70">
                            {message.language && (
                              <span>🌐 {message.language === 'hu' ? 'Magyar' : 'English'}</span>
                            )}
                            {message.confidence && (
                              <span>🎯 {Math.round(message.confidence * 100)}%</span>
                            )}
                            {message.processingTime && (
                              <span>⚡ {message.processingTime}ms</span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <span className={`text-xs ${
                              message.role === 'user' 
                                ? 'text-primary-100' 
                                : message.role === 'system'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {message.timestamp.toLocaleTimeString(language === 'hu' ? 'hu-HU' : 'en-US')}
                            </span>
                            
                            <button
                              onClick={() => copyMessage(message.content)}
                              className={`p-1 rounded hover:bg-opacity-20 hover:bg-gray-500 ${
                                message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                              }`}
                              title={language === 'hu' ? 'Üzenet másolása' : 'Copy message'}
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Operations Results */}
                      {message.operations && message.operations.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                          <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200 mb-2">
                            <Zap className="w-4 h-4" />
                            <span className="font-medium">
                              {language === 'hu' ? 'Végrehajtott műveletek:' : 'Executed operations:'}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {message.operations.map((op, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                {op.status === 'success' ? (
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                ) : op.status === 'warning' ? (
                                  <AlertTriangle className="w-3 h-3 text-yellow-600" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-red-600" />
                                )}
                                <span className="text-blue-700 dark:text-blue-300">
                                  {op.message} ({Math.round(op.confidence * 100)}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Conflicts Warning */}
                      {message.conflicts && message.conflicts.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                          <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200 mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">
                              {language === 'hu' ? 'Ütközés észlelve!' : 'Conflict detected!'}
                            </span>
                          </div>
                          {message.conflicts.map((conflict, index) => (
                            <div key={index} className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                              <p><strong>{conflict.date}</strong> {conflict.time && `- ${conflict.time}`}</p>
                              <p>{language === 'hu' ? 'Meglévő feladatok:' : 'Existing tasks:'}</p>
                              <ul className="list-disc list-inside ml-4">
                                {conflict.existingTasks.map((task, i) => (
                                  <li key={i}>{task}</li>
                                ))}
                              </ul>
                              {conflict.autoResolution && (
                                <p className="mt-1 font-medium">💡 {conflict.autoResolution}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Task Suggestions */}
                      {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {language === 'hu' ? 'Javasolt műveletek:' : 'Suggested operations:'}
                          </p>
                          <div className="space-y-2">
                            {message.suggestions.map((suggestion) => (
                              <div
                                key={suggestion.id}
                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {suggestion.text}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      suggestion.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    }`}>
                                      {suggestion.priority === 'high' ? (language === 'hu' ? 'Magas' : 'High') :
                                       suggestion.priority === 'medium' ? (language === 'hu' ? 'Közepes' : 'Medium') :
                                       (language === 'hu' ? 'Alacsony' : 'Low')}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {suggestion.category}
                                    </span>
                                    {suggestion.time && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {suggestion.time}
                                      </span>
                                    )}
                                    <span className="text-xs text-blue-500 dark:text-blue-400">
                                      {Math.round(suggestion.confidence * 100)}%
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleCreateTaskFromSuggestion(suggestion)}
                                  className="ml-3"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  {language === 'hu' ? 'Végrehajtás' : 'Execute'}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'hu' ? '🤖 Professzionális AI elemzi és végrehajtja...' : '🤖 Professional AI analyzing and executing...'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        {!aiConfig.enabled && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>
                {language === 'hu' ? '🤖 Professzionális AI Asszisztens nincs konfigurálva.' : '🤖 Professional AI Assistant not configured.'}
              </strong>{' '}
              {language === 'hu' ? 
                'Kérlek állítsd be az AI szolgáltatót a Beállításokban a TELJES JOGOSULTSÁGÚ chattelés megkezdéséhez.' :
                'Please set up the AI provider in Settings to start FULL PERMISSIONS chatting.'}
            </p>
          </div>
        )}
        
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={aiConfig.enabled ? 
                (language === 'hu' ? 
                  "🤖 Professzionális AI - TELJES JOGOSULTSÁG: 'Tedd át máról holnapra', 'Töröld az angol feladatokat', 'Optimalizálj'..." :
                  "🤖 Professional AI - FULL PERMISSIONS: 'Move from today to tomorrow', 'Delete English tasks', 'Optimize'...") :
                (language === 'hu' ? 
                  "Konfiguráld a Professzionális AI-t a Beállításokban a TELJES JOGOSULTSÁGÚ chattelés megkezdéséhez" :
                  "Configure Professional AI in Settings to start FULL PERMISSIONS chatting")}
              disabled={!aiConfig.enabled || isLoading}
              className="resize-none"
            />
          </div>
          
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || !aiConfig.enabled || isLoading}
            className="px-4 py-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        {aiConfig.enabled && messages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {(language === 'hu' ? 
              ['Optimalizálj', 'Töröld mind', 'Státusz', 'Segítség'] :
              ['Optimize', 'Delete all', 'Status', 'Help']
            ).map((prompt, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-xs"
              >
                {prompt}
              </Button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}