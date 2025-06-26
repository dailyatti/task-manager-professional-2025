import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Star,
  StarOff,
  Tag,
  Calendar,
  Bot,
  Sparkles,
  MoreVertical,
  X,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { useTranslation } from '../../utils/translations';
import type { Note, AIConfig } from '../../types';

interface EnhancedNotesManagerProps {
  notes: Note[];
  aiConfig: AIConfig;
  onCreateNote: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
  onDeleteNote: (noteId: string) => void;
  language: string;
  className?: string;
}

export function EnhancedNotesManager({
  notes,
  aiConfig,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  language,
  className = ''
}: EnhancedNotesManagerProps) {
  const { t } = useTranslation(language);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    favorites: false,
    archived: false,
    tags: [] as string[]
  });
  const [newNoteData, setNewNoteData] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });
  const [editData, setEditData] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorites = !filters.favorites || note.favorite;
    const matchesArchived = !filters.archived || note.archived;
    const matchesTags = filters.tags.length === 0 || 
                       filters.tags.some(tag => note.tags?.includes(tag));
    
    return matchesSearch && matchesFavorites && matchesArchived && matchesTags;
  });

  const handleCreateNote = () => {
    if (newNoteData.title.trim() || newNoteData.content.trim()) {
      onCreateNote({
        title: newNoteData.title.trim() || t('untitledNote'),
        content: newNoteData.content.trim(),
        tags: newNoteData.tags,
        favorite: false,
        archived: false
      });
      setNewNoteData({ title: '', content: '', tags: [] });
      setIsCreating(false);
    }
  };

  const handleSaveEdit = () => {
    if (selectedNote && (editData.title.trim() || editData.content.trim())) {
      onUpdateNote(selectedNote.id, {
        title: editData.title.trim() || t('untitledNote'),
        content: editData.content.trim(),
        tags: editData.tags
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    if (selectedNote) {
      setEditData({
        title: selectedNote.title,
        content: selectedNote.content,
        tags: selectedNote.tags || []
      });
    }
    setIsEditing(false);
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim() || !aiConfig.enabled || !aiConfig.apiKey) return;

    setIsGenerating(true);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that creates detailed, well-structured notes based on user prompts. Respond in the same language as the user's prompt."
            },
            {
              role: "user",
              content: aiPrompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        const generatedContent = data.choices[0].message.content;
        setNewNoteData(prev => ({
          ...prev,
          content: generatedContent,
          title: aiPrompt.substring(0, 50) + (aiPrompt.length > 50 ? '...' : '')
        }));
      }
    } catch (error) {
      console.error("AI generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleFavorite = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      onUpdateNote(noteId, { favorite: !note.favorite });
    }
  };

  const handleToggleArchive = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      onUpdateNote(noteId, { archived: !note.archived });
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !newNoteData.tags.includes(tag.trim())) {
      setNewNoteData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewNoteData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleEditAddTag = (tag: string) => {
    if (tag.trim() && !editData.tags.includes(tag.trim())) {
      setEditData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const handleEditRemoveTag = (tagToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const exportNotes = () => {
    const notesText = filteredNotes
      .map(note => `# ${note.title}\n\n${note.content}\n\n---\n`)
      .join('\n');
    
    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || [])));

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('notes')}
            </h2>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
              {filteredNotes.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportNotes}
              title={t('exportNotes')}
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={() => setIsCreating(true)}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('createNote')}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 space-y-3">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchNotes')}
              className="pl-10 pr-10"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.favorites}
                      onChange={(e) => setFilters(prev => ({ ...prev, favorites: e.target.checked }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('favorites')}</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.archived}
                      onChange={(e) => setFilters(prev => ({ ...prev, archived: e.target.checked }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('archived')}</span>
                  </label>
                </div>

                {allTags.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('filterByTags')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            tags: prev.tags.includes(tag)
                              ? prev.tags.filter(t => t !== tag)
                              : [...prev.tags, tag]
                          }))}
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            filters.tags.includes(tag)
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* Notes List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4 space-y-2">
            {filteredNotes.length > 0 ? (
              filteredNotes.map(note => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onClick={() => {
                    setSelectedNote(note);
                    setEditData({
                      title: note.title,
                      content: note.content,
                      tags: note.tags || []
                    });
                    setIsEditing(false);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedNote?.id === note.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {note.title}
                        </h3>
                        {note.favorite && (
                          <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                        {note.archived && (
                          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {t('archived')}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {note.content}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        </div>
                        
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex space-x-1">
                            {note.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag}
                                className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {note.tags.length > 2 && (
                              <span className="text-xs text-gray-400">
                                +{note.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(note.id);
                        }}
                        className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        {note.favorite ? (
                          <Star className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleArchive(note.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {note.archived ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <MoreVertical className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>{searchQuery ? t('noNotesFound') : t('noNotesYet')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Note Editor */}
        <div className="flex-1 flex flex-col">
          {isCreating ? (
            <div className="flex-1 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('createNote')}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreating(false)}
                    >
                      {t('cancel')}
                    </Button>
                    <Button size="sm" onClick={handleCreateNote}>
                      {t('create')}
                    </Button>
                  </div>
                </div>

                <Input
                  value={newNoteData.title}
                  onChange={(e) => setNewNoteData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('noteTitle')}
                />

                <Textarea
                  value={newNoteData.content}
                  onChange={(e) => setNewNoteData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={t('noteContentPlaceholder')}
                  className="flex-1 min-h-[300px]"
                />

                {/* AI Generation */}
                {aiConfig.enabled && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('generateWithAI')}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder={t('aiPromptPlaceholder')}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleGenerateWithAI}
                        disabled={!aiPrompt.trim() || isGenerating}
                        size="sm"
                      >
                        {isGenerating ? (
                          <Sparkles className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('tags')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newNoteData.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm flex items-center space-x-1"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-primary-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    placeholder={t('addTagPlaceholder')}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : selectedNote ? (
            <div className="flex-1 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {isEditing ? t('editNote') : selectedNote.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {!isEditing && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          {t('edit')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteNote(selectedNote.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {isEditing && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          {t('cancel')}
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit}>
                          {t('save')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={editData.title}
                      onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('noteTitle')}
                    />

                    <Textarea
                      value={editData.content}
                      onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder={t('noteContentPlaceholder')}
                      className="flex-1 min-h-[300px]"
                    />

                    {/* Tags */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('tags')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editData.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm flex items-center space-x-1"
                          >
                            <span>{tag}</span>
                            <button
                              onClick={() => handleEditRemoveTag(tag)}
                              className="hover:text-primary-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <Input
                        placeholder={t('addTagPlaceholder')}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleEditAddTag(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {selectedNote.content}
                      </div>
                    </div>

                    {selectedNote.tags && selectedNote.tags.length > 0 && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('tags')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedNote.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>{t('selectNoteToView')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 