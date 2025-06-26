import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Brain, BarChart3, Settings, X, Globe, Menu, ChevronDown } from 'lucide-react';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const currentLanguageName = supportedLanguages.find(lang => lang.code === language)?.name || 'English';

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 glass backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-1.5 sm:p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0"
            >
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent truncate">
                {t('appTitle')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Task Stats */}
            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
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
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="hidden sm:inline">{currentLanguageName}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              
              <AnimatePresence>
                {showLanguageDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[150px] z-50"
                  >
                    {supportedLanguages.map(({ code, name }) => (
                      <button
                        key={code}
                        onClick={() => {
                          onLanguageChange(code);
                          setShowLanguageDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          language === code ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
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

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Mobile Stats - Compact */}
            <div className="hidden sm:flex items-center space-x-2 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <BarChart3 className="w-3 h-3 text-primary-600" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {stats.completed}/{stats.total}
              </span>
              <div className="w-8 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completionRate}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                />
              </div>
            </div>

            {/* Theme Toggle Mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-1.5"
              aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-1.5"
              aria-label="Menu"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-3 space-y-3"
            >
              {/* Mobile Task Stats */}
              <div className="sm:hidden flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-primary-600" />
                                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                     Progress
                   </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stats.completed}/{stats.total}
                  </span>
                  <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
              </div>

              {/* Mobile Language Selector */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('language')}
                </label>
                <select
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                >
                  {supportedLanguages.map(({ code, name }) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Settings Button */}
              <Button
                variant={showSettings ? "primary" : "outline"}
                size="sm"
                onClick={() => {
                  onSettingsClick();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>{t('settings')}</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Close mobile menu when clicking outside */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-30 lg:hidden" 
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Close language dropdown when clicking outside */}
      {showLanguageDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowLanguageDropdown(false)}
        />
      )}
    </motion.header>
  );
}