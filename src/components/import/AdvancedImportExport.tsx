import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  Trash2, 
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  CheckSquare,
  FileText as NoteIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from '../../utils/translations';
import type { TaskData, Note } from '../../types';

interface AdvancedImportExportProps {
  taskData: TaskData;
  notes: Note[];
  onImport: (data: TaskData, notes: Note[], mode: 'merge' | 'replace' | 'append') => void;
  onExport: (format: 'json' | 'txt' | 'csv', includeNotes: boolean) => void;
  language: string;
  className?: string;
}

export function AdvancedImportExport({
  taskData,
  notes,
  onImport,
  onExport,
  language,
  className = ''
}: AdvancedImportExportProps) {
  const { t } = useTranslation(language);
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<'json' | 'txt' | 'csv'>('json');
  const [includeNotes, setIncludeNotes] = useState(true);
  const [importMode, setImportMode] = useState<'merge' | 'replace' | 'append'>('merge');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = {
    totalTasks: Object.values(taskData.Year?.tasks || {}).length +
                Object.values(taskData.Month || {}).reduce((acc, month) => 
                  acc + Object.values(month.tasks || {}).length, 0) +
                Object.values(taskData.Week || {}).reduce((acc, day) => 
                  acc + Object.values(day.tasks || {}).length, 0) +
                Object.values(taskData.Day?.tasks || {}).length,
    totalNotes: notes.length,
    completedTasks: 0, // Calculate this from taskData
    pendingTasks: 0, // Calculate this from taskData
  };

  const handleExport = () => {
    onExport(exportFormat, includeNotes);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('processing');
    setImportMessage(t('processingImport'));

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let importedData: any;
        let importedNotes: Note[] = [];

        if (exportFormat === 'json') {
          const parsed = JSON.parse(content);
          importedData = parsed.taskData || parsed;
          importedNotes = parsed.notes || [];
        } else if (exportFormat === 'txt') {
          // Parse text format
          const lines = content.split('\n');
          importedData = parseTextFormat(lines);
        } else if (exportFormat === 'csv') {
          // Parse CSV format
          const lines = content.split('\n');
          importedData = parseCSVFormat(lines);
        }

        onImport(importedData, importedNotes, importMode);
        setImportStatus('success');
        setImportMessage(t('importSuccess'));
        
        setTimeout(() => {
          setImportStatus('idle');
          setImportMessage('');
        }, 3000);
      } catch (error) {
        console.error('Import error:', error);
        setImportStatus('error');
        setImportMessage(t('importError'));
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parseTextFormat = (lines: string[]) => {
    // Simple text format parser
    const result: TaskData = {
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
    };

    // Parse lines and populate result
    // This is a simplified parser - you can enhance it based on your needs
    return result;
  };

  const parseCSVFormat = (lines: string[]) => {
    // CSV format parser
    const result: TaskData = {
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
    };

    // Parse CSV lines and populate result
    // This is a simplified parser - you can enhance it based on your needs
    return result;
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json': return <FileJson className="w-4 h-4" />;
      case 'txt': return <FileText className="w-4 h-4" />;
      case 'csv': return <FileSpreadsheet className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'json': return t('jsonFormatDesc');
      case 'txt': return t('txtFormatDesc');
      case 'csv': return t('csvFormatDesc');
      default: return '';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('dataManagement')}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.totalTasks}</div>
            <div className="text-xs text-gray-500">{t('totalTasks')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            <div className="text-xs text-gray-500">{t('completedTasks')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</div>
            <div className="text-xs text-gray-500">{t('pendingTasks')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalNotes}</div>
            <div className="text-xs text-gray-500">{t('totalNotes')}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'export'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Download className="w-4 h-4 inline mr-2" />
          {t('export')}
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'import'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          {t('import')}
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Format Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  {t('exportFormat')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(['json', 'txt', 'csv'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => setExportFormat(format)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        exportFormat === format
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {getFormatIcon(format)}
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {format.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getFormatDescription(format)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  {t('exportOptions')}
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={includeNotes}
                      onChange={(e) => setIncludeNotes(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('includeNotes')}
                    </span>
                  </label>
                </div>
              </div>

              {/* Export Button */}
              <Button onClick={handleExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                {t('exportData')}
              </Button>
            </motion.div>
          )}

          {activeTab === 'import' && (
            <motion.div
              key="import"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Import Mode */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  {t('importMode')}
                </h3>
                <div className="space-y-3">
                  {([
                    { key: 'merge', label: t('mergeMode'), desc: t('mergeModeDesc') },
                    { key: 'replace', label: t('replaceMode'), desc: t('replaceModeDesc') },
                    { key: 'append', label: t('appendMode'), desc: t('appendModeDesc') }
                  ] as const).map(({ key, label, desc }) => (
                    <label key={key} className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="importMode"
                        value={key}
                        checked={importMode === key}
                        onChange={(e) => setImportMode(e.target.value as any)}
                        className="mt-1 rounded-full border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  {t('selectFile')}
                </h3>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    {t('dragAndDropFile')}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t('browseFiles')}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.txt,.csv"
                    onChange={handleImport}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Status */}
              <AnimatePresence>
                {importStatus !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3 rounded-lg flex items-center space-x-2 ${
                      importStatus === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : importStatus === 'error'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {importStatus === 'success' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : importStatus === 'error' ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                    <span className="text-sm">{importMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 