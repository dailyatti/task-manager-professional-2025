import type { Task, TaskCollection, TaskStats, Subtask, Priority, TaskData } from '../types';

export function generateUniqueId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createNewTask(text: string, time?: string): Task {
  return {
    id: generateUniqueId('task'),
    text,
    time: time || '',
    completed: false,
    color: '#ffffff',
    priority: 'low',
    subtasks: [],
    collapsed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createNewSubtask(text: string): Subtask {
  return {
    id: generateUniqueId('subtask'),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function calculateTaskStats(tasks: Record<string, Task>): TaskStats {
  const taskList = Object.values(tasks);
  let totalTasks = 0;
  let completedTasks = 0;

  taskList.forEach(task => {
    totalTasks++;
    if (task.completed) completedTasks++;
    
    task.subtasks.forEach(subtask => {
      totalTasks++;
      if (subtask.completed) completedTasks++;
    });
  });

  return {
    total: totalTasks,
    completed: completedTasks,
    pending: totalTasks - completedTasks,
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
  };
}

export function calculateGlobalStats(taskData: TaskData): TaskStats {
  let total = 0;
  let completed = 0;

  // Year tasks
  const yearStats = calculateTaskStats(taskData.Year.tasks);
  total += yearStats.total;
  completed += yearStats.completed;

  // Month tasks
  Object.values(taskData.Month).forEach(monthData => {
    const monthStats = calculateTaskStats(monthData.tasks);
    total += monthStats.total;
    completed += monthStats.completed;
  });

  // Week tasks
  Object.values(taskData.Week).forEach(dayData => {
    const dayStats = calculateTaskStats(dayData.tasks);
    total += dayStats.total;
    completed += dayStats.completed;
  });

  // Day tasks
  const dayStats = calculateTaskStats(taskData.Day.tasks);
  total += dayStats.total;
  completed += dayStats.completed;

  return {
    total,
    completed,
    pending: total - completed,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
  };
}

export function convertTextToLinks(text: string): string {
  const urlRegex = /https?:\/\/[^\s]+|\b(?:www\.)\S+\.\w{2,}(?:\S*)\b/g;
  return text.replace(urlRegex, (url) => {
    const href = url.match(/^https?:\/\//) ? url : `http://${url}`;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-700 underline">${url}</a>`;
  });
}

export function parseTasksFromText(text: string): Array<{ text: string; time?: string }> {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  return lines.map(line => {
    const timeMatch = line.match(/(\d{1,2}:\d{2})/);
    const time = timeMatch ? timeMatch[0] : undefined;
    const taskText = line.replace(/(\d{1,2}:\d{2})/, '').trim();
    
    return { text: taskText, time };
  });
}

export function addTaskToCollection(collection: TaskCollection, text: string, priority: Priority = 'medium'): TaskCollection {
  if (!text.trim()) return collection;
  
  const newTask: Task = {
    id: Math.random().toString(36).substr(2, 9),
    text: text.trim(),
    completed: false,
    priority,
    subtasks: [],
    collapsed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    ...collection,
    tasks: {
      ...collection.tasks,
      [newTask.id]: newTask,
    },
  };
}

export function createSubtask(text: string): Subtask {
  return {
    id: Math.random().toString(36).substr(2, 9),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function getTaskStats(tasks: Record<string, Task>): TaskStats {
  const taskArray = Object.values(tasks);
  const total = taskArray.length;
  const completed = taskArray.filter(task => task.completed).length;
  
  return {
    total,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function getMonthTaskStats(monthData: Record<string, TaskCollection>): TaskStats {
  let total = 0;
  let completed = 0;
  
  Object.values(monthData).forEach(collection => {
    const stats = getTaskStats(collection.tasks);
    total += stats.total;
    completed += stats.completed;
  });
  
  return {
    total,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function getWeekTaskStats(weekData: Record<string, TaskCollection>): TaskStats {
  let total = 0;
  let completed = 0;
  
  Object.values(weekData).forEach(collection => {
    const stats = getTaskStats(collection.tasks);
    total += stats.total;
    completed += stats.completed;
  });
  
  return {
    total,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function parseTasks(text: string): Array<{ text: string; time?: string }> {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  
  return lines.map(line => {
    const timeMatch = line.match(/(\d{1,2}:\d{2})/);
    const time = timeMatch ? timeMatch[1] : undefined;
    const text = line.replace(/(\d{1,2}:\d{2})/, '').trim();
    
    return { text, time };
  });
}

export function createTask(text: string, priority: Priority = 'medium'): Task {
  return {
    id: Math.random().toString(36).substr(2, 9),
    text: text.trim(),
    completed: false,
    priority,
    subtasks: [],
    collapsed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}