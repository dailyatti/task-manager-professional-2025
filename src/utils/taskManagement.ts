import type { TaskData, Task, AIConfig } from '../types';

export interface TaskDeletionResult {
  success: boolean;
  deletedCount: number;
  errors: string[];
  deletedFrom: string[];
}

export interface APIValidationResult {
  isValid: boolean;
  error?: string;
  model?: string;
  provider?: string;
}

interface CalendarIntegration {
  deleteEvent: (eventId: string) => Promise<void>;
}

/**
 * Comprehensive task deletion system with cross-component integration
 */
export class TaskManagementSystem {
  private taskData: TaskData;
  private setTaskData: (data: TaskData | ((prev: TaskData) => TaskData)) => void;
  private calendarIntegration?: CalendarIntegration;
  
  constructor(
    taskData: TaskData, 
    setTaskData: (data: TaskData | ((prev: TaskData) => TaskData)) => void,
    calendarIntegration?: CalendarIntegration
  ) {
    this.taskData = taskData;
    this.setTaskData = setTaskData;
    this.calendarIntegration = calendarIntegration;
  }

  /**
   * Delete a single task with full integration across all components
   */
  async deleteTask(taskId: string, fromCategory?: string, fromSubcategory?: string): Promise<TaskDeletionResult> {
    const result: TaskDeletionResult = {
      success: false,
      deletedCount: 0,
      errors: [],
      deletedFrom: []
    };

    try {
      let taskToDelete: Task | null = null;
      let foundInCategory = '';
      let foundInSubcategory = '';

      // Find the task across all categories
      if (fromCategory && fromSubcategory) {
        // Specific location provided
        const location = this.getTaskLocation(fromCategory, fromSubcategory);
        if (location && location.tasks[taskId]) {
          taskToDelete = location.tasks[taskId] || null;
          foundInCategory = fromCategory;
          foundInSubcategory = fromSubcategory;
        }
      } else {
        // Search across all categories
        const searchResult = this.findTaskGlobally(taskId);
        if (searchResult) {
          taskToDelete = searchResult.task;
          foundInCategory = searchResult.category;
          foundInSubcategory = searchResult.subcategory;
        }
      }

      if (!taskToDelete) {
        result.errors.push(`Task with ID ${taskId} not found`);
        return result;
      }

      // Delete from Google Calendar if integrated
      if (this.calendarIntegration && taskToDelete.googleEventId) {
        try {
          await this.calendarIntegration.deleteEvent(taskToDelete.googleEventId);
        } catch (error) {
          result.errors.push(`Failed to delete from Google Calendar: ${error}`);
        }
      }

      // Delete from task data
      this.setTaskData(prev => {
        const newData = { ...prev };
        const location = this.getTaskLocationFromData(newData, foundInCategory, foundInSubcategory);
        
        if (location && location.tasks[taskId]) {
          delete location.tasks[taskId];
          result.deletedCount++;
          result.deletedFrom.push(`${foundInCategory}${foundInSubcategory ? ` > ${foundInSubcategory}` : ''}`);
        }

        return newData;
      });

      result.success = true;
      
    } catch (error) {
      result.errors.push(`Unexpected error during deletion: ${error}`);
    }

    return result;
  }

  /**
   * Delete multiple tasks at once
   */
  async deleteMultipleTasks(taskIds: string[]): Promise<TaskDeletionResult> {
    const result: TaskDeletionResult = {
      success: true,
      deletedCount: 0,
      errors: [],
      deletedFrom: []
    };

    for (const taskId of taskIds) {
      const singleResult = await this.deleteTask(taskId);
      result.deletedCount += singleResult.deletedCount;
      result.errors.push(...singleResult.errors);
      result.deletedFrom.push(...singleResult.deletedFrom);
      
      if (!singleResult.success) {
        result.success = false;
      }
    }

    return result;
  }

  /**
   * Delete all tasks from a specific category/subcategory
   */
  async deleteAllTasksFromCategory(category: string, subcategory?: string): Promise<TaskDeletionResult> {
    const result: TaskDeletionResult = {
      success: false,
      deletedCount: 0,
      errors: [],
      deletedFrom: []
    };

    try {
      const location = this.getTaskLocation(category, subcategory);
      if (!location) {
        result.errors.push(`Category ${category}${subcategory ? ` > ${subcategory}` : ''} not found`);
        return result;
      }

      const taskIds = Object.keys(location.tasks);
      if (taskIds.length === 0) {
        result.success = true;
        return result;
      }

      // Delete from Google Calendar
      for (const taskId of taskIds) {
        const task = location.tasks[taskId];
        if (this.calendarIntegration && task && task.googleEventId) {
          try {
            await this.calendarIntegration.deleteEvent(task.googleEventId);
          } catch (error) {
            result.errors.push(`Failed to delete task ${taskId} from Google Calendar: ${error}`);
          }
        }
      }

      // Clear all tasks from the category
      this.setTaskData(prev => {
        const newData = { ...prev };
        const targetLocation = this.getTaskLocationFromData(newData, category, subcategory);
        
        if (targetLocation) {
          targetLocation.tasks = {};
          result.deletedCount = taskIds.length;
          result.deletedFrom.push(`${category}${subcategory ? ` > ${subcategory}` : ''}`);
        }

        return newData;
      });

      result.success = true;
      
    } catch (error) {
      result.errors.push(`Unexpected error during category deletion: ${error}`);
    }

    return result;
  }

  /**
   * Delete all tasks across all categories (nuclear option)
   */
  async deleteAllTasks(): Promise<TaskDeletionResult> {
    const result: TaskDeletionResult = {
      success: false,
      deletedCount: 0,
      errors: [],
      deletedFrom: []
    };

    try {
      let totalCount = 0;

      // Count all tasks first
      const allTasks = this.getAllTasks();
      totalCount = allTasks.length;

      if (totalCount === 0) {
        result.success = true;
        return result;
      }

      // Delete from Google Calendar
      for (const { task } of allTasks) {
        if (this.calendarIntegration && task.googleEventId) {
          try {
            await this.calendarIntegration.deleteEvent(task.googleEventId);
          } catch (error) {
            result.errors.push(`Failed to delete task ${task.id} from Google Calendar: ${error}`);
          }
        }
      }

      // Clear all tasks
      this.setTaskData(prev => ({
        ...prev,
        Year: { ...prev.Year, tasks: {} },
        Month: {
          January: { ...prev.Month.January, tasks: {} },
          February: { ...prev.Month.February, tasks: {} },
          March: { ...prev.Month.March, tasks: {} },
          April: { ...prev.Month.April, tasks: {} },
          May: { ...prev.Month.May, tasks: {} },
          June: { ...prev.Month.June, tasks: {} },
          July: { ...prev.Month.July, tasks: {} },
          August: { ...prev.Month.August, tasks: {} },
          September: { ...prev.Month.September, tasks: {} },
          October: { ...prev.Month.October, tasks: {} },
          November: { ...prev.Month.November, tasks: {} },
          December: { ...prev.Month.December, tasks: {} },
        },
        Week: {
          Monday: { ...prev.Week.Monday, tasks: {} },
          Tuesday: { ...prev.Week.Tuesday, tasks: {} },
          Wednesday: { ...prev.Week.Wednesday, tasks: {} },
          Thursday: { ...prev.Week.Thursday, tasks: {} },
          Friday: { ...prev.Week.Friday, tasks: {} },
          Saturday: { ...prev.Week.Saturday, tasks: {} },
          Sunday: { ...prev.Week.Sunday, tasks: {} },
        },
        Day: { ...prev.Day, tasks: {} },
      }));

      result.success = true;
      result.deletedCount = totalCount;
      result.deletedFrom = ['Year', 'Month', 'Week', 'Day'];
      
    } catch (error) {
      result.errors.push(`Unexpected error during global deletion: ${error}`);
    }

    return result;
  }

  /**
   * Find a task across all categories
   */
  private findTaskGlobally(taskId: string): { task: Task; category: string; subcategory: string } | null {
    // Search in Year
    if (this.taskData.Year.tasks[taskId]) {
      return {
        task: this.taskData.Year.tasks[taskId],
        category: 'Year',
        subcategory: ''
      };
    }

    // Search in Day
    if (this.taskData.Day.tasks[taskId]) {
      return {
        task: this.taskData.Day.tasks[taskId],
        category: 'Day',
        subcategory: ''
      };
    }

    // Search in Month
    for (const [month, data] of Object.entries(this.taskData.Month)) {
      if (data.tasks[taskId]) {
        return {
          task: data.tasks[taskId],
          category: 'Month',
          subcategory: month
        };
      }
    }

    // Search in Week
    for (const [day, data] of Object.entries(this.taskData.Week)) {
      if (data.tasks[taskId]) {
        return {
          task: data.tasks[taskId],
          category: 'Week',
          subcategory: day
        };
      }
    }

    return null;
  }

  /**
   * Get task location reference
   */
  private getTaskLocation(category: string, subcategory?: string) {
    if (category === 'Year') {
      return this.taskData.Year;
    } else if (category === 'Day') {
      return this.taskData.Day;
    } else if (category === 'Month' && subcategory) {
      return this.taskData.Month[subcategory as keyof typeof this.taskData.Month];
    } else if (category === 'Week' && subcategory) {
      return this.taskData.Week[subcategory as keyof typeof this.taskData.Week];
    }
    return null;
  }

  /**
   * Get task location reference from data object (for updates)
   */
  private getTaskLocationFromData(data: TaskData, category: string, subcategory?: string) {
    if (category === 'Year') {
      return data.Year;
    } else if (category === 'Day') {
      return data.Day;
    } else if (category === 'Month' && subcategory) {
      return data.Month[subcategory as keyof typeof data.Month];
    } else if (category === 'Week' && subcategory) {
      return data.Week[subcategory as keyof typeof data.Week];
    }
    return null;
  }

  /**
   * Get all tasks across all categories
   */
  private getAllTasks(): { task: Task; category: string; subcategory: string }[] {
    const allTasks: { task: Task; category: string; subcategory: string }[] = [];

    // Year tasks
    Object.values(this.taskData.Year.tasks).forEach(task => {
      allTasks.push({ task, category: 'Year', subcategory: '' });
    });

    // Day tasks
    Object.values(this.taskData.Day.tasks).forEach(task => {
      allTasks.push({ task, category: 'Day', subcategory: '' });
    });

    // Month tasks
    Object.entries(this.taskData.Month).forEach(([month, data]) => {
      Object.values(data.tasks).forEach(task => {
        allTasks.push({ task, category: 'Month', subcategory: month });
      });
    });

    // Week tasks
    Object.entries(this.taskData.Week).forEach(([day, data]) => {
      Object.values(data.tasks).forEach(task => {
        allTasks.push({ task, category: 'Week', subcategory: day });
      });
    });

    return allTasks;
  }
}

/**
 * Advanced API validation with detailed feedback
 */
export async function validateAPIConfiguration(config: AIConfig): Promise<APIValidationResult> {
  if (!config.apiKey) {
    return {
      isValid: false,
      error: 'API key is required'
    };
  }

  if (config.apiKey.length < 20) {
    return {
      isValid: false,
      error: 'API key appears to be too short'
    };
  }

  if (!config.apiKey.startsWith('sk-')) {
    return {
      isValid: false,
      error: 'OpenAI API key should start with "sk-"'
    };
  }

  try {
    // Test API connection with a minimal request
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      return {
        isValid: false,
        error: 'Invalid API key - authentication failed'
      };
    }

    if (response.status === 403) {
      return {
        isValid: false,
        error: 'API key does not have required permissions'
      };
    }

    if (response.status === 429) {
      return {
        isValid: false,
        error: 'Rate limit exceeded - please try again later'
      };
    }

    if (!response.ok) {
      return {
        isValid: false,
        error: `API error: ${response.status} ${response.statusText}`
      };
    }

    const data = await response.json();
    
    // Check if the specified model is available
    const modelExists = data.data?.some((model: { id: string }) => model.id === config.model);
    
    return {
      isValid: true,
      model: config.model,
      provider: config.provider,
      ...(modelExists ? {} : { error: `Model ${config.model} may not be available` })
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generate professional feedback message for users
 */
export function generateFeedbackMessage(
  operation: 'delete' | 'validate' | 'create' | 'update',
  result: TaskDeletionResult | APIValidationResult | { success: boolean; message?: string },
  language: string = 'en'
): string {
  const messages = {
    en: {
      deleteSuccess: (count: number, from: string[]) => 
        `✅ Successfully deleted ${count} task${count === 1 ? '' : 's'} from: ${from.join(', ')}`,
      deleteError: (errors: string[]) => 
        `❌ Deletion failed: ${errors.join('; ')}`,
      validateSuccess: (model?: string) => 
        `✅ API configuration is valid${model ? ` (Model: ${model})` : ''}`,
      validateError: (error: string) => 
        `❌ API validation failed: ${error}`,
      operationSuccess: (message?: string) => 
        `✅ Operation completed successfully${message ? `: ${message}` : ''}`,
      operationError: (message?: string) => 
        `❌ Operation failed${message ? `: ${message}` : ''}`
    },
    hu: {
      deleteSuccess: (count: number, from: string[]) => 
        `✅ Sikeresen törölve ${count} feladat innen: ${from.join(', ')}`,
      deleteError: (errors: string[]) => 
        `❌ Törlés sikertelen: ${errors.join('; ')}`,
      validateSuccess: (model?: string) => 
        `✅ API konfiguráció érvényes${model ? ` (Modell: ${model})` : ''}`,
      validateError: (error: string) => 
        `❌ API validáció sikertelen: ${error}`,
      operationSuccess: (message?: string) => 
        `✅ Művelet sikeresen befejezve${message ? `: ${message}` : ''}`,
      operationError: (message?: string) => 
        `❌ Művelet sikertelen${message ? `: ${message}` : ''}`
    }
  };

  const lang = language.startsWith('hu') ? 'hu' : 'en';
  const msg = messages[lang];

  switch (operation) {
    case 'delete': {
      const deleteResult = result as TaskDeletionResult;
      return deleteResult.success 
        ? msg.deleteSuccess(deleteResult.deletedCount, deleteResult.deletedFrom)
        : msg.deleteError(deleteResult.errors);
    }
    
    case 'validate': {
      const validateResult = result as APIValidationResult;
      return validateResult.isValid 
        ? msg.validateSuccess(validateResult.model)
        : msg.validateError(validateResult.error || 'Unknown error');
    }
    
    default: {
      const genericResult = result as { success: boolean; message?: string };
      return genericResult.success 
        ? msg.operationSuccess(genericResult.message)
        : msg.operationError(genericResult.message);
    }
  }
} 