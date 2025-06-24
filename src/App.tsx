import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/layout/Header';
import { TabNavigation } from './components/layout/TabNavigation';
import { SubTabNavigation } from './components/layout/SubTabNavigation';
import { TaskInput } from './components/tasks/TaskInput';
import { TaskList } from './components/tasks/TaskList';
import { NotesManager } from './components/notes/NotesManager';
import { AIConfigPanel } from './components/ai/AIConfigPanel';
import { ImportExportPanel } from './components/import/ImportExportPanel';
import { GoogleCalendarPanel } from './components/calendar/GoogleCalendarPanel';
import { CalendarView } from './components/calendar/CalendarView';
import { AIChatPanel } from './components/chat/AIChatPanel';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useLanguage } from './hooks/useLanguage';
import { getTranslations } from './utils/translations';
import { 
  createNewTask, 
  parseTasksFromText, 
  calculateGlobalStats,
  generateUniqueId
} from './utils/taskUtils';
import { generateWithAI } from './utils/aiProviders';
import { GoogleCalendarIntegration } from './utils/googleCalendar';
import type { TaskData, TabType, Task, Note, AIConfig, GoogleCalendarConfig, TaskCollection } from './types';
import { StringTranslationKey } from './utils/translations';

// Initialize default task data
const getInitialTaskData = (): TaskData => ({
  Year: { text: '', tasks: {} },
  Month: {
    January: { text: '', tasks: {} },
    February: { text: '', tasks: {} },
    March: { text: '', tasks: {} },
    April: { text: '', tasks: {} },
    May: { text: '', tasks: {} },
    June: { text: '', tasks: {} },
    July: { text: '', tasks: {} },
    August: { text: '', tasks: {} },
    September: { text: '', tasks: {} },
    October: { text: '', tasks: {} },
    November: { text: '', tasks: {} },
    December: { text: '', tasks: {} },
  },
  Week: {
    Monday: { text: '', tasks: {} },
    Tuesday: { text: '', tasks: {} },
    Wednesday: { text: '', tasks: {} },
    Thursday: { text: '', tasks: {} },
    Friday: { text: '', tasks: {} },
    Saturday: { text: '', tasks: {} },
    Sunday: { text: '', tasks: {} },
  },
  Day: { text: '', tasks: {} },
  Notes: {},
});

