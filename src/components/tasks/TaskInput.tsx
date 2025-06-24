import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, Upload, Bot } from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { parseTasksFromText } from '../../utils/taskUtils';
import { useTranslation } from '../../utils/translations';

interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerateTasks: () => void;
  onAddManualTask: () => void;
  placeholder?: string;
  isGenerating?: boolean;
  aiEnabled?: boolean;
  language: string;
}

export function TaskInput({ 
  value, 
  onChange, 
  onGenerateTasks, 
  onAddManualTask,
  placeholder,
  isGenerating = false,
  aiEnabled = false,
  language
}: TaskInputProps) {
  const { t } = useTranslation(language);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const textFile = files.find(file => file.type === 'text/plain' || file.name.endsWith('.txt'));
    
    if (textFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result as string);
        }
      };
      reader.readAsText(textFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const taskCount = parseTasksFromText(value).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Textarea with Drag & Drop */}
      <div
        className={`
          relative transition-all duration-200
          ${dragActive ? 'scale-105 ring-2 ring-primary-500 ring-opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `${t('enterTask')}...`}
          className="min-h-[120px] resize-none"
        />
        
        {dragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 border-2 border-dashed border-primary-300 dark:border-primary-600 rounded-xl flex items-center justify-center"
          >
            <div className="text-center">
              <Upload className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-primary-700 dark:text-primary-300 font-medium">
                {t('dropFileHere')}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Task Count and AI Status */}
      <div className="flex items-center justify-between">
        {taskCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            {taskCount} {taskCount !== 1 ? t('tasksDetected') : t('taskDetected')}
          </motion.div>
        )}
        
        {aiEnabled && (
          <div className="flex items-center space-x-2 text-sm text-success-600 dark:text-success-400">
            <Bot className="w-4 h-4" />
            <span>{t('aiAssistantActive')}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onGenerateTasks}
          disabled={!value.trim()}
          isLoading={isGenerating}
          className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {aiEnabled ? t('generateTasksWithAI') : t('generateTasks')}
        </Button>
        
        <Button
          variant="outline"
          onClick={onAddManualTask}
          className="sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('addTask')}
        </Button>
      </div>
    </motion.div>
  );
}