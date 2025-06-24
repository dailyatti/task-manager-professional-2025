export interface LanguageConfig {
  code: string;
  name: string;
  translations: {
    // Common UI elements
    newTask: string;
    addTask: string;
    editTask: string;
    deleteTask: string;
    taskDetails: string;
    priority: string;
    date: string;
    time: string;
    notes: string;
    save: string;
    cancel: string;
    
    // Priority levels
    low: string;
    medium: string;
    high: string;
    
    // Time periods
    year: string;
    month: string;
    week: string;
    day: string;
    today: string;
    
    // AI related
    aiAssistant: string;
    generateTasks: string;
    generateSubtasks: string;
    aiThinking: string;
    
    // Calendar
    calendar: string;
    addToCalendar: string;
    
    // Settings
    settings: string;
    theme: string;
    lightMode: string;
    darkMode: string;
    
    // Months
    months: string[];
    
    // Days of week
    weekdays: string[];
  };
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    translations: {
      newTask: 'New Task',
      addTask: 'Add Task',
      editTask: 'Edit Task',
      deleteTask: 'Delete Task',
      taskDetails: 'Task Details',
      priority: 'Priority',
      date: 'Date',
      time: 'Time',
      notes: 'Notes',
      save: 'Save',
      cancel: 'Cancel',
      
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      
      year: 'Year',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      today: 'Today',
      
      aiAssistant: 'AI Assistant',
      generateTasks: 'Generate Tasks',
      generateSubtasks: 'Generate Subtasks',
      aiThinking: 'AI is thinking...',
      
      calendar: 'Calendar',
      addToCalendar: 'Add to Calendar',
      
      settings: 'Settings',
      theme: 'Theme',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      
      weekdays: [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ]
    }
  },
  
  hu: {
    code: 'hu',
    name: 'Magyar',
    translations: {
      newTask: 'Új Feladat',
      addTask: 'Feladat Hozzáadása',
      editTask: 'Feladat Szerkesztése',
      deleteTask: 'Feladat Törlése',
      taskDetails: 'Feladat Részletei',
      priority: 'Prioritás',
      date: 'Dátum',
      time: 'Időpont',
      notes: 'Jegyzetek',
      save: 'Mentés',
      cancel: 'Mégse',
      
      low: 'Alacsony',
      medium: 'Közepes',
      high: 'Magas',
      
      year: 'Év',
      month: 'Hónap',
      week: 'Hét',
      day: 'Nap',
      today: 'Ma',
      
      aiAssistant: 'AI Asszisztens',
      generateTasks: 'Feladatok Generálása',
      generateSubtasks: 'Alfeladatok Generálása',
      aiThinking: 'AI gondolkodik...',
      
      calendar: 'Naptár',
      addToCalendar: 'Hozzáadás a Naptárhoz',
      
      settings: 'Beállítások',
      theme: 'Téma',
      lightMode: 'Világos Mód',
      darkMode: 'Sötét Mód',
      
      months: [
        'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
        'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
      ],
      
      weekdays: [
        'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'
      ]
    }
  },
  
  de: {
    code: 'de',
    name: 'Deutsch',
    translations: {
      newTask: 'Neue Aufgabe',
      addTask: 'Aufgabe Hinzufügen',
      editTask: 'Aufgabe Bearbeiten',
      deleteTask: 'Aufgabe Löschen',
      taskDetails: 'Aufgaben Details',
      priority: 'Priorität',
      date: 'Datum',
      time: 'Zeit',
      notes: 'Notizen',
      save: 'Speichern',
      cancel: 'Abbrechen',
      
      low: 'Niedrig',
      medium: 'Mittel',
      high: 'Hoch',
      
      year: 'Jahr',
      month: 'Monat',
      week: 'Woche',
      day: 'Tag',
      today: 'Heute',
      
      aiAssistant: 'KI-Assistent',
      generateTasks: 'Aufgaben Generieren',
      generateSubtasks: 'Unteraufgaben Generieren',
      aiThinking: 'KI denkt nach...',
      
      calendar: 'Kalender',
      addToCalendar: 'Zum Kalender Hinzufügen',
      
      settings: 'Einstellungen',
      theme: 'Design',
      lightMode: 'Heller Modus',
      darkMode: 'Dunkler Modus',
      
      months: [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
      ],
      
      weekdays: [
        'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'
      ]
    }
  },

  // Adding 20 most common languages
  es: {
    code: 'es',
    name: 'Español',
    translations: {
      newTask: 'Nueva Tarea',
      addTask: 'Agregar Tarea',
      editTask: 'Editar Tarea',
      deleteTask: 'Eliminar Tarea',
      taskDetails: 'Detalles de la Tarea',
      priority: 'Prioridad',
      date: 'Fecha',
      time: 'Hora',
      notes: 'Notas',
      save: 'Guardar',
      cancel: 'Cancelar',
      
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      
      year: 'Año',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      today: 'Hoy',
      
      aiAssistant: 'Asistente IA',
      generateTasks: 'Generar Tareas',
      generateSubtasks: 'Generar Subtareas',
      aiThinking: 'IA está pensando...',
      
      calendar: 'Calendario',
      addToCalendar: 'Agregar al Calendario',
      
      settings: 'Configuración',
      theme: 'Tema',
      lightMode: 'Modo Claro',
      darkMode: 'Modo Oscuro',
      
      months: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ],
      
      weekdays: [
        'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
      ]
    }
  },

  fr: {
    code: 'fr',
    name: 'Français',
    translations: {
      newTask: 'Nouvelle Tâche',
      addTask: 'Ajouter une Tâche',
      editTask: 'Modifier la Tâche',
      deleteTask: 'Supprimer la Tâche',
      taskDetails: 'Détails de la Tâche',
      priority: 'Priorité',
      date: 'Date',
      time: 'Heure',
      notes: 'Notes',
      save: 'Enregistrer',
      cancel: 'Annuler',
      
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      
      year: 'Année',
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour',
      today: 'Aujourd\'hui',
      
      aiAssistant: 'Assistant IA',
      generateTasks: 'Générer des Tâches',
      generateSubtasks: 'Générer des Sous-tâches',
      aiThinking: 'L\'IA réfléchit...',
      
      calendar: 'Calendrier',
      addToCalendar: 'Ajouter au Calendrier',
      
      settings: 'Paramètres',
      theme: 'Thème',
      lightMode: 'Mode Clair',
      darkMode: 'Mode Sombre',
      
      months: [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ],
      
      weekdays: [
        'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
      ]
    }
  },

  it: {
    code: 'it',
    name: 'Italiano',
    translations: {
      newTask: 'Nuova Attività',
      addTask: 'Aggiungi Attività',
      editTask: 'Modifica Attività',
      deleteTask: 'Elimina Attività',
      taskDetails: 'Dettagli Attività',
      priority: 'Priorità',
      date: 'Data',
      time: 'Ora',
      notes: 'Note',
      save: 'Salva',
      cancel: 'Annulla',
      
      low: 'Bassa',
      medium: 'Media',
      high: 'Alta',
      
      year: 'Anno',
      month: 'Mese',
      week: 'Settimana',
      day: 'Giorno',
      today: 'Oggi',
      
      aiAssistant: 'Assistente IA',
      generateTasks: 'Genera Attività',
      generateSubtasks: 'Genera Sotto-attività',
      aiThinking: 'L\'IA sta pensando...',
      
      calendar: 'Calendario',
      addToCalendar: 'Aggiungi al Calendario',
      
      settings: 'Impostazioni',
      theme: 'Tema',
      lightMode: 'Modalità Chiara',
      darkMode: 'Modalità Scura',
      
      months: [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
      ],
      
      weekdays: [
        'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'
      ]
    }
  },

  pt: {
    code: 'pt',
    name: 'Português',
    translations: {
      newTask: 'Nova Tarefa',
      addTask: 'Adicionar Tarefa',
      editTask: 'Editar Tarefa',
      deleteTask: 'Excluir Tarefa',
      taskDetails: 'Detalhes da Tarefa',
      priority: 'Prioridade',
      date: 'Data',
      time: 'Hora',
      notes: 'Notas',
      save: 'Salvar',
      cancel: 'Cancelar',
      
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      
      year: 'Ano',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia',
      today: 'Hoje',
      
      aiAssistant: 'Assistente IA',
      generateTasks: 'Gerar Tarefas',
      generateSubtasks: 'Gerar Subtarefas',
      aiThinking: 'IA está pensando...',
      
      calendar: 'Calendário',
      addToCalendar: 'Adicionar ao Calendário',
      
      settings: 'Configurações',
      theme: 'Tema',
      lightMode: 'Modo Claro',
      darkMode: 'Modo Escuro',
      
      months: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ],
      
      weekdays: [
        'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'
      ]
    }
  },

  ru: {
    code: 'ru',
    name: 'Русский',
    translations: {
      newTask: 'Новая Задача',
      addTask: 'Добавить Задачу',
      editTask: 'Редактировать Задачу',
      deleteTask: 'Удалить Задачу',
      taskDetails: 'Детали Задачи',
      priority: 'Приоритет',
      date: 'Дата',
      time: 'Время',
      notes: 'Заметки',
      save: 'Сохранить',
      cancel: 'Отмена',
      
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий',
      
      year: 'Год',
      month: 'Месяц',
      week: 'Неделя',
      day: 'День',
      today: 'Сегодня',
      
      aiAssistant: 'ИИ Помощник',
      generateTasks: 'Генерировать Задачи',
      generateSubtasks: 'Генерировать Подзадачи',
      aiThinking: 'ИИ думает...',
      
      calendar: 'Календарь',
      addToCalendar: 'Добавить в Календарь',
      
      settings: 'Настройки',
      theme: 'Тема',
      lightMode: 'Светлый Режим',
      darkMode: 'Тёмный Режим',
      
      months: [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ],
      
      weekdays: [
        'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'
      ]
    }
  },

  zh: {
    code: 'zh',
    name: '中文',
    translations: {
      newTask: '新任务',
      addTask: '添加任务',
      editTask: '编辑任务',
      deleteTask: '删除任务',
      taskDetails: '任务详情',
      priority: '优先级',
      date: '日期',
      time: '时间',
      notes: '备注',
      save: '保存',
      cancel: '取消',
      
      low: '低',
      medium: '中',
      high: '高',
      
      year: '年',
      month: '月',
      week: '周',
      day: '日',
      today: '今天',
      
      aiAssistant: 'AI助手',
      generateTasks: '生成任务',
      generateSubtasks: '生成子任务',
      aiThinking: 'AI正在思考...',
      
      calendar: '日历',
      addToCalendar: '添加到日历',
      
      settings: '设置',
      theme: '主题',
      lightMode: '浅色模式',
      darkMode: '深色模式',
      
      months: [
        '一月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '十一月', '十二月'
      ],
      
      weekdays: [
        '周一', '周二', '周三', '周四', '周五', '周六', '周日'
      ]
    }
  },

  ja: {
    code: 'ja',
    name: '日本語',
    translations: {
      newTask: '新しいタスク',
      addTask: 'タスクを追加',
      editTask: 'タスクを編集',
      deleteTask: 'タスクを削除',
      taskDetails: 'タスクの詳細',
      priority: '優先度',
      date: '日付',
      time: '時間',
      notes: 'メモ',
      save: '保存',
      cancel: 'キャンセル',
      
      low: '低',
      medium: '中',
      high: '高',
      
      year: '年',
      month: '月',
      week: '週',
      day: '日',
      today: '今日',
      
      aiAssistant: 'AIアシスタント',
      generateTasks: 'タスクを生成',
      generateSubtasks: 'サブタスクを生成',
      aiThinking: 'AIが考えています...',
      
      calendar: 'カレンダー',
      addToCalendar: 'カレンダーに追加',
      
      settings: '設定',
      theme: 'テーマ',
      lightMode: 'ライトモード',
      darkMode: 'ダークモード',
      
      months: [
        '1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'
      ],
      
      weekdays: [
        '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'
      ]
    }
  },

  ko: {
    code: 'ko',
    name: '한국어',
    translations: {
      newTask: '새 작업',
      addTask: '작업 추가',
      editTask: '작업 편집',
      deleteTask: '작업 삭제',
      taskDetails: '작업 세부사항',
      priority: '우선순위',
      date: '날짜',
      time: '시간',
      notes: '메모',
      save: '저장',
      cancel: '취소',
      
      low: '낮음',
      medium: '보통',
      high: '높음',
      
      year: '년',
      month: '월',
      week: '주',
      day: '일',
      today: '오늘',
      
      aiAssistant: 'AI 어시스턴트',
      generateTasks: '작업 생성',
      generateSubtasks: '하위 작업 생성',
      aiThinking: 'AI가 생각하고 있습니다...',
      
      calendar: '달력',
      addToCalendar: '달력에 추가',
      
      settings: '설정',
      theme: '테마',
      lightMode: '라이트 모드',
      darkMode: '다크 모드',
      
      months: [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
      ],
      
      weekdays: [
        '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'
      ]
    }
  },

  ar: {
    code: 'ar',
    name: 'العربية',
    translations: {
      newTask: 'مهمة جديدة',
      addTask: 'إضافة مهمة',
      editTask: 'تعديل المهمة',
      deleteTask: 'حذف المهمة',
      taskDetails: 'تفاصيل المهمة',
      priority: 'الأولوية',
      date: 'التاريخ',
      time: 'الوقت',
      notes: 'ملاحظات',
      save: 'حفظ',
      cancel: 'إلغاء',
      
      low: 'منخفض',
      medium: 'متوسط',
      high: 'عالي',
      
      year: 'سنة',
      month: 'شهر',
      week: 'أسبوع',
      day: 'يوم',
      today: 'اليوم',
      
      aiAssistant: 'مساعد الذكاء الاصطناعي',
      generateTasks: 'إنشاء المهام',
      generateSubtasks: 'إنشاء المهام الفرعية',
      aiThinking: 'الذكاء الاصطناعي يفكر...',
      
      calendar: 'التقويم',
      addToCalendar: 'إضافة إلى التقويم',
      
      settings: 'الإعدادات',
      theme: 'المظهر',
      lightMode: 'الوضع الفاتح',
      darkMode: 'الوضع المظلم',
      
      months: [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ],
      
      weekdays: [
        'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'
      ]
    }
  },

  hi: {
    code: 'hi',
    name: 'हिन्दी',
    translations: {
      newTask: 'नया कार्य',
      addTask: 'कार्य जोड़ें',
      editTask: 'कार्य संपादित करें',
      deleteTask: 'कार्य हटाएं',
      taskDetails: 'कार्य विवरण',
      priority: 'प्राथमिकता',
      date: 'दिनांक',
      time: 'समय',
      notes: 'नोट्स',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      
      low: 'कम',
      medium: 'मध्यम',
      high: 'उच्च',
      
      year: 'वर्ष',
      month: 'महीना',
      week: 'सप्ताह',
      day: 'दिन',
      today: 'आज',
      
      aiAssistant: 'AI सहायक',
      generateTasks: 'कार्य उत्पन्न करें',
      generateSubtasks: 'उप-कार्य उत्पन्न करें',
      aiThinking: 'AI सोच रहा है...',
      
      calendar: 'कैलेंडर',
      addToCalendar: 'कैलेंडर में जोड़ें',
      
      settings: 'सेटिंग्स',
      theme: 'थीम',
      lightMode: 'लाइट मोड',
      darkMode: 'डार्क मोड',
      
      months: [
        'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
        'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
      ],
      
      weekdays: [
        'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार', 'रविवार'
      ]
    }
  },

  tr: {
    code: 'tr',
    name: 'Türkçe',
    translations: {
      newTask: 'Yeni Görev',
      addTask: 'Görev Ekle',
      editTask: 'Görevi Düzenle',
      deleteTask: 'Görevi Sil',
      taskDetails: 'Görev Detayları',
      priority: 'Öncelik',
      date: 'Tarih',
      time: 'Saat',
      notes: 'Notlar',
      save: 'Kaydet',
      cancel: 'İptal',
      
      low: 'Düşük',
      medium: 'Orta',
      high: 'Yüksek',
      
      year: 'Yıl',
      month: 'Ay',
      week: 'Hafta',
      day: 'Gün',
      today: 'Bugün',
      
      aiAssistant: 'AI Asistan',
      generateTasks: 'Görev Oluştur',
      generateSubtasks: 'Alt Görev Oluştur',
      aiThinking: 'AI düşünüyor...',
      
      calendar: 'Takvim',
      addToCalendar: 'Takvime Ekle',
      
      settings: 'Ayarlar',
      theme: 'Tema',
      lightMode: 'Açık Mod',
      darkMode: 'Koyu Mod',
      
      months: [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ],
      
      weekdays: [
        'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'
      ]
    }
  },

  pl: {
    code: 'pl',
    name: 'Polski',
    translations: {
      newTask: 'Nowe Zadanie',
      addTask: 'Dodaj Zadanie',
      editTask: 'Edytuj Zadanie',
      deleteTask: 'Usuń Zadanie',
      taskDetails: 'Szczegóły Zadania',
      priority: 'Priorytet',
      date: 'Data',
      time: 'Czas',
      notes: 'Notatki',
      save: 'Zapisz',
      cancel: 'Anuluj',
      
      low: 'Niski',
      medium: 'Średni',
      high: 'Wysoki',
      
      year: 'Rok',
      month: 'Miesiąc',
      week: 'Tydzień',
      day: 'Dzień',
      today: 'Dzisiaj',
      
      aiAssistant: 'Asystent AI',
      generateTasks: 'Generuj Zadania',
      generateSubtasks: 'Generuj Podzadania',
      aiThinking: 'AI myśli...',
      
      calendar: 'Kalendarz',
      addToCalendar: 'Dodaj do Kalendarza',
      
      settings: 'Ustawienia',
      theme: 'Motyw',
      lightMode: 'Tryb Jasny',
      darkMode: 'Tryb Ciemny',
      
      months: [
        'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
      ],
      
      weekdays: [
        'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'
      ]
    }
  },

  nl: {
    code: 'nl',
    name: 'Nederlands',
    translations: {
      newTask: 'Nieuwe Taak',
      addTask: 'Taak Toevoegen',
      editTask: 'Taak Bewerken',
      deleteTask: 'Taak Verwijderen',
      taskDetails: 'Taak Details',
      priority: 'Prioriteit',
      date: 'Datum',
      time: 'Tijd',
      notes: 'Notities',
      save: 'Opslaan',
      cancel: 'Annuleren',
      
      low: 'Laag',
      medium: 'Gemiddeld',
      high: 'Hoog',
      
      year: 'Jaar',
      month: 'Maand',
      week: 'Week',
      day: 'Dag',
      today: 'Vandaag',
      
      aiAssistant: 'AI Assistent',
      generateTasks: 'Taken Genereren',
      generateSubtasks: 'Subtaken Genereren',
      aiThinking: 'AI denkt na...',
      
      calendar: 'Kalender',
      addToCalendar: 'Toevoegen aan Kalender',
      
      settings: 'Instellingen',
      theme: 'Thema',
      lightMode: 'Lichte Modus',
      darkMode: 'Donkere Modus',
      
      months: [
        'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
        'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
      ],
      
      weekdays: [
        'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'
      ]
    }
  },

  sv: {
    code: 'sv',
    name: 'Svenska',
    translations: {
      newTask: 'Ny Uppgift',
      addTask: 'Lägg till Uppgift',
      editTask: 'Redigera Uppgift',
      deleteTask: 'Ta bort Uppgift',
      taskDetails: 'Uppgiftsdetaljer',
      priority: 'Prioritet',
      date: 'Datum',
      time: 'Tid',
      notes: 'Anteckningar',
      save: 'Spara',
      cancel: 'Avbryt',
      
      low: 'Låg',
      medium: 'Medium',
      high: 'Hög',
      
      year: 'År',
      month: 'Månad',
      week: 'Vecka',
      day: 'Dag',
      today: 'Idag',
      
      aiAssistant: 'AI Assistent',
      generateTasks: 'Generera Uppgifter',
      generateSubtasks: 'Generera Deluppgifter',
      aiThinking: 'AI tänker...',
      
      calendar: 'Kalender',
      addToCalendar: 'Lägg till i Kalender',
      
      settings: 'Inställningar',
      theme: 'Tema',
      lightMode: 'Ljust Läge',
      darkMode: 'Mörkt Läge',
      
      months: [
        'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
        'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
      ],
      
      weekdays: [
        'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'
      ]
    }
  },

  no: {
    code: 'no',
    name: 'Norsk',
    translations: {
      newTask: 'Ny Oppgave',
      addTask: 'Legg til Oppgave',
      editTask: 'Rediger Oppgave',
      deleteTask: 'Slett Oppgave',
      taskDetails: 'Oppgavedetaljer',
      priority: 'Prioritet',
      date: 'Dato',
      time: 'Tid',
      notes: 'Notater',
      save: 'Lagre',
      cancel: 'Avbryt',
      
      low: 'Lav',
      medium: 'Medium',
      high: 'Høy',
      
      year: 'År',
      month: 'Måned',
      week: 'Uke',
      day: 'Dag',
      today: 'I dag',
      
      aiAssistant: 'AI Assistent',
      generateTasks: 'Generer Oppgaver',
      generateSubtasks: 'Generer Deloppgaver',
      aiThinking: 'AI tenker...',
      
      calendar: 'Kalender',
      addToCalendar: 'Legg til i Kalender',
      
      settings: 'Innstillinger',
      theme: 'Tema',
      lightMode: 'Lys Modus',
      darkMode: 'Mørk Modus',
      
      months: [
        'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
      ],
      
      weekdays: [
        'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'
      ]
    }
  },

  da: {
    code: 'da',
    name: 'Dansk',
    translations: {
      newTask: 'Ny Opgave',
      addTask: 'Tilføj Opgave',
      editTask: 'Rediger Opgave',
      deleteTask: 'Slet Opgave',
      taskDetails: 'Opgavedetaljer',
      priority: 'Prioritet',
      date: 'Dato',
      time: 'Tid',
      notes: 'Noter',
      save: 'Gem',
      cancel: 'Annuller',
      
      low: 'Lav',
      medium: 'Medium',
      high: 'Høj',
      
      year: 'År',
      month: 'Måned',
      week: 'Uge',
      day: 'Dag',
      today: 'I dag',
      
      aiAssistant: 'AI Assistent',
      generateTasks: 'Generer Opgaver',
      generateSubtasks: 'Generer Delopgaver',
      aiThinking: 'AI tænker...',
      
      calendar: 'Kalender',
      addToCalendar: 'Tilføj til Kalender',
      
      settings: 'Indstillinger',
      theme: 'Tema',
      lightMode: 'Lys Tilstand',
      darkMode: 'Mørk Tilstand',
      
      months: [
        'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'December'
      ],
      
      weekdays: [
        'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'
      ]
    }
  },

  fi: {
    code: 'fi',
    name: 'Suomi',
    translations: {
      newTask: 'Uusi Tehtävä',
      addTask: 'Lisää Tehtävä',
      editTask: 'Muokkaa Tehtävää',
      deleteTask: 'Poista Tehtävä',
      taskDetails: 'Tehtävän Tiedot',
      priority: 'Prioriteetti',
      date: 'Päivämäärä',
      time: 'Aika',
      notes: 'Muistiinpanot',
      save: 'Tallenna',
      cancel: 'Peruuta',
      
      low: 'Matala',
      medium: 'Keskitaso',
      high: 'Korkea',
      
      year: 'Vuosi',
      month: 'Kuukausi',
      week: 'Viikko',
      day: 'Päivä',
      today: 'Tänään',
      
      aiAssistant: 'AI Avustaja',
      generateTasks: 'Luo Tehtäviä',
      generateSubtasks: 'Luo Alitehtäviä',
      aiThinking: 'AI ajattelee...',
      
      calendar: 'Kalenteri',
      addToCalendar: 'Lisää Kalenteriin',
      
      settings: 'Asetukset',
      theme: 'Teema',
      lightMode: 'Vaalea Tila',
      darkMode: 'Tumma Tila',
      
      months: [
        'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
        'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'
      ],
      
      weekdays: [
        'Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai', 'Sunnuntai'
      ]
    }
  },

  cs: {
    code: 'cs',
    name: 'Čeština',
    translations: {
      newTask: 'Nový Úkol',
      addTask: 'Přidat Úkol',
      editTask: 'Upravit Úkol',
      deleteTask: 'Smazat Úkol',
      taskDetails: 'Detaily Úkolu',
      priority: 'Priorita',
      date: 'Datum',
      time: 'Čas',
      notes: 'Poznámky',
      save: 'Uložit',
      cancel: 'Zrušit',
      
      low: 'Nízká',
      medium: 'Střední',
      high: 'Vysoká',
      
      year: 'Rok',
      month: 'Měsíc',
      week: 'Týden',
      day: 'Den',
      today: 'Dnes',
      
      aiAssistant: 'AI Asistent',
      generateTasks: 'Generovat Úkoly',
      generateSubtasks: 'Generovat Podúkoly',
      aiThinking: 'AI přemýšlí...',
      
      calendar: 'Kalendář',
      addToCalendar: 'Přidat do Kalendáře',
      
      settings: 'Nastavení',
      theme: 'Téma',
      lightMode: 'Světlý Režim',
      darkMode: 'Tmavý Režim',
      
      months: [
        'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
        'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
      ],
      
      weekdays: [
        'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'
      ]
    }
  },

  sk: {
    code: 'sk',
    name: 'Slovenčina',
    translations: {
      newTask: 'Nová Úloha',
      addTask: 'Pridať Úlohu',
      editTask: 'Upraviť Úlohu',
      deleteTask: 'Zmazať Úlohu',
      taskDetails: 'Detaily Úlohy',
      priority: 'Priorita',
      date: 'Dátum',
      time: 'Čas',
      notes: 'Poznámky',
      save: 'Uložiť',
      cancel: 'Zrušiť',
      
      low: 'Nízka',
      medium: 'Stredná',
      high: 'Vysoká',
      
      year: 'Rok',
      month: 'Mesiac',
      week: 'Týždeň',
      day: 'Deň',
      today: 'Dnes',
      
      aiAssistant: 'AI Asistent',
      generateTasks: 'Generovať Úlohy',
      generateSubtasks: 'Generovať Podúlohy',
      aiThinking: 'AI premýšľa...',
      
      calendar: 'Kalendár',
      addToCalendar: 'Pridať do Kalendára',
      
      settings: 'Nastavenia',
      theme: 'Téma',
      lightMode: 'Svetlý Režim',
      darkMode: 'Tmavý Režim',
      
      months: [
        'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
        'Júl', 'August', 'September', 'Október', 'November', 'December'
      ],
      
      weekdays: [
        'Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota', 'Nedeľa'
      ]
    }
  },

  ro: {
    code: 'ro',
    name: 'Română',
    translations: {
      newTask: 'Sarcină Nouă',
      addTask: 'Adaugă Sarcină',
      editTask: 'Editează Sarcina',
      deleteTask: 'Șterge Sarcina',
      taskDetails: 'Detalii Sarcină',
      priority: 'Prioritate',
      date: 'Data',
      time: 'Ora',
      notes: 'Notițe',
      save: 'Salvează',
      cancel: 'Anulează',
      
      low: 'Scăzută',
      medium: 'Medie',
      high: 'Înaltă',
      
      year: 'An',
      month: 'Lună',
      week: 'Săptămână',
      day: 'Zi',
      today: 'Astăzi',
      
      aiAssistant: 'Asistent AI',
      generateTasks: 'Generează Sarcini',
      generateSubtasks: 'Generează Subsarcini',
      aiThinking: 'AI se gândește...',
      
      calendar: 'Calendar',
      addToCalendar: 'Adaugă în Calendar',
      
      settings: 'Setări',
      theme: 'Temă',
      lightMode: 'Mod Luminos',
      darkMode: 'Mod Întunecat',
      
      months: [
        'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
        'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
      ],
      
      weekdays: [
        'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'
      ]
    }
  },

  // 🇪🇺 NEW: 5 Additional European Languages for European Market Focus

  bg: {
    code: 'bg',
    name: 'Български',
    translations: {
      newTask: 'Нова Задача',
      addTask: 'Добави Задача',
      editTask: 'Редактирай Задача',
      deleteTask: 'Изтрий Задача',
      taskDetails: 'Детайли на Задачата',
      priority: 'Приоритет',
      date: 'Дата',
      time: 'Час',
      notes: 'Бележки',
      save: 'Запази',
      cancel: 'Отказ',
      
      low: 'Нисък',
      medium: 'Среден',
      high: 'Висок',
      
      year: 'Година',
      month: 'Месец',
      week: 'Седмица',
      day: 'Ден',
      today: 'Днес',
      
      aiAssistant: 'AI Асистент',
      generateTasks: 'Генерирай Задачи',
      generateSubtasks: 'Генерирай Подзадачи',
      aiThinking: 'AI мисли...',
      
      calendar: 'Календар',
      addToCalendar: 'Добави в Календара',
      
      settings: 'Настройки',
      theme: 'Тема',
      lightMode: 'Светъл Режим',
      darkMode: 'Тъмен Режим',
      
      months: [
        'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
        'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
      ],
      
      weekdays: [
        'Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя'
      ]
    }
  },

  hr: {
    code: 'hr',
    name: 'Hrvatski',
    translations: {
      newTask: 'Novi Zadatak',
      addTask: 'Dodaj Zadatak',
      editTask: 'Uredi Zadatak',
      deleteTask: 'Obriši Zadatak',
      taskDetails: 'Detalji Zadatka',
      priority: 'Prioritet',
      date: 'Datum',
      time: 'Vrijeme',
      notes: 'Bilješke',
      save: 'Spremi',
      cancel: 'Odustani',
      
      low: 'Nizak',
      medium: 'Srednji',
      high: 'Visok',
      
      year: 'Godina',
      month: 'Mjesec',
      week: 'Tjedan',
      day: 'Dan',
      today: 'Danas',
      
      aiAssistant: 'AI Asistent',
      generateTasks: 'Generiraj Zadatke',
      generateSubtasks: 'Generiraj Podzadatke',
      aiThinking: 'AI razmišlja...',
      
      calendar: 'Kalendar',
      addToCalendar: 'Dodaj u Kalendar',
      
      settings: 'Postavke',
      theme: 'Tema',
      lightMode: 'Svijetli Način',
      darkMode: 'Tamni Način',
      
      months: [
        'Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj',
        'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'
      ],
      
      weekdays: [
        'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'
      ]
    }
  },

  sl: {
    code: 'sl',
    name: 'Slovenščina',
    translations: {
      newTask: 'Nova Naloga',
      addTask: 'Dodaj Nalogo',
      editTask: 'Uredi Nalogo',
      deleteTask: 'Izbriši Nalogo',
      taskDetails: 'Podrobnosti Naloge',
      priority: 'Prioriteta',
      date: 'Datum',
      time: 'Čas',
      notes: 'Opombe',
      save: 'Shrani',
      cancel: 'Prekliči',
      
      low: 'Nizka',
      medium: 'Srednja',
      high: 'Visoka',
      
      year: 'Leto',
      month: 'Mesec',
      week: 'Teden',
      day: 'Dan',
      today: 'Danes',
      
      aiAssistant: 'AI Pomočnik',
      generateTasks: 'Generiraj Naloge',
      generateSubtasks: 'Generiraj Podnaloge',
      aiThinking: 'AI razmišlja...',
      
      calendar: 'Koledar',
      addToCalendar: 'Dodaj v Koledar',
      
      settings: 'Nastavitve',
      theme: 'Tema',
      lightMode: 'Svetli Način',
      darkMode: 'Temni Način',
      
      months: [
        'Januar', 'Februar', 'Marec', 'April', 'Maj', 'Junij',
        'Julij', 'Avgust', 'September', 'Oktober', 'November', 'December'
      ],
      
      weekdays: [
        'Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota', 'Nedelja'
      ]
    }
  },

  et: {
    code: 'et',
    name: 'Eesti',
    translations: {
      newTask: 'Uus Ülesanne',
      addTask: 'Lisa Ülesanne',
      editTask: 'Muuda Ülesannet',
      deleteTask: 'Kustuta Ülesanne',
      taskDetails: 'Ülesande Üksikasjad',
      priority: 'Prioriteet',
      date: 'Kuupäev',
      time: 'Kellaaeg',
      notes: 'Märkmed',
      save: 'Salvesta',
      cancel: 'Tühista',
      
      low: 'Madal',
      medium: 'Keskmine',
      high: 'Kõrge',
      
      year: 'Aasta',
      month: 'Kuu',
      week: 'Nädal',
      day: 'Päev',
      today: 'Täna',
      
      aiAssistant: 'AI Assistent',
      generateTasks: 'Genereeri Ülesandeid',
      generateSubtasks: 'Genereeri Alamülesandeid',
      aiThinking: 'AI mõtleb...',
      
      calendar: 'Kalender',
      addToCalendar: 'Lisa Kalendrisse',
      
      settings: 'Seaded',
      theme: 'Teema',
      lightMode: 'Hele Režiim',
      darkMode: 'Tume Režiim',
      
      months: [
        'Jaanuar', 'Veebruar', 'Märts', 'Aprill', 'Mai', 'Juuni',
        'Juuli', 'August', 'September', 'Oktoober', 'November', 'Detsember'
      ],
      
      weekdays: [
        'Esmaspäev', 'Teisipäev', 'Kolmapäev', 'Neljapäev', 'Reede', 'Laupäev', 'Pühapäev'
      ]
    }
  },

  lv: {
    code: 'lv',
    name: 'Latviešu',
    translations: {
      newTask: 'Jauns Uzdevums',
      addTask: 'Pievienot Uzdevumu',
      editTask: 'Rediģēt Uzdevumu',
      deleteTask: 'Dzēst Uzdevumu',
      taskDetails: 'Uzdevuma Detaļas',
      priority: 'Prioritāte',
      date: 'Datums',
      time: 'Laiks',
      notes: 'Piezīmes',
      save: 'Saglabāt',
      cancel: 'Atcelt',
      
      low: 'Zema',
      medium: 'Vidēja',
      high: 'Augsta',
      
      year: 'Gads',
      month: 'Mēnesis',
      week: 'Nedēļa',
      day: 'Diena',
      today: 'Šodien',
      
      aiAssistant: 'AI Asistents',
      generateTasks: 'Ģenerēt Uzdevumus',
      generateSubtasks: 'Ģenerēt Apakšuzdevumus',
      aiThinking: 'AI domā...',
      
      calendar: 'Kalendārs',
      addToCalendar: 'Pievienot Kalendāram',
      
      settings: 'Iestatījumi',
      theme: 'Tēma',
      lightMode: 'Gaišais Režīms',
      darkMode: 'Tumšais Režīms',
      
      months: [
        'Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs',
        'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'
      ],
      
      weekdays: [
        'Pirmdiena', 'Otrdiena', 'Trešdiena', 'Ceturtdiena', 'Piektdiena', 'Sestdiena', 'Svētdiena'
      ]
    }
  }
};

export function detectUserLanguage(): string {
  // Try to detect language from browser settings
  const browserLang = navigator.language.split('-')[0];
  
  // Check if we support the detected language
  if (SUPPORTED_LANGUAGES[browserLang]) {
    return browserLang;
  }
  
  // Fallback to English
  return 'en';
}

export function getTranslation(key: string, language: string = 'en'): string {
  const langConfig = SUPPORTED_LANGUAGES[language];
  if (!langConfig) {
    return SUPPORTED_LANGUAGES.en.translations[key as keyof typeof SUPPORTED_LANGUAGES.en.translations] || key;
  }
  
  return langConfig.translations[key as keyof typeof langConfig.translations] || key;
}

export function getTranslations(language: string = 'en') {
  const langConfig = SUPPORTED_LANGUAGES[language];
  if (!langConfig) {
    return SUPPORTED_LANGUAGES.en.translations;
  }
  
  return langConfig.translations;
}

// Hook for using translations in components
export function useTranslation(language: string = 'en') {
  const t = (key: string) => getTranslation(key, language);
  const translations = getTranslations(language);
  
  return { t, translations };
}