function App() {
  const { language, setLanguage, t } = useLanguage();
  
  const [taskData, setTaskData] = useLocalStorage<TaskData>('taskData', getInitialTaskData());
  const [activeTab, setActiveTab] = useState<TabType>('Year');
  const [activeSubTab, setActiveSubTab] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // AI Configuration
  const [aiConfig, setAiConfig] = useLocalStorage<AIConfig>('aiConfig', {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o',
    enabled: false,
  });

  // Google Calendar Configuration
  const [calendarConfig, setCalendarConfig] = useLocalStorage<GoogleCalendarConfig>('calendarConfig', {
    enabled: false,
  });

  const [calendarIntegration] = useState(() => new GoogleCalendarIntegration(calendarConfig));

  // Auto-detect language when AI is connected
  useEffect(() => {
    if (aiConfig.enabled && aiConfig.apiKey) {
      // Auto-detect language based on AI provider or user preference
      // This could be enhanced to detect language from AI responses
    }
  }, [aiConfig.enabled, aiConfig.apiKey]);

  // Set initial sub-tab when main tab changes
  useEffect(() => {
    if (activeTab === 'Month') {
      const { months } = getTranslations(language);
      setActiveSubTab(months[0] || ''); // January equivalent
    } else if (activeTab === 'Week') {
      const { weekdays } = getTranslations(language);
      setActiveSubTab(weekdays[0] || ''); // Monday equivalent
    } else {
      setActiveSubTab('');
    }
  }, [activeTab, language]);

  // Clear AI error when settings are opened
  useEffect(() => {
    if (showSettings) {
      setAiError(null);
    }
  }, [showSettings]);

  const stats = calculateGlobalStats(taskData);

  // Get the correct title for the current tab/subtab
  const getTabTitle = () => {
    if (activeTab === 'Month' && activeSubTab) {
      return `${activeSubTab} ${t('monthlyPlans')}`;
    } else if (activeTab === 'Week' && activeSubTab) {
      return `${activeSubTab} ${t('weeklyPlans')}`;
    } else if (activeTab === 'Year') {
      return t('yearlyPlans');
    } else if (activeTab === 'Day') {
      return t('dailyPlans');
    }
    const tabKey = activeTab.toLowerCase() as StringTranslationKey;
    return `${t(tabKey)} ${t('plans')}`;
  };

  // Get the correct placeholder text
  const getPlaceholderText = () => {
    if (activeTab === 'Year') {
      return t('yearlyPlansPlaceholder');
    } else if (activeTab === 'Month') {
      return t('monthlyPlansPlaceholder');
    } else if (activeTab === 'Week') {
      return t('weeklyPlansPlaceholder');
    } else if (activeTab === 'Day') {
      return t('dailyPlansPlaceholder');
    }
    return `${t('enterTask')}...`;
  };

  const getCurrentTaskCollection = () => {
    if (activeTab === 'Month' && activeSubTab) {
      // Map translated month names back to English keys
      const { months } = getTranslations(language);
      const monthIndex = months.indexOf(activeSubTab);
      const englishMonths = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
      const englishMonth = englishMonths[monthIndex] || 'January';
      return taskData.Month[englishMonth];
    } else if (activeTab === 'Week' && activeSubTab) {
      // Map translated weekday names back to English keys
      const { weekdays } = getTranslations(language);
      const dayIndex = weekdays.indexOf(activeSubTab);
      const englishDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const englishDay = englishDays[dayIndex] || 'Monday';
      return taskData.Week[englishDay];
    } else if (activeTab === 'Year' || activeTab === 'Day') {
      return taskData[activeTab];
    }
    return { text: '', tasks: {} };
  };

  const updateCurrentTaskCollection = (updates: Partial<TaskCollection>) => {
    setTaskData(prev => {
      const newData = { ...prev };
      const currentCollection = getCurrentTaskCollection();

      if (currentCollection) {
        const updatedCollection = {
          ...currentCollection,
          ...updates,
        };
        
        if (activeTab === 'Month' && activeSubTab) {
          const { months } = getTranslations(language);
          const monthIndex = months.indexOf(activeSubTab);
          const englishMonths = ['January', 'February', 'March', 'April', 'May', 'June',
                               'July', 'August', 'September', 'October', 'November', 'December'];
          const englishMonth = englishMonths[monthIndex] || 'January';
          newData.Month[englishMonth as keyof typeof newData.Month] = updatedCollection;
        } else if (activeTab === 'Week' && activeSubTab) {
          const { weekdays } = getTranslations(language);
          const dayIndex = weekdays.indexOf(activeSubTab);
          const englishDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const englishDay = englishDays[dayIndex] || 'Monday';
          newData.Week[englishDay as keyof typeof newData.Week] = updatedCollection;
        } else if (activeTab === 'Year' || activeTab === 'Day') {
          newData[activeTab] = updatedCollection;
        }
      }
      
      return newData;
    });
  };

  const handleInputChange = (value: string) => {
    updateCurrentTaskCollection({ text: value });
  };

  const handleGenerateTasks = async () => {
    const currentCollection = getCurrentTaskCollection();
    if (!currentCollection) return;
    
    const parsedTasks = parseTasksFromText(currentCollection.text);
    
    if (parsedTasks.length === 0) return;

    setIsGenerating(true);
    setAiError(null);
    
    try {
      const newTasks: Record<string, Task> = {};
      
      for (const { text, time } of parsedTasks) {
        const taskId = generateUniqueId('task');
        const newTask = createNewTask(text, time);
        
        // Generate subtasks with AI if enabled
        if (aiConfig.enabled && text.trim()) {
          const response = await generateWithAI(text, aiConfig, 'subtasks');
          if (response.success && response.data) {
            newTask.subtasks = response.data.map(subtaskText => ({
              id: generateUniqueId('subtask'),
              text: subtaskText,
              completed: false,
              createdAt: new Date().toISOString(),
            }));
          } else if (response.error) {
            setAiError(response.error);
            // Continue without AI-generated subtasks
          }
        }
        
        newTasks[taskId] = newTask;

        // Create Google Calendar event if enabled
        if (calendarConfig.enabled) {
          const eventId = await calendarIntegration.createEvent(newTask);
          if (eventId) {
            newTask.googleEventId = eventId;
          }
        }
      }

      updateCurrentTaskCollection({ tasks: newTasks });
    } catch (error) {
      console.error('Error generating tasks:', error);
      setAiError(t('unexpectedError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddManualTask = () => {
    const taskText = prompt(t('newTask') + ':');
    if (taskText?.trim()) {
      const taskId = generateUniqueId('task');
      const newTask = createNewTask(taskText.trim());
      
      const currentCollection = getCurrentTaskCollection();
      if (currentCollection) {
        updateCurrentTaskCollection({
          ...currentCollection,
          tasks: { ...currentCollection.tasks, [taskId]: newTask }
        });
      }
    }
  };

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, category?: string, subcategory?: string) => {
    const taskId = generateUniqueId('task');
    const newTask: Task = {
      ...taskData,
      id: taskId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // If category is specified (from AI chat or calendar), add to that category
    if (category) {
      setTaskData(prev => {
        const newData = { ...prev };
        
        if (category === 'Year' || category === 'Day') {
          newData[category].tasks[taskId] = newTask;
        } else if (category === 'Month' && subcategory) {
          const englishMonths = ['January', 'February', 'March', 'April', 'May', 'June',
                               'July', 'August', 'September', 'October', 'November', 'December'];
          const monthIndex = getTranslations(language).months.indexOf(subcategory);
          const englishMonth = englishMonths[monthIndex] || 'January';
          if (newData.Month[englishMonth]) {
            newData.Month[englishMonth].tasks[taskId] = newTask;
          }
        } else if (category === 'Week' && subcategory) {
          const englishDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const dayIndex = getTranslations(language).weekdays.indexOf(subcategory);
          const englishDay = englishDays[dayIndex] || 'Monday';
          if (newData.Week[englishDay]) {
            newData.Week[englishDay].tasks[taskId] = newTask;
          }
        }
        
        return newData;
      });
    } else {
      // If no category specified, add to Day tasks by default (from calendar)
      setTaskData(prev => ({
        ...prev,
        Day: {
          ...prev.Day,
          tasks: { ...prev.Day.tasks, [taskId]: newTask }
        }
      }));
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    const currentCollection = getCurrentTaskCollection();
    if (!currentCollection) return;

    const existingTask = currentCollection.tasks[taskId];
    if (!existingTask) return;

    const updatedTask: Task = { ...existingTask, ...updates };
    const updatedTasks = { ...currentCollection.tasks, [taskId]: updatedTask };
    updateCurrentTaskCollection({ ...currentCollection, tasks: updatedTasks });

    // Update Google Calendar event if enabled
    if (calendarConfig.enabled && updatedTask.googleEventId) {
      await calendarIntegration.updateEvent(updatedTask.googleEventId, updatedTask);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const currentCollection = getCurrentTaskCollection();
    if (!currentCollection) return;

    const taskToDelete = currentCollection.tasks[taskId];
    const remainingTasks = Object.fromEntries(
      Object.entries(currentCollection.tasks).filter(([id]) => id !== taskId)
    );
    updateCurrentTaskCollection({ ...currentCollection, tasks: remainingTasks });

    // Delete from Google Calendar if enabled
    if (calendarConfig.enabled && taskToDelete?.googleEventId) {
      await calendarIntegration.deleteEvent(taskToDelete.googleEventId);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setShowSettings(false);
    setAiError(null);
  };

  const handleSubTabChange = (subTab: string) => {
    setActiveSubTab(subTab);
    setAiError(null);
  };

  // Notes management
  const handleCreateNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const noteId = generateUniqueId('note');
    const newNote: Note = {
      ...noteData,
      id: noteId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTaskData(prev => ({
      ...prev,
      Notes: {
        ...prev.Notes,
        [noteId]: newNote
      }
    }));
  };

  const handleUpdateNote = (noteId: string, updates: Partial<Note>) => {
    setTaskData(prev => {
      const existingNote = prev.Notes[noteId];
      if (existingNote) {
        return {
          ...prev,
          Notes: {
            ...prev.Notes,
            [noteId]: {
              ...existingNote,
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      }
      return prev;
    });
  };

  const handleDeleteNote = (noteId: string) => {
    setTaskData(prev => {
      const newNotes = { ...prev.Notes };
      delete newNotes[noteId];
      return { ...prev, Notes: newNotes };
    });
  };

  const handleImportData = (importedData: TaskData) => {
    setTaskData(importedData);
  };

  const currentCollection = getCurrentTaskCollection();
  const safeCurrentCollection = currentCollection || { text: '', tasks: {} };
  const subTabs = activeTab === 'Month' ? getTranslations(language).months : activeTab === 'Week' ? getTranslations(language).weekdays : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header 
        stats={stats} 
        onSettingsClick={() => setShowSettings(!showSettings)}
        showSettings={showSettings}
        language={language}
        onLanguageChange={setLanguage}
      />
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} language={language} />
      
      {subTabs.length > 0 && (
        <SubTabNavigation
          tabs={subTabs}
          activeTab={activeSubTab}
          onTabChange={handleSubTabChange}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {showSettings ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('settings')} & {t('configuration')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('configureAiProviders')}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AIConfigPanel
                  config={aiConfig}
                  onSave={setAiConfig}
                  t={(key: string) => t(key as StringTranslationKey)}
                />
                
                <ImportExportPanel
                  taskData={taskData}
                  onImport={handleImportData}
                  language={language}
                />
                
                <div className="lg:col-span-2">
                                  <GoogleCalendarPanel
                  config={calendarConfig}
                  onConfigChange={setCalendarConfig}
                />
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'Calendar' ? (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              <CalendarView
                taskData={taskData}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onCreateTask={handleCreateTask}
                language={language}
              />
            </motion.div>
          ) : activeTab === 'AI Chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)]">
                <AIChatPanel
                  aiConfig={aiConfig}
                  taskData={taskData}
                  onCreateTask={handleCreateTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  language={language}
                />
              </div>
            </motion.div>
          ) : activeTab === 'Notes' ? (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              <NotesManager
                notes={taskData.Notes}
                onCreateNote={handleCreateNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                aiConfig={aiConfig}
                language={language}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`${activeTab}-${activeSubTab}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* AI Error Display */}
              {aiError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                        {t('aiError')}
                      </h3>
                      <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                        {aiError}
                      </p>
                      <button
                        onClick={() => setShowSettings(true)}
                        className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 underline"
                      >
                        {t('aiConfigurePrompt')}
                      </button>
                    </div>
                    <button
                      onClick={() => setAiError(null)}
                      className="flex-shrink-0 text-red-400 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Task Input Section */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {getTabTitle()}
                </h2>
                
                <TaskInput
                  value={safeCurrentCollection.text}
                  onChange={handleInputChange}
                  onGenerateTasks={handleGenerateTasks}
                  onAddManualTask={handleAddManualTask}
                  isGenerating={isGenerating}
                  placeholder={getPlaceholderText()}
                  aiEnabled={aiConfig.enabled}
                  language={language}
                />
              </div>

              {/* Task List Section */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('totalTasks')}
                  </h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {Object.keys(safeCurrentCollection.tasks).length} {Object.keys(safeCurrentCollection.tasks).length !== 1 ? t('totalTasks').toLowerCase() : t('totalTasks').toLowerCase().slice(0, -1)}
                  </div>
                </div>
                
                <TaskList
                  tasks={safeCurrentCollection.tasks}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  aiConfig={aiConfig}
                  language={language}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;