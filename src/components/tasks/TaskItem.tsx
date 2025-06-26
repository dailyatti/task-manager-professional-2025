import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Palette,
  Clock,
  Edit3,
  Check,
  Bot,
  Calendar,
  CalendarDays
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { convertTextToLinks } from '../../utils/taskUtils';
import { useTranslation } from '../../utils/translations';
import type { Task, Priority } from '../../types';

interface TaskItemProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
  onAddSubtask: (text: string) => void;
  onGenerateSubtasks: () => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
  aiEnabled: boolean;
  language: string;
  activeTab: string;
  taskDate: string | null;
}

const priorityStyles = {
  low: 'border-l-success-500 bg-success-50 dark:bg-success-900/20',
  medium: 'border-l-warning-500 bg-warning-50 dark:bg-warning-900/20',
  high: 'border-l-error-500 bg-error-50 dark:bg-error-900/20',
};

const priorityColors = {
  low: 'text-success-700 dark:text-success-300',
  medium: 'text-warning-700 dark:text-warning-300',
  high: 'text-error-700 dark:text-error-300',
};

export function TaskItem({ 
  task, 
  onUpdate, 
  onDelete, 
  onAddSubtask,
  onGenerateSubtasks,
  onDeleteSubtask, 
  onToggleSubtask,
  aiEnabled,
  language,
  activeTab,
  taskDate
}: TaskItemProps) {
  const { t } = useTranslation(language);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDue, setIsDue] = useState(false);
  const [highlight, setHighlight] = useState<'none' | 'yellow' | 'red'>('none');

  useEffect(() => {
    if (!task.time) return;
    const checkDue = () => {
      const now = new Date();
      const [taskHour, taskMinute] = task.time.split(':').map(Number);
      if (isNaN(taskHour) || isNaN(taskMinute)) return setIsDue(false);
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const taskMinutes = taskHour * 60 + taskMinute;
      setIsDue(nowMinutes >= taskMinutes);
    };
    checkDue();
    const interval = setInterval(checkDue, 1000);
    return () => clearInterval(interval);
  }, [task.time]);

  useEffect(() => {
    const checkHighlight = () => {
      if (activeTab === 'Day' && task.time) {
        // Óra-perc pontos kiemelés
        const now = new Date();
        const [taskHour, taskMinute] = task.time.split(':').map(Number);
        if (isNaN(taskHour) || isNaN(taskMinute)) return setHighlight('none');
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const taskMinutes = taskHour * 60 + taskMinute;
        if (nowMinutes === taskMinutes) setHighlight('yellow');
        else if (nowMinutes > taskMinutes) setHighlight('red');
        else setHighlight('none');
      } else if (taskDate) {
        // Dátum alapú kiemelés (hét, hónap, év nézet)
        const today = new Date();
        const taskD = new Date(taskDate);
        // Csak év/hónap/napot hasonlítunk
        const todayStr = today.toISOString().split('T')[0];
        const taskStr = taskD.toISOString().split('T')[0];
        if (taskStr === todayStr) setHighlight('yellow');
        else if (taskD < today) setHighlight('red');
        else setHighlight('none');
      } else {
        setHighlight('none');
      }
    };
    checkHighlight();
    const interval = setInterval(checkHighlight, 1000);
    return () => clearInterval(interval);
  }, [activeTab, task.time, taskDate]);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onUpdate({ text: editText.trim(), updatedAt: new Date() });
      setIsEditing(false);
    }
  };

  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      onAddSubtask(newSubtaskText.trim());
      setNewSubtaskText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isEditing) {
        handleSaveEdit();
      } else {
        handleAddSubtask();
      }
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(task.text);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        group relative rounded-xl border-l-4 bg-white dark:bg-gray-800 
        shadow-sm hover:shadow-md transition-all duration-200
        ${priorityStyles[task.priority]}
        ${task.completed ? 'opacity-75' : ''}
        ${isDue ? 'bg-red-500 text-white border-red-700' : ''}
        ${highlight === 'yellow' ? 'bg-yellow-400 text-black border-yellow-600' : ''}
        ${highlight === 'red' ? 'bg-red-500 text-white border-red-700' : ''}
        ${highlight === 'none' ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : ''}
      `}
      style={{ backgroundColor: task.color !== '#ffffff' ? task.color + '20' : undefined }}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Completion Checkbox */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdate({ completed: !task.completed })}
            className={`
              mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${task.completed 
                ? 'bg-primary-600 border-primary-600' 
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
              }
            `}
          >
            {task.completed && <Check className="w-3 h-3 text-white" />}
          </motion.button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Time and Date Badges */}
                {(() => {
                  // Get current time
                  const now = new Date();
                  const currentDate = new Date(now);
                  currentDate.setHours(0,0,0,0);
                  
                  // Parse task date - use task.date if available, otherwise createdAt
                  const taskDateStr = task.date || task.createdAt;
                  const taskDate = new Date(taskDateStr);
                  const taskDateOnly = new Date(taskDate);
                  taskDateOnly.setHours(0,0,0,0);
                  
                  // Check if date has passed
                  const isDatePast = taskDateOnly < currentDate;
                  const isToday = taskDateOnly.getTime() === currentDate.getTime();
                  
                  // Check if time has passed (only relevant if today)
                  let isTimePast = false;
                  if (task.time && isToday) {
                    const [hours, minutes] = task.time.split(':').map(Number);
                    const taskDateTime = new Date(taskDate);
                    taskDateTime.setHours(hours, minutes, 0, 0);
                    isTimePast = taskDateTime < now;
                  }
                  
                  // Determine colors for time badge
                  const timeColorClass = (isDatePast || (isToday && isTimePast))
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-400 dark:border-yellow-600'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-400 dark:border-green-600';
                  
                  // Determine colors for date badge  
                  const dateColorClass = isDatePast
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-400 dark:border-yellow-600'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-400 dark:border-green-600';
                  
                  return (
                    <>
                      {task.time && (
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium mb-2 border-2 ${timeColorClass}`}>
                          <Clock className="w-3 h-3" />
                          <span>{task.time}</span>
                        </div>
                      )}
                      
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium mb-2 border-2 ${task.time ? 'ml-2' : ''} ${dateColorClass}`}>
                        <CalendarDays className="w-3 h-3" />
                        <span>{new Date(taskDateStr).toLocaleDateString(language === 'hu' ? 'hu-HU' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </>
                  );
                })()}

                {/* Google Calendar Badge */}
                {task.googleEventId && (
                  <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-md text-xs font-medium text-green-600 dark:text-green-400 mb-2 ml-2">
                    <Calendar className="w-3 h-3" />
                    <span>{t('synced')}</span>
                  </div>
                )}

                {/* Task Text */}
                {isEditing ? (
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleSaveEdit}
                    className="mb-0"
                    autoFocus
                  />
                ) : (
                  <p
                    className={`
                      text-gray-900 dark:text-white font-medium leading-relaxed
                      ${task.completed ? 'line-through opacity-60' : ''}
                    `}
                    dangerouslySetInnerHTML={{ __html: convertTextToLinks(task.text) }}
                  />
                )}

                {/* Priority Badge */}
                <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium mt-2 ${priorityColors[task.priority]}`}>
                  {t(`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`)} {t('priority')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="p-1.5"
                  >
                    <Palette className="w-4 h-4" />
                  </Button>
                  
                  {showColorPicker && (
                    <div className="absolute top-full right-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                      <input
                        type="color"
                        value={task.color || '#ffffff'}
                        onChange={(e) => {
                          onUpdate({ color: e.target.value });
                          setShowColorPicker(false);
                        }}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                <select
                  value={task.priority}
                  onChange={(e) => onUpdate({ priority: e.target.value as Priority })}
                  className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="low">{t('priorityLow')}</option>
                  <option value="medium">{t('priorityMedium')}</option>
                  <option value="high">{t('priorityHigh')}</option>
                </select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="p-1.5 text-error-600 hover:text-error-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdate({ collapsed: !task.collapsed })}
                  className="p-1.5"
                >
                  {task.collapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Subtasks */}
            <AnimatePresence>
              {!task.collapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-2"
                >
                  {task.subtasks.map((subtask) => (
                    <motion.div
                      key={subtask.id}
                      layout
                      className="flex items-center space-x-3 group/subtask"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onToggleSubtask(subtask.id)}
                        className={`
                          w-4 h-4 rounded border-2 flex items-center justify-center
                          transition-all duration-200
                          ${subtask.completed 
                            ? 'bg-primary-600 border-primary-600' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                          }
                        `}
                      >
                        {subtask.completed && <Check className="w-2.5 h-2.5 text-white" />}
                      </motion.button>
                      
                      <span
                        className={`
                          flex-1 text-sm text-gray-700 dark:text-gray-300
                          ${subtask.completed ? 'line-through opacity-60' : ''}
                        `}
                        dangerouslySetInnerHTML={{ __html: convertTextToLinks(subtask.text) }}
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSubtask(subtask.id)}
                        className="p-1 opacity-0 group-hover/subtask:opacity-100 transition-opacity duration-200"
                      >
                        <Trash2 className="w-3 h-3 text-error-600" />
                      </Button>
                    </motion.div>
                  ))}

                  {/* Add Subtask */}
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder={t('addSubtaskPlaceholder')}
                      value={newSubtaskText}
                      onChange={(e) => setNewSubtaskText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddSubtask}
                      disabled={!newSubtaskText.trim()}
                      className="shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    {aiEnabled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onGenerateSubtasks}
                        className="shrink-0"
                        title={t('generateSubtasksWithAI')}
                      >
                        <Bot className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}