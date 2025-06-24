import React from 'react';
import { motion } from 'framer-motion';

interface SubTabNavigationProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SubTabNavigation({ tabs, activeTab, onTabChange }: SubTabNavigationProps) {
  return (
    <div className="w-full bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            
            return (
              <motion.button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`
                  relative px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                  transition-all duration-200
                  ${isActive 
                    ? 'text-primary-600 bg-white dark:bg-gray-700 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab}
                
                {isActive && (
                  <motion.div
                    layoutId="activeSubTab"
                    className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-lg -z-10"
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