export interface Task {
  id: string;
  text: string;
  time?: string;
  date?: string; // Specific date for the task (YYYY-MM-DD format)
  completed: boolean;
  color?: string;
  priority: Priority;
  subtasks: Subtask[];
  collapsed: boolean;
  createdAt: string;
  updatedAt: string;
  googleEventId?: string;
  notes?: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface Note {
  id:string;
  title: string;
  content: string;
  plan?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskCollection {
  text: string;
  tasks: Record<string, Task>;
}

export interface TaskData {
  Year: TaskCollection;
  Month: Record<string, TaskCollection>;
  Week: Record<string, TaskCollection>;
  Day: TaskCollection;
  Notes: Record<string, Note>;
}

export type TabType = 'Year' | 'Month' | 'Week' | 'Day' | 'Notes' | 'Calendar' | 'AI Chat';

export interface TranslationKeys {
  appTitle: string;
  appSubtitle: string;
  year: string;
  month: string;
  week: string;
  day: string;
  notes: string;
  calendar: string;
  chat: string;
  settings: string;
  newTask: string;
  addTask: string;
  editTask: string;
  deleteTask: string;
  taskDetails: string;
  taskText: string;
  taskCompleted: string;
  taskPending: string;
  priority: string;
  priorityLow: string;
  priorityMedium: string;
  priorityHigh: string;
  date: string;
  time: string;
  today: string;
  yesterday: string;
  tomorrow: string;
  thisWeek: string;
  thisMonth: string;
  thisYear: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  update: string;
  confirm: string;
  close: string;
  back: string;
  next: string;
  previous: string;
  aiAssistant: string;
  aiChat: string;
  generateTasks: string;
  generateTasksWithAI: string;
  generateSubtasks: string;
  generateSubtasksWithAI: string;
  generatePlan: string;
  aiThinking: string;
  aiError: string;
  aiNotConfigured: string;
  aiConfigurePrompt: string;
  smartCreation: string;
  aiAssistantActive: string;
  addToCalendar: string;
  calendarView: string;
  monthView: string;
  weekView: string;
  dayView: string;
  listView: string;
  eventDetails: string;
  professionalCalendar: string;
  totalEvents: string;
  completed: string;
  pending: string;
  highPriority: string;
  theme: string;
  lightMode: string;
  darkMode: string;
  language: string;
  apiKey: string;
  provider: string;
  configuration: string;
  configureAiProviders: string;
  exportData: string;
  importData: string;
  clearData: string;
  backup: string;
  restore: string;
  noteTitle: string;
  noteContent: string;
  createNote: string;
  editNote: string;
  deleteNote: string;
  subtasks: string;
  addSubtask: string;
  addSubtaskPlaceholder: string;
  loading: string;
  saving: string;
  saved: string;
  error: string;
  success: string;
  warning: string;
  unexpectedError: string;
  confirmDelete: string;
  confirmClear: string;
  unsavedChanges: string;
  totalTasks: string;
  completedTasks: string;
  pendingTasks: string;
  completionRate: string;
  enterTask: string;
  enterNote: string;
  searchPlaceholder: string;
  months: string[];
  weekdays: string[];
  googleCalendar: string;
  syncWithGoogle: string;
  calendarSync: string;
  synced: string;
  chatWelcome: string;
  chatPlaceholder: string;
  sendMessage: string;
  clearChat: string;
  exportChat: string;
  filter: string;
  filterAll: string;
  filterCompleted: string;
  filterPending: string;
  filterHighPriority: string;
  importMode: string;
  mergeMode: string;
  replaceMode: string;
  appendMode: string;
  events: string;
  event: string;
  allDay: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  reminder: string;
  repeat: string;
  search: string;
  sort: string;
  view: string;
  options: string;
  help: string;
  about: string;
  version: string;
  online: string;
  offline: string;
  syncing: string;
  am: string;
  pm: string;
  duplicate: string;
  archive: string;
  share: string;
  print: string;
  required: string;
  invalid: string;
  tooShort: string;
  tooLong: string;
  plans: string;
  yearlyPlans: string;
  monthlyPlans: string;
  weeklyPlans: string;
  dailyPlans: string;
  planning: string;
  dropFileHere: string;
  tasksDetected: string;
  taskDetected: string;
  yearlyPlansPlaceholder: string;
  monthlyPlansPlaceholder: string;
  weeklyPlansPlaceholder: string;
  dailyPlansPlaceholder: string;
  noTasksYet: string;
  createFirstTask: string;
  noNotesYet: string;
  selectNoteToView: string;

  // Notes specific
  noContent: string;
  tags: string;
  addTagPlaceholder: string;
  noteContentRequiredForPlan: string;
  noteContentRequiredForPlanTooltip: string;
  aiGeneratedPlanPlaceholder: string;
  lastUpdated: string;
  add: string;
  saveChanges: string;
  generatePlanWithAI: string;

  // Google Calendar Panel & Integration
  googleCalendarIntegration: string;
  syncTasksWithGoogle: string;
  enableGoogleCalendarSync?: string;
  googleApiInitializing: string;
  signInWithGoogle: string;
  signOutFromGoogle: string;
  signedInToGoogle: string;
  saveCalendarId: string;
  connectedToGoogleCalendar: string;
  notConnectedToGoogleCalendar: string;
  setupGuide: string;
  showSetupStepsShort: string;
  importantNote: string;
  googleEnvVarsReminder: string;
  setupGuideDetailsPoint1: string;
  setupGuideDetailsPoint2: string;
  setupGuideDetailsPoint3: string;
  setupGuideDetailsPoint4: string;
  setupGuideDetailsPoint5: string;
  goToGoogleCloudConsole: string;
  createOrSelectProject: string;
  enableGoogleCalendarAPI: string;
  enableGoogleCalendarAPIDesc: string;
  importantGCalAPINote: string;
  createCredentials: string;
  createCredentialsDesc: string;
  apiKeyCredential: string;
  oauthCredential: string;
  configureAPIKey: string;
  configureAPIKeyDesc: string;
  importantAPIKeyRestriction: string;
  addDomainToOAuth: string;
  addDomainToOAuthDesc: string;
  googleAPIKeyLabel: string;
  googleClientIDLabel: string;
  googleAPIKeyPlaceholder: string;
  googleClientIDPlaceholder: string;
  calendarIdLabel: string;
  calendarIdPlaceholder: string;
  calendarIdHelper: string;
  connectButton: string;
  disconnectButton: string;
  googleConnectError: string;
  googleSignInError: string;
  googleAPIInitError: string;
  googleGenericError: string;
  googleConnectSuccess: string;
  googleDisconnectSuccess: string;

  // API Key validation messages
  "error.apiKeyMissing": string;
  "success.apiKeyValid": string;
  "error.apiKeyInvalidGeneric": string;
  "error.apiKeyUnauthorized": string;
  "error.apiKeyForbidden": string;
  "error.apiKeyValidationFailed": string;
  "error.gemini.apiKeyInvalidOrProject": string;
  "error.gemini.apiNotEnabledOrPerms": string;
  "error.ollama.noValidationEndpoint": string;
  "success.ollama.connectionActive": string;
  "error.ollama.connectionFailed": string;
  "error.ollama.connectionFailedGeneric": string;
  "info.grok.cannotValidate": string;
  "error.unknownProvider": string;
  "error.mustValidateToEnable": string;
  "success.aiConfigSavedEnabled": string;
  "success.aiConfigSavedDisabled": string;
  "success.aiDisabled": string;
  enterApiKeyFor: string;
  hideApiKey: string;
  showApiKey: string;
  validateKey: string;
  validateOllamaConnection: string;
  model: string;
  aiAssistantActiveFor: string;
  aiAssistantNotActiveOrNotValidated: string;
  saveAndEnable: string;
  disableAI: string;
  deepseekOffPeakInfo: string;
}

// Helper type to get only keys that correspond to a string value
type KeysOfValue<T, TCondition> = {
  [K in keyof T]: T[K] extends TCondition ? K : never;
}[keyof T];

// Type for keys that point to a string, excluding those that point to string[]
export type StringTranslationKey = KeysOfValue<TranslationKeys, string>;

export type Theme = 'light' | 'dark';

export interface TaskStats {
  total: number;
  completed: number;
  completionRate: number;
}

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'ollama' | 'deepseek' | 'grok' | 'perplexity';
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enabled: boolean;
}

export interface GoogleCalendarConfig {
  clientId?: string;
  apiKey?: string;
  calendarId?: string;
  accessToken?: string;
  connected?: boolean;
  enabled: boolean;
}

export interface ImportOptions {
  mode: 'merge' | 'replace' | 'append';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
}