import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Tag, Bot, Edit3, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { generateWithAI } from '../../utils/aiProviders';
import { useTranslation } from '../../utils/translations';
import type { Note, AIConfig } from '../../types';

interface NotesManagerProps {
  notes: Record<string, Note>;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
  onDeleteNote: (noteId: string) => void;
  onCreateNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  aiConfig: AIConfig;
  language: string;
}

export function NotesManager({ 
  notes, 
  onUpdateNote, 
  onDeleteNote, 
  onCreateNote,
  aiConfig,
  language
}: NotesManagerProps) {
  const { t } = useTranslation(language);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [newTag, setNewTag] = useState('');

  const selectedNote = selectedNoteId ? notes[selectedNoteId] : null;
  const notesList = Object.entries(notes);

  const filteredNotes = notesList.filter(([, note]) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateNote = () => {
    const title = prompt(t('noteTitle') + ':');
    if (title?.trim()) {
      onCreateNote({
        title: title.trim(),
        content: '',
        plan: '',
        tags: [],
      });
    }
  };

  const handleUpdateContent = (content: string) => {
    if (selectedNoteId) {
      onUpdateNote(selectedNoteId, { content });
    }
  };

  const handleUpdateTitle = (title: string) => {
    if (selectedNoteId) {
      onUpdateNote(selectedNoteId, { title });
    }
  };

  const handleAddTag = () => {
    if (selectedNoteId && newTag.trim()) {
      const currentTags = selectedNote?.tags || [];
      if (!currentTags.includes(newTag.trim())) {
        onUpdateNote(selectedNoteId, {
          tags: [...currentTags, newTag.trim()]
        });
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (selectedNoteId) {
      const currentTags = selectedNote?.tags || [];
      onUpdateNote(selectedNoteId, {
        tags: currentTags.filter(tag => tag !== tagToRemove)
      });
    }
  };

  const handleGeneratePlan = async () => {
    if (!selectedNote || !aiConfig.enabled) return;

    setIsGeneratingPlan(true);
    try {
      const response = await generateWithAI(selectedNote.content, aiConfig, 'plan');
      if (response.success && response.data) {
        onUpdateNote(selectedNoteId!, {
          plan: response.data.join('\n')
        });
      }
    } catch (error) {
      console.error('Terv generálása sikertelen:', error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Notes List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('notes')}
          </h3>
          <Button onClick={handleCreateNote} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t('createNote')}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Notes List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredNotes.map(([noteId, note]) => (
              <motion.div
                key={noteId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onClick={() => setSelectedNoteId(noteId)}
                className={`
                  p-4 rounded-xl border cursor-pointer transition-all duration-200
                  ${selectedNoteId === noteId
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {note.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {note.content || 'Nincs tartalom'}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          >
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{note.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(noteId);
                    }}
                    className="p-1 text-error-600 hover:text-error-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Note Editor */}
      <div className="lg:col-span-2">
        {selectedNote ? (
          <motion.div
            key={selectedNoteId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Note Header */}
            <div className="flex items-center justify-between">
              <Input
                value={selectedNote.title}
                onChange={(e) => handleUpdateTitle(e.target.value)}
                className="text-xl font-semibold border-none bg-transparent p-0 focus:ring-0"
                placeholder={t('noteTitle') + '...'}
              />
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePlan}
                  disabled={!aiConfig.enabled || !selectedNote.content.trim()}
                  isLoading={isGeneratingPlan}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  {t('generatePlan')}
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Címkék</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Címke hozzáadása..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="w-24 text-sm"
                  />
                  <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
                    {t('addTask')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('noteContent')}
              </label>
              <Textarea
                value={selectedNote.content}
                onChange={(e) => handleUpdateContent(e.target.value)}
                placeholder="Írd ide a jegyzet tartalmát..."
                className="min-h-[300px]"
              />
            </div>

            {/* Generated Plan */}
            {selectedNote.plan && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Generált Terv
                </label>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {selectedNote.plan}
                  </pre>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-64 text-center">
            <div>
              <Edit3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nincs jegyzet kiválasztva
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Válassz egy jegyzetet a listából vagy hozz létre egy újat a kezdéshez
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}