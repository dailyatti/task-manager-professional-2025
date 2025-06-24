import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Brain, BarChart3, Settings, X, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { getSupportedLanguages, useTranslation } from '../../utils/translations';
import type { TaskStats } from '../../types';

interface HeaderProps {
  stats: TaskStats;
  onSettingsClick: () => void;
  showSettings: boolean;
  language: string;
  onLanguageChange: (language: string) => void;
}

export function Header({ stats, onSettingsClick, showSettings, language, onLanguageChange }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation(language);
  const supportedLanguages = getSupportedLanguages();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 glass backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg"
            >
              <Brain className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                {t('appTitle')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Stats and Controls */}
          <div className="flex items-center space-x-4">
            {/* Task Stats */}
            <div className="hidden sm:flex items-center space-x-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stats.completed}/{stats.total}
                </span>
              </div>
              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completionRate}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(stats.completionRate)}%
              </span>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                title={t('language')}
              >
                {supportedLanguages.map(({ code, name }) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Settings Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className={`p-2 ${showSettings ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : ''}`}
              aria-label={t('settings')}
            >
              <motion.div
                animate={{ rotate: showSettings ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {showSettings ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Settings className="w-5 h-5" />
                )}
              </motion.div>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
              aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700" />
                )}
              </motion.div>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}