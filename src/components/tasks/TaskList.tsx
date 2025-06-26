import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskItem } from './TaskItem';
import { createNewSubtask, getTaskDateForView } from '../../utils/taskUtils';
import { generateWithAI } from '../../utils/aiProviders';
import { useTranslation } from '../../utils/translations';
import type { Task, AIConfig } from '../../types';

interface TaskListProps {
  tasks: Record<string, Task>;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  aiConfig: AIConfig;
  language: string;
  activeTab: string;
}

export function TaskList({ tasks, onUpdateTask, onDeleteTask, aiConfig, language, activeTab }: TaskListProps) {
  const { t } = useTranslation(language);
  const taskList = Object.entries(tasks).sort((a, b) => {
    // Sort by priority (high -> medium -> low), then by creation time
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a[1].priority];
    const bPriority = priorityOrder[b[1].priority];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return new Date(a[1].createdAt).getTime() - new Date(b[1].createdAt).getTime();
  });

  const handleAddSubtask = async (taskId: string, text: string) => {
    const task = tasks[taskId];
    if (task) {
      const newSubtask = createNewSubtask(text);
      onUpdateTask(taskId, {
        subtasks: [...task.subtasks, newSubtask],
        updatedAt: new Date(),
      });
    }
  };

  const handleGenerateSubtasks = async (taskId: string) => {
    const task = tasks[taskId];
    if (!task || !aiConfig.enabled) return;

    try {
      const response = await generateWithAI(task.text, aiConfig, 'subtasks');
      if (response.success && response.data) {
        const newSubtasks = response.data.map(text => createNewSubtask(text));
        onUpdateTask(taskId, {
          subtasks: [...task.subtasks, ...newSubtasks],
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to generate subtasks:', error);
    }
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks[taskId];
    if (task) {
      onUpdateTask(taskId, {
        subtasks: task.subtasks.filter(st => st.id !== subtaskId),
        updatedAt: new Date(),
      });
    }
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks[taskId];
    if (task) {
      onUpdateTask(taskId, {
        subtasks: task.subtasks.map(st => 
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        ),
        updatedAt: new Date(),
      });
    }
  };

  if (taskList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('noTasksYet')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {t('createFirstTask')}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {taskList.map(([taskId, task]) => (
          <TaskItem
            key={taskId}
            task={task}
            onUpdate={(updates) => onUpdateTask(taskId, updates)}
            onDelete={() => onDeleteTask(taskId)}
            onAddSubtask={(text) => handleAddSubtask(taskId, text)}
            onGenerateSubtasks={() => handleGenerateSubtasks(taskId)}
            onDeleteSubtask={(subtaskId) => handleDeleteSubtask(taskId, subtaskId)}
            onToggleSubtask={(subtaskId) => handleToggleSubtask(taskId, subtaskId)}
            aiEnabled={aiConfig.enabled}
            language={language}
            activeTab={activeTab}
            taskDate={getTaskDateForView(task, activeTab)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}