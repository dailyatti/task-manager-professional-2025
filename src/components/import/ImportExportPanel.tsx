import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { exportData, validateImportData, mergeTaskData } from '../../utils/importExport';
import { useTranslation } from '../../utils/translations';
import type { TaskData, ImportOptions } from '../../types';

interface ImportExportPanelProps {
  taskData: TaskData;
  onImport: (data: TaskData) => void;
  language: string;
}

export function ImportExportPanel({ taskData, onImport, language }: ImportExportPanelProps) {
  const { t } = useTranslation(language);
  const [importMode, setImportMode] = useState<ImportOptions['mode']>('merge');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = () => {
    try {
      const jsonData = exportData(taskData);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `feladat-tervezo-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: t('exportData') + ' ' + t('success').toLowerCase() + '!' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: t('exportData') + ' ' + t('error').toLowerCase() + '.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (!validateImportData(importedData)) {
          setMessage({ type: 'error', text: 'Érvénytelen fájlformátum. Kérlek ellenőrizd a JSON struktúrát.' });
          setTimeout(() => setMessage(null), 5000);
          return;
        }

        const mergedData = mergeTaskData(taskData, importedData, { mode: importMode });
        onImport(mergedData);
        
        setMessage({ type: 'success', text: `Adatok sikeresen importálva ${importMode} módban!` });
        setTimeout(() => setMessage(null), 3000);
      } catch {
        setMessage({ type: 'error', text: 'JSON fájl feldolgozása sikertelen. Kérlek ellenőrizd a fájl formátumát.' });
        setTimeout(() => setMessage(null), 5000);
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('importData')} & {t('exportData')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Feladatadatok biztonsági mentése és visszaállítása
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Export Section */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            {t('exportData')}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Töltsd le az összes feladatot, jegyzetet és beállítást JSON fájlként.
          </p>
          <Button onClick={handleExport} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Exportálás JSON-ba
          </Button>
        </div>

        {/* Import Section */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            {t('importData')}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Feladatok és jegyzetek importálása JSON fájlból.
          </p>
          
          {/* Import Mode Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Importálási Mód
            </label>
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value as ImportOptions['mode'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-ring"
            >
              <option value="merge">Összefésülés - Minden importált adat hozzáadása (duplikátumokat is)</option>
              <option value="replace">Felülírás - Összes meglévő adat cseréje</option>
              <option value="append">Egyedi Hozzáadás - Csak nem létező elemek hozzáadása</option>
            </select>
          </div>

          {/* Import Mode Descriptions */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {importMode === 'merge' && (
                <p><strong>Összefésülés:</strong> Minden importált adatot hozzáad a meglévő adatokhoz. Duplikátumokat is létrehozhat.</p>
              )}
              {importMode === 'replace' && (
                <p><strong>Felülírás:</strong> Teljesen lecseréli az összes meglévő adatot az importált adatokra.</p>
              )}
              {importMode === 'append' && (
                <p><strong>Egyedi Hozzáadás:</strong> Csak azokat az elemeket adja hozzá, amelyek még nem léteznek tartalom alapján.</p>
              )}
            </div>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="import-file"
            />
            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Importálás JSON-ból
            </Button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center space-x-2 text-sm p-3 rounded-xl ${
              message.type === 'success'
                ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                : 'bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}