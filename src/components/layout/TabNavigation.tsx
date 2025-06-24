import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CalendarDays, Clock, FileText, Target, MessageSquare, CalendarRange } from 'lucide-react';
import { useTranslation } from '../../utils/translations';
import type { TabType } from '../../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  language: string;
}

export function TabNavigation({ activeTab, onTabChange, language }: TabNavigationProps) {
  const { t } = useTranslation(language);

  const tabs = [
    { id: 'Year' as TabType, label: t('year'), icon: Target },
    { id: 'Month' as TabType, label: t('month'), icon: Calendar },
    { id: 'Week' as TabType, label: t('week'), icon: CalendarDays },
    { id: 'Day' as TabType, label: t('day'), icon: Clock },
    { id: 'Calendar' as TabType, label: t('calendar'), icon: CalendarRange },
    { id: 'Chat' as TabType, label: t('chat'), icon: MessageSquare },
    { id: 'Notes' as TabType, label: t('notes'), icon: FileText },
  ];

  return (
    <div className="w-full border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex items-center space-x-2 px-4 py-3 rounded-t-xl
                  font-medium text-sm whitespace-nowrap transition-all duration-200
                  ${isActive 
                    ? 'text-primary-600 bg-white dark:bg-gray-800 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }
                `}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}