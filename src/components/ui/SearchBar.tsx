import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Calendar, FileText, CheckSquare, Clock, Star } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { useTranslation } from '../../utils/translations';
import type { Task, Note } from '../../types';

interface SearchResult {
  id: string;
  type: 'task' | 'note' | 'project';
  title: string;
  content: string;
  category?: string;
  subcategory?: string;
  priority?: string;
  dueDate?: string;
  completed?: boolean;
  color?: string;
}

interface SearchBarProps {
  taskData: any;
  notes: Note[];
  onResultClick: (result: SearchResult) => void;
  language: string;
  className?: string;
}

export function SearchBar({
  taskData,
  notes,
  onResultClick,
  language,
  className = ''
}: SearchBarProps) {
  const { t } = useTranslation(language);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeFilters, setActiveFilters] = useState<{
    tasks: boolean;
    notes: boolean;
    projects: boolean;
    completed: boolean;
    pending: boolean;
  }>({
    tasks: true,
    notes: true,
    projects: true,
    completed: true,
    pending: true
  });
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true);
      const timeoutId = setTimeout(() => {
        performSearch();
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query, activeFilters]);

  const performSearch = () => {
    const searchResults: SearchResult[] = [];
    const searchTerm = query.toLowerCase();

    // Search in tasks
    if (activeFilters.tasks) {
      const searchTasks = (tasks: Record<string, Task>, category?: string, subcategory?: string) => {
        Object.values(tasks).forEach(task => {
          const matchesQuery = task.text.toLowerCase().includes(searchTerm);
          const matchesFilter = (activeFilters.completed && task.completed) || 
                               (activeFilters.pending && !task.completed);

          if (matchesQuery && matchesFilter) {
            searchResults.push({
              id: task.id,
              type: 'task',
              title: task.text,
              content: task.text,
              category,
              subcategory,
              priority: task.priority,
              dueDate: task.dueDate,
              completed: task.completed,
              color: task.color
            });
          }

          // Search in subtasks
          if (task.subtasks) {
            searchTasks(task.subtasks, category, subcategory);
          }
        });
      };

      // Search in Year tasks
      if (taskData.Year?.tasks) {
        searchTasks(taskData.Year.tasks, 'Year');
      }

      // Search in Month tasks
      if (taskData.Month) {
        Object.entries(taskData.Month).forEach(([month, monthData]: [string, any]) => {
          if (monthData?.tasks) {
            searchTasks(monthData.tasks, 'Month', month);
          }
        });
      }

      // Search in Week tasks
      if (taskData.Week) {
        Object.entries(taskData.Week).forEach(([day, dayData]: [string, any]) => {
          if (dayData?.tasks) {
            searchTasks(dayData.tasks, 'Week', day);
          }
        });
      }

      // Search in Day tasks
      if (taskData.Day?.tasks) {
        searchTasks(taskData.Day.tasks, 'Day');
      }
    }

    // Search in notes
    if (activeFilters.notes) {
      notes.forEach(note => {
        const matchesQuery = note.title.toLowerCase().includes(searchTerm) ||
                           note.content.toLowerCase().includes(searchTerm);
        const matchesFilter = (activeFilters.completed && note.archived) || 
                             (activeFilters.pending && !note.archived);

        if (matchesQuery && matchesFilter) {
          searchResults.push({
            id: note.id,
            type: 'note',
            title: note.title,
            content: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
            dueDate: note.updatedAt
          });
        }
      });
    }

    // Search in projects (Year/Month/Week/Day plans)
    if (activeFilters.projects) {
      const searchProjects = (data: any, category: string, subcategory?: string) => {
        if (data?.text && data.text.toLowerCase().includes(searchTerm)) {
          searchResults.push({
            id: `${category}-${subcategory || 'main'}`,
            type: 'project',
            title: `${subcategory || category} ${t('plans')}`,
            content: data.text.substring(0, 100) + (data.text.length > 100 ? '...' : ''),
            category,
            subcategory
          });
        }
      };

      if (taskData.Year) {
        searchProjects(taskData.Year, 'Year');
      }

      if (taskData.Month) {
        Object.entries(taskData.Month).forEach(([month, monthData]: [string, any]) => {
          searchProjects(monthData, 'Month', month);
        });
      }

      if (taskData.Week) {
        Object.entries(taskData.Week).forEach(([day, dayData]: [string, any]) => {
          searchProjects(dayData, 'Week', day);
        });
      }

      if (taskData.Day) {
        searchProjects(taskData.Day, 'Day');
      }
    }

    setResults(searchResults);
    setShowResults(searchResults.length > 0);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckSquare className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      case 'project': return <Calendar className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getPriorityIcon = (priority?: string) => {
    if (!priority) return null;
    return <Star className="w-3 h-3 text-yellow-500" />;
  };

  const getResultColor = (result: SearchResult) => {
    if (result.type === 'task' && result.color) {
      return result.color;
    }
    switch (result.type) {
      case 'task': return '#3B82F6';
      case 'note': return '#10B981';
      case 'project': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 mt-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex flex-wrap gap-1">
          {Object.entries(activeFilters).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setActiveFilters(prev => ({ ...prev, [key]: !value }))}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                value 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' 
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50"
          >
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">
                {t('searching')}...
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      onResultClick(result);
                      setShowResults(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-start space-x-3">
                      <div 
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: getResultColor(result) }}
                      >
                        {getResultIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </h4>
                          {getPriorityIcon(result.priority)}
                          {result.completed && (
                            <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                              {t('completed')}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {result.content}
                        </p>
                        
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                          {result.category && (
                            <span className="capitalize">{result.category}</span>
                          )}
                          {result.subcategory && (
                            <span>{result.subcategory}</span>
                          )}
                          {result.dueDate && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(result.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                {t('noResultsFound')}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 