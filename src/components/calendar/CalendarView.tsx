import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Clock, AlertCircle, Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { useTranslation } from '../../utils/translations';
import type { Task, TaskData, Priority } from '../../types';
import { Clock as ClockComponent } from '../ui/Clock';

interface CalendarViewProps {
  taskData: TaskData;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  language: string;
  activeTab: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    task: Task;
    priority: Priority;
    completed: boolean;
    source: string;
  };
}

export function CalendarView({ taskData, onUpdateTask, onDeleteTask, onCreateTask, language, activeTab }: CalendarViewProps) {
  const { t } = useTranslation(language);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewFilter, setViewFilter] = useState<'all' | 'pending' | 'completed' | 'high-priority'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'Year' | 'Month' | 'Week' | 'Day'>('all');
  const [taskForm, setTaskForm] = useState({
    text: '',
    date: '',
    time: '',
    priority: 'medium' as Priority,
    notes: ''
  });

  const calendarRef = useRef<FullCalendar>(null);

  const getAllTasksAsEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();

    // Helper function to add tasks from a collection
    const addTasksFromCollection = (tasks: Record<string, Task>, source: string, defaultDate?: string) => {
      Object.entries(tasks).forEach(([taskId, task]) => {
        // Apply filters
        if (viewFilter === 'pending' && task.completed) return;
        if (viewFilter === 'completed' && !task.completed) return;
        if (viewFilter === 'high-priority' && task.priority !== 'high') return;
        
        if (sourceFilter !== 'all' && !source.startsWith(sourceFilter)) return;

        // Use default date or today
        const taskDate = defaultDate || today.toISOString().split('T')[0];
        
        const startDateTime = task.time ? `${taskDate}T${task.time}` : taskDate;
        const endDateTime = task.time ? 
          `${taskDate}T${addHourToTime(task.time)}` : 
          undefined;
        
        events.push({
          id: taskId,
          title: task.text,
          start: startDateTime,
          end: endDateTime,
          allDay: !task.time,
          backgroundColor: getPriorityColor(task.priority),
          borderColor: getPriorityColor(task.priority),
          textColor: '#ffffff',
          extendedProps: {
            task,
            priority: task.priority,
            completed: task.completed,
            source
          }
        });
      });
    };

    // Add Year tasks (spread throughout the year)
    const yearStart = new Date(currentYear, 0, 1);
    const yearTasks = Object.keys(taskData.Year.tasks);
    yearTasks.forEach((taskId, index) => {
      const daysToAdd = Math.floor((365 / yearTasks.length) * index);
      const taskDate = new Date(yearStart);
      taskDate.setDate(taskDate.getDate() + daysToAdd);
      const dateStr = taskDate.toISOString().split('T')[0];
      addTasksFromCollection({ [taskId]: taskData.Year.tasks[taskId] }, 'Year', dateStr);
    });

    // Add Day tasks (use today as default date)
    addTasksFromCollection(taskData.Day.tasks, 'Day', today.toISOString().split('T')[0]);

    // Add Month tasks (distribute across the month)
    Object.entries(taskData.Month).forEach(([monthName, monthData]) => {
      const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthName);
      if (monthIndex !== -1 && monthData.tasks) {
        const monthTasks = Object.keys(monthData.tasks);
        monthTasks.forEach((taskId, index) => {
          const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
          const dayOfMonth = Math.floor((daysInMonth / monthTasks.length) * index) + 1;
          const monthDate = new Date(currentYear, monthIndex, dayOfMonth).toISOString().split('T')[0];
          addTasksFromCollection({ [taskId]: monthData.tasks[taskId] }, `Month-${monthName}`, monthDate);
        });
      }
    });

    // Add Week tasks (distribute across the current week)
    Object.entries(taskData.Week).forEach(([dayName, dayData]) => {
      const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(dayName);
      if (dayIndex !== -1 && dayData.tasks) {
        const currentDate = new Date();
        const currentDay = currentDate.getDay();
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
        const targetDate = new Date(currentDate);
        targetDate.setDate(currentDate.getDate() + mondayOffset + dayIndex);
        const dayDate = targetDate.toISOString().split('T')[0];
        addTasksFromCollection(dayData.tasks, `Week-${dayName}`, dayDate);
      }
    });

    return events;
  };

  const addHourToTime = (time: string): string => {
    const parts = time.split(':');
    if (parts.length !== 2) return time;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return time;
    const newHours = (hours + 1) % 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const findTaskById = (taskId: string): { task: Task; source: string } | null => {
    // Search through all task collections
    const collections = [
      { tasks: taskData.Year.tasks, source: 'Year' },
      { tasks: taskData.Day.tasks, source: 'Day' },
      ...Object.entries(taskData.Month).map(([month, data]) => ({ tasks: data.tasks, source: `Month-${month}` })),
      ...Object.entries(taskData.Week).map(([day, data]) => ({ tasks: data.tasks, source: `Week-${day}` }))
    ];

    for (const collection of collections) {
      if (collection.tasks[taskId]) {
        return { task: collection.tasks[taskId], source: collection.source };
      }
    }
    return null;
  };

  const handleEventClick = (info: any) => {
    const event = info.event;
    const calendarEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.start.toISOString(),
      end: event.end?.toISOString(),
      allDay: event.allDay,
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      textColor: event.textColor,
      extendedProps: event.extendedProps
    };
    
    setSelectedEvent(calendarEvent);
    setTaskForm({
      text: calendarEvent.extendedProps.task.text,
      date: calendarEvent.start.split('T')[0],
      time: calendarEvent.extendedProps.task.time || '',
      priority: calendarEvent.extendedProps.task.priority,
      notes: calendarEvent.extendedProps.task.notes || ''
    });
    setShowTaskModal(true);
  };

  const handleDateClick = (info: any) => {
    setTaskForm({
      text: '',
      date: info.dateStr,
      time: info.date.getHours() > 0 ? 
        `${info.date.getHours().toString().padStart(2, '0')}:${info.date.getMinutes().toString().padStart(2, '0')}` : 
        '',
      priority: 'medium',
      notes: ''
    });
    setShowCreateModal(true);
  };

  const handleEventDrop = (info: any) => {
    const taskResult = findTaskById(info.event.id);
    if (taskResult) {
      const newDate = info.event.start;
      const newTime = info.event.allDay ? '' : newDate.toTimeString().slice(0, 5);
      
      onUpdateTask(taskResult.task.id, {
        time: newTime,
        updatedAt: new Date()
      });
    }
  };

  const handleEventResize = (info: any) => {
    // Handle event duration changes
    const taskResult = findTaskById(info.event.id);
    if (taskResult && info.event.end) {
      const startTime = info.event.start.toTimeString().slice(0, 5);
      const endTime = info.event.end.toTimeString().slice(0, 5);
      
      onUpdateTask(taskResult.task.id, {
        time: startTime,
        notes: `${taskResult.task.notes || ''}\nDuration: ${startTime} - ${endTime}`.trim(),
        updatedAt: new Date()
      });
    }
  };

  const handleTaskUpdate = () => {
    if (selectedEvent) {
      onUpdateTask(selectedEvent.id, {
        text: taskForm.text,
        time: taskForm.time,
        priority: taskForm.priority,
        notes: taskForm.notes,
        updatedAt: new Date()
      });
      setShowTaskModal(false);
      setSelectedEvent(null);
    }
  };

  const handleTaskCreate = () => {
    if (taskForm.text.trim()) {
      onCreateTask({
        text: taskForm.text.trim(),
        time: taskForm.time,
        completed: false,
        priority: taskForm.priority,
        subtasks: [],
        collapsed: true,
        color: '#ffffff',
        notes: taskForm.notes
      });
      setShowCreateModal(false);
      setTaskForm({
        text: '',
        date: '',
        time: '',
        priority: 'medium',
        notes: ''
      });
    }
  };

  const handleTaskDelete = () => {
    if (selectedEvent && confirm(t('confirmDelete'))) {
      onDeleteTask(selectedEvent.id);
      setShowTaskModal(false);
      setSelectedEvent(null);
    }
  };

  const handleTaskComplete = () => {
    if (selectedEvent) {
      onUpdateTask(selectedEvent.id, {
        completed: !selectedEvent.extendedProps.completed,
        updatedAt: new Date()
      });
      setShowTaskModal(false);
      setSelectedEvent(null);
    }
  };

  const getPriorityColor = (priority: Priority): string => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#3b82f6'
    };
    return colors[priority] || '#6b7280';
  };

  const goToToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
    }
  };

  const changeView = (viewName: string) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(viewName);
    }
  };

  const events = getAllTasksAsEvents();
  const stats = {
    total: events.length,
    completed: events.filter(e => e.extendedProps.completed).length,
    highPriority: events.filter(e => e.extendedProps.priority === 'high').length,
    pending: events.filter(e => !e.extendedProps.completed).length
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('professionalCalendar')}</h2>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={goToToday}>
            {t('today')}
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('addTask')}
          </Button>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Stats Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalEvents')}</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('completed')}</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('pending')}</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('highPriority')}</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.highPriority}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('filter')}:</span>
            </div>
            
            <select
              value={viewFilter}
              onChange={(e) => setViewFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{t('filterAll')}</option>
              <option value="pending">{t('filterPending')}</option>
              <option value="completed">{t('filterCompleted')}</option>
              <option value="high-priority">{t('filterHighPriority')}</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{t('filterAll')} {t('events')}</option>
              <option value="Year">{t('year')} {t('events')}</option>
              <option value="Month">{t('month')} {t('events')}</option>
              <option value="Week">{t('week')} {t('events')}</option>
              <option value="Day">{t('day')} {t('events')}</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => changeView('dayGridMonth')}>
              {t('monthView')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => changeView('timeGridWeek')}>
              {t('weekView')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => changeView('timeGridDay')}>
              {t('dayView')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => changeView('listWeek')}>
              {t('listView')}
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Component */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 calendar-container">
        <style>{`
          .calendar-container .fc {
            font-family: inherit;
          }
          .dark .calendar-container .fc-theme-standard td,
          .dark .calendar-container .fc-theme-standard th {
            border-color: #374151;
          }
          .dark .calendar-container .fc-theme-standard .fc-scrollgrid {
            border-color: #374151;
          }
          .dark .calendar-container .fc-col-header-cell {
            background-color: #1f2937;
            color: #f3f4f6;
          }
          .dark .calendar-container .fc-day {
            background-color: #111827;
            color: #f3f4f6;
          }
          .dark .calendar-container .fc-day-today {
            background-color: #1f2937 !important;
          }
          .dark .calendar-container .fc-button {
            background-color: #4b5563;
            border-color: #4b5563;
            color: #f3f4f6;
          }
          .dark .calendar-container .fc-button:hover {
            background-color: #6b7280;
            border-color: #6b7280;
          }
          .dark .calendar-container .fc-button-active {
            background-color: #7c3aed !important;
            border-color: #7c3aed !important;
          }
          .dark .calendar-container .fc-toolbar-title {
            color: #f3f4f6;
          }
          .dark .calendar-container .fc-daygrid-day-number {
            color: #f3f4f6;
          }
          .dark .calendar-container .fc-timegrid-slot-label {
            color: #9ca3af;
          }
          .dark .calendar-container .fc-more-link {
            color: #a78bfa;
          }
          .calendar-container .fc-event {
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .calendar-container .fc-event:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .calendar-container .fc-daygrid-day {
            cursor: pointer;
          }
          .calendar-container .fc-daygrid-day:hover {
            background-color: #f3f4f6;
          }
          .dark .calendar-container .fc-daygrid-day:hover {
            background-color: #1f2937;
          }
        `}</style>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          events={events}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          dateClick={handleDateClick}
          selectable={true}
          selectMirror={true}
          editable={true}
          droppable={true}
          resizable={true}
          height="auto"
          buttonText={{
            today: t('today'),
            month: t('monthView'),
            week: t('weekView'),
            day: t('dayView'),
            list: t('listView')
          }}
          eventDisplay="block"
          dayMaxEvents={3}
          moreLinkClick="popover"
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:30:00"
          snapDuration="00:15:00"
          eventDidMount={(info) => {
            if (info.event.extendedProps.completed) {
              info.el.style.opacity = '0.6';
              info.el.style.textDecoration = 'line-through';
            }
            
            // Add tooltip
            info.el.title = `${info.event.title}\n${t('priority')}: ${info.event.extendedProps.priority}\n${t('event')}: ${info.event.extendedProps.source}`;
          }}
          eventMouseEnter={(info) => {
            info.el.style.transform = 'scale(1.02)';
            info.el.style.zIndex = '1000';
            info.el.style.transition = 'transform 0.2s ease';
          }}
          eventMouseLeave={(info) => {
            info.el.style.transform = 'scale(1)';
            info.el.style.zIndex = 'auto';
          }}
        />
      </div>

      {/* Task Edit Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={t('editTask')}
      >
        <div className="space-y-4">
          <Input
            label={t('taskText')}
            value={taskForm.text}
            onChange={(e) => setTaskForm({ ...taskForm, text: e.target.value })}
            placeholder={t('enterTask')}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('date')}
              type="date"
              value={taskForm.date}
              onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
            />
            <Input
              label={t('time')}
              type="time"
              value={taskForm.time}
              onChange={(e) => setTaskForm({ ...taskForm, time: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('priority')}
            </label>
            <select
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as Priority })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-ring"
            >
              <option value="low">{t('priorityLow')}</option>
              <option value="medium">{t('priorityMedium')}</option>
              <option value="high">{t('priorityHigh')}</option>
            </select>
          </div>
          
          <Textarea
            label={t('notes')}
            value={taskForm.notes}
            onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
            placeholder={t('enterNote')}
            className="min-h-[80px]"
          />
          
          <div className="flex justify-between pt-4">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleTaskComplete}
                className={selectedEvent?.extendedProps.completed ? 'bg-green-50 text-green-700' : ''}
              >
                {selectedEvent?.extendedProps.completed ? t('taskPending') : t('taskCompleted')}
              </Button>
              <Button variant="danger" onClick={handleTaskDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                {t('delete')}
              </Button>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowTaskModal(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleTaskUpdate}>
                <Edit className="w-4 h-4 mr-2" />
                {t('update')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Task Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('newTask')}
      >
        <div className="space-y-4">
          <Input
            label={t('taskText')}
            value={taskForm.text}
            onChange={(e) => setTaskForm({ ...taskForm, text: e.target.value })}
            placeholder={t('enterTask')}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('date')}
              type="date"
              value={taskForm.date}
              onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
            />
            <Input
              label={t('time')}
              type="time"
              value={taskForm.time}
              onChange={(e) => setTaskForm({ ...taskForm, time: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('priority')}
            </label>
            <select
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as Priority })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-ring"
            >
              <option value="low">{t('priorityLow')}</option>
              <option value="medium">{t('priorityMedium')}</option>
              <option value="high">{t('priorityHigh')}</option>
            </select>
          </div>
          
          <Textarea
            label={t('notes')}
            value={taskForm.notes}
            onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
            placeholder={t('enterNote')}
            className="min-h-[80px]"
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleTaskCreate} disabled={!taskForm.text.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              {t('create')}
            </Button>
          </div>
        </div>
      </Modal>

      {activeTab === 'Day' && (
        <ClockComponent language={language} />
      )}
    </motion.div>
  );
}