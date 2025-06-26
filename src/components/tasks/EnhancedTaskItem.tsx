import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  CheckCircle, 
  Circle, 
  Trash2, 
  Edit3, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Calendar,
  Tag,
  Star,
  StarOff,
  GripVertical,
  MoreVertical,
  Copy,
  Archive,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTranslation } from '../../utils/translations';
import type { Task } from '../../types';

interface EnhancedTaskItemProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onAddSubtask: (parentId: string, subtaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSubtask: (parentId: string, subtaskId: string, updates: Partial<Task>) => void;
  onDeleteSubtask: (parentId: string, subtaskId: string) => void;
  language: string;
  className?: string;
}

export function EnhancedTaskItem({
  task,
  onUpdate,
  onDelete,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  language,
  className = ''
}: EnhancedTaskItemProps) {
  const { t } = useTranslation(language);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [subtaskText, setSubtaskText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [color, setColor] = useState(task.color || '#3B82F6');
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const subtasks = task.subtasks || [];

  useEffect(() => {
    setEditText(task.text);
    setDueDate(task.dueDate || '');
    setPriority(task.priority || 'medium');
    setColor(task.color || '#3B82F6');
  }, [task]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleComplete = () => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onUpdate(task.id, { 
        text: editText.trim(),
        dueDate,
        priority,
        color
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(task.text);
    setDueDate(task.dueDate || '');
    setPriority(task.priority || 'medium');
    setColor(task.color || '#3B82F6');
    setIsEditing(false);
  };

  const handleAddSubtask = () => {
    if (subtaskText.trim()) {
      onAddSubtask(task.id, {
        text: subtaskText.trim(),
        completed: false,
        priority: 'medium',
        color: '#6B7280',
        dueDate: '',
        subtasks: {}
      });
      setSubtaskText('');
      setShowSubtaskInput(false);
    }
  };

  const handleDuplicate = () => {
    const duplicatedTask = {
      ...task,
      text: `${task.text} (${t('duplicate')})`,
      completed: false,
      subtasks: {}
    };
    delete duplicatedTask.id;
    delete duplicatedTask.createdAt;
    delete duplicatedTask.updatedAt;
    onUpdate(task.id, duplicatedTask as Partial<Task>);
  };

  const handleArchive = () => {
    onUpdate(task.id, { archived: true });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-3 h-3" />;
      case 'medium': return <Star className="w-3 h-3" />;
      case 'low': return <StarOff className="w-3 h-3" />;
      default: return <Star className="w-3 h-3" />;
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
    >
      <div className="p-4">
        {/* Main Task Row */}
        <div className="flex items-start space-x-3">
          {/* Drag Handle */}
          <div className="flex-shrink-0 pt-1">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
          </div>

          {/* Complete Checkbox */}
          <button
            onClick={handleToggleComplete}
            className="flex-shrink-0 pt-1 text-gray-400 hover:text-primary-600 transition-colors"
          >
            {task.completed ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  ref={inputRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                  className="text-sm"
                />
                
                <div className="flex flex-wrap gap-2">
                  {/* Due Date */}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="text-xs w-32"
                    />
                  </div>

                  {/* Priority */}
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                    >
                      <option value="low">{t('priorityLow')}</option>
                      <option value="medium">{t('priorityMedium')}</option>
                      <option value="high">{t('priorityHigh')}</option>
                    </select>
                  </div>

                  {/* Color */}
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: color }} />
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-6 p-0 border-0"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSaveEdit}>
                    {t('save')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    {t('cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      {task.text}
                    </p>
                    
                    {/* Task Meta */}
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                      {task.dueDate && (
                        <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
                          <Clock className="w-3 h-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          {isOverdue && <span className="text-red-600">({t('overdue')})</span>}
                        </div>
                      )}
                      
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getPriorityColor(priority)}`}>
                        {getPriorityIcon(priority)}
                        <span>{t(`priority${priority.charAt(0).toUpperCase() + priority.slice(1)}`)}</span>
                      </div>

                      {subtasks.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span>{subtasks.length} {t('subtasks')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 ml-2">
                    {subtasks.length > 0 && (
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => setShowSubtaskInput(!showSubtaskInput)}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      title={t('addSubtask')}
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <div className="relative" ref={optionsRef}>
                      <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {showOptions && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                          >
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setIsEditing(true);
                                  setShowOptions(false);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                              >
                                <Edit3 className="w-4 h-4" />
                                <span>{t('edit')}</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  handleDuplicate();
                                  setShowOptions(false);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                              >
                                <Copy className="w-4 h-4" />
                                <span>{t('duplicate')}</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  handleArchive();
                                  setShowOptions(false);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                              >
                                <Archive className="w-4 h-4" />
                                <span>{t('archive')}</span>
                              </button>
                              
                              <hr className="my-1 border-gray-200 dark:border-gray-700" />
                              
                              <button
                                onClick={() => {
                                  onDelete(task.id);
                                  setShowOptions(false);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>{t('delete')}</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Subtask Input */}
                <AnimatePresence>
                  {showSubtaskInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <div className="flex space-x-2">
                        <Input
                          value={subtaskText}
                          onChange={(e) => setSubtaskText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                          placeholder={t('addSubtaskPlaceholder')}
                          className="flex-1 text-sm"
                        />
                        <Button size="sm" onClick={handleAddSubtask}>
                          {t('add')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowSubtaskInput(false)}>
                          {t('cancel')}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Subtasks */}
        <AnimatePresence>
          {isExpanded && subtasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 ml-8 space-y-2"
            >
              <Reorder.Group axis="y" values={subtasks} onReorder={() => {}}>
                {subtasks.map((subtask) => (
                  <Reorder.Item key={subtask.id} value={subtask}>
                    <EnhancedTaskItem
                      task={subtask}
                      onUpdate={(subtaskId, updates) => onUpdateSubtask(task.id, subtaskId, updates)}
                      onDelete={(subtaskId) => onDeleteSubtask(task.id, subtaskId)}
                      onAddSubtask={onAddSubtask}
                      onUpdateSubtask={onUpdateSubtask}
                      onDeleteSubtask={onDeleteSubtask}
                      language={language}
                      className="border-l-2 border-gray-200 dark:border-gray-600"
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
} 