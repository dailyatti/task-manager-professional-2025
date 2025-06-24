import type { Task, Priority, TaskData } from '../types';

export function detectLanguageFromText(text: string): 'hu' | 'en' {
  // Hungarian language indicators
  const hungarianWords = [
    'és', 'vagy', 'hogy', 'egy', 'ez', 'az', 'van', 'lesz', 'volt', 'lehet',
    'kell', 'szeretne', 'szeretnék', 'tudna', 'tudnék', 'hozz', 'létre',
    'készíts', 'tervezz', 'segíts', 'segítség', 'feladat', 'naptár',
    'időpont', 'holnap', 'ma', 'tegnap', 'hét', 'hónap', 'év', 'nap',
    'ütközés', 'szabad', 'foglalt', 'mikor', 'hogyan', 'miért', 'mit',
    'hol', 'ki', 'milyen', 'mennyi', 'melyik', 'optimalizálj', 'elemezd',
    'figyelmeztetés', 'ellenőrizd', 'javíts', 'módosíts', 'töröld', 'cseréld',
    'frissítsd', 'átírj', 'helyettesítsd', 'felülírj', 'tisztítsd', 'rendezd'
  ];

  // English language indicators
  const englishWords = [
    'and', 'or', 'that', 'a', 'an', 'the', 'is', 'are', 'was', 'were',
    'will', 'would', 'could', 'should', 'can', 'create', 'make', 'plan',
    'schedule', 'help', 'task', 'calendar', 'appointment', 'tomorrow',
    'today', 'yesterday', 'week', 'month', 'year', 'day', 'conflict',
    'free', 'busy', 'when', 'how', 'why', 'what', 'where', 'who',
    'which', 'how much', 'how many', 'optimize', 'analyze', 'warning',
    'check', 'improve', 'modify', 'delete', 'replace', 'update', 'rewrite',
    'substitute', 'overwrite', 'clear', 'organize'
  ];

  const lowerText = text.toLowerCase();
  
  let hungarianScore = 0;
  let englishScore = 0;

  // Count Hungarian words
  hungarianWords.forEach(word => {
    if (lowerText.includes(word)) {
      hungarianScore++;
    }
  });

  // Count English words
  englishWords.forEach(word => {
    if (lowerText.includes(word)) {
      englishScore++;
    }
  });

  // Check for Hungarian-specific characters
  if (/[áéíóöőúüű]/i.test(text)) {
    hungarianScore += 3;
  }

  // Check for Hungarian-specific patterns
  if (/(?:hoz|hez|höz|ban|ben|on|en|ön|ra|re|ról|ről|nak|nek|val|vel|tól|től|ig|ként|ul|ül)$/i.test(text)) {
    hungarianScore += 2;
  }

  return hungarianScore > englishScore ? 'hu' : 'en';
}

export function analyzeTaskContext(text: string, language: 'hu' | 'en') {
  const context = {
    intent: {
      taskCreation: false,
      taskModification: false,
      taskDeletion: false,
      taskReplacement: false,
      planOverwrite: false,
      dateQuery: false,
      conflictCheck: false,
      help: false,
      optimization: false,
      analysis: false,
      scheduling: false,
      prioritization: false,
      bulkOperations: false,
      clearAll: false
    },
    entities: {
      dates: [] as Array<{type: string, value: string, confidence: number}>,
      times: [] as Array<{type: string, value: string, confidence: number}>,
      priorities: [] as Array<{type: string, value: Priority, confidence: number}>,
      categories: [] as Array<{type: string, value: string, confidence: number}>,
      operations: [] as Array<{type: string, value: string, confidence: number}>
    },
    confidence: 0.5,
    permissions: {
      canCreate: true,
      canModify: true,
      canDelete: true,
      canOverwrite: true,
      canClearAll: true,
      canReplace: true
    }
  };

  const lowerText = text.toLowerCase();

  // Intent detection with AI permissions
  if (language === 'hu') {
    context.intent.taskCreation = /(?:hozz létre|készíts|tervezz|add hozzá|új feladat)/i.test(text);
    context.intent.taskModification = /(?:módosíts|változtass|frissítsd|javíts|átírj)/i.test(text);
    context.intent.taskDeletion = /(?:töröld|távolítsd el|szüntesd meg|vedd ki)/i.test(text);
    context.intent.taskReplacement = /(?:cseréld|helyettesítsd|váltsd ki)/i.test(text);
    context.intent.planOverwrite = /(?:felülírj|írj át|cseréld le|helyettesítsd)/i.test(text);
    context.intent.dateQuery = /(?:mi van|mikor|időpont|naptár|program)/i.test(text);
    context.intent.conflictCheck = /(?:ütközés|konfliktus|szabad|foglalt|ellenőrizd)/i.test(text);
    context.intent.help = /(?:segítség|hogyan|használat|funkció|mit csinál)/i.test(text);
    context.intent.optimization = /(?:optimalizálj|javíts|hatékonyabb|produktív|rendezd)/i.test(text);
    context.intent.analysis = /(?:elemezd|értékelj|statisztika|összefoglaló)/i.test(text);
    context.intent.scheduling = /(?:ütemezd|időzítsd|beosztás|menetrend)/i.test(text);
    context.intent.prioritization = /(?:prioritás|fontosság|sürgős|rangsorolj)/i.test(text);
    context.intent.bulkOperations = /(?:összes|minden|mindent|tömeges|globális)/i.test(text);
    context.intent.clearAll = /(?:töröld mind|tisztítsd|ürítsd|kezdd újra)/i.test(text);
  } else {
    context.intent.taskCreation = /(?:create|make|add|new task|plan|schedule)/i.test(text);
    context.intent.taskModification = /(?:modify|change|update|edit|rewrite)/i.test(text);
    context.intent.taskDeletion = /(?:delete|remove|eliminate|take out)/i.test(text);
    context.intent.taskReplacement = /(?:replace|substitute|swap)/i.test(text);
    context.intent.planOverwrite = /(?:overwrite|rewrite|replace all)/i.test(text);
    context.intent.dateQuery = /(?:what's on|when|appointment|calendar|schedule)/i.test(text);
    context.intent.conflictCheck = /(?:conflict|clash|free|busy|check|available)/i.test(text);
    context.intent.help = /(?:help|how|usage|function|what does)/i.test(text);
    context.intent.optimization = /(?:optimize|improve|efficient|productive|organize)/i.test(text);
    context.intent.analysis = /(?:analyze|evaluate|statistics|summary)/i.test(text);
    context.intent.scheduling = /(?:schedule|time|arrange|organize)/i.test(text);
    context.intent.prioritization = /(?:priority|importance|urgent|rank)/i.test(text);
    context.intent.bulkOperations = /(?:all|everything|bulk|global|mass)/i.test(text);
    context.intent.clearAll = /(?:clear all|clean|empty|start over)/i.test(text);
  }

  // Operation entity extraction
  const operationPatterns = [
    { pattern: /töröld|delete/i, value: 'delete', confidence: 0.9 },
    { pattern: /módosíts|modify|edit/i, value: 'modify', confidence: 0.9 },
    { pattern: /felülírj|overwrite/i, value: 'overwrite', confidence: 0.95 },
    { pattern: /cseréld|replace/i, value: 'replace', confidence: 0.9 },
    { pattern: /frissítsd|update/i, value: 'update', confidence: 0.85 },
    { pattern: /tisztítsd|clear/i, value: 'clear', confidence: 0.9 },
    { pattern: /rendezd|organize/i, value: 'organize', confidence: 0.8 },
    { pattern: /optimalizálj|optimize/i, value: 'optimize', confidence: 0.85 }
  ];

  operationPatterns.forEach(({ pattern, value, confidence }) => {
    if (pattern.test(text)) {
      context.entities.operations.push({
        type: 'operation',
        value,
        confidence
      });
    }
  });

  // Date entity extraction
  const datePatterns = [
    // Relative dates
    { pattern: /holnap|tomorrow/i, value: getRelativeDate(1), confidence: 0.9 },
    { pattern: /ma|today/i, value: getRelativeDate(0), confidence: 0.95 },
    { pattern: /tegnap|yesterday/i, value: getRelativeDate(-1), confidence: 0.9 },
    { pattern: /jövő hét|next week/i, value: getRelativeDate(7), confidence: 0.8 },
    { pattern: /múlt hét|last week/i, value: getRelativeDate(-7), confidence: 0.8 },
    
    // Specific dates
    { pattern: /(\d{4})-(\d{1,2})-(\d{1,2})/, value: '', confidence: 0.95 },
    { pattern: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, value: '', confidence: 0.9 },
    { pattern: /(\d{1,2})\.(\d{1,2})\.(\d{4})/, value: '', confidence: 0.9 },
    
    // Weekdays
    { pattern: /hétfő|monday/i, value: getNextWeekday(1), confidence: 0.85 },
    { pattern: /kedd|tuesday/i, value: getNextWeekday(2), confidence: 0.85 },
    { pattern: /szerda|wednesday/i, value: getNextWeekday(3), confidence: 0.85 },
    { pattern: /csütörtök|thursday/i, value: getNextWeekday(4), confidence: 0.85 },
    { pattern: /péntek|friday/i, value: getNextWeekday(5), confidence: 0.85 },
    { pattern: /szombat|saturday/i, value: getNextWeekday(6), confidence: 0.85 },
    { pattern: /vasárnap|sunday/i, value: getNextWeekday(0), confidence: 0.85 }
  ];

  datePatterns.forEach(({ pattern, value, confidence }) => {
    const match = text.match(pattern);
    if (match) {
      let dateValue = value;
      if (match[1] && match[2] && match[3]) {
        // Extract actual date from regex groups
        dateValue = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
      }
      context.entities.dates.push({
        type: 'date',
        value: dateValue,
        confidence
      });
    }
  });

  // Time entity extraction
  const timePatterns = [
    { pattern: /(\d{1,2}):(\d{2})/, confidence: 0.95 },
    { pattern: /(\d{1,2})\s*(óra|hour|h)/i, confidence: 0.8 },
    { pattern: /(\d{1,2})\s*(de|du|am|pm)/i, confidence: 0.85 },
    { pattern: /délben|noon/i, value: '12:00', confidence: 0.9 },
    { pattern: /éjfél|midnight/i, value: '00:00', confidence: 0.9 },
    { pattern: /reggel|morning/i, value: '09:00', confidence: 0.7 },
    { pattern: /délután|afternoon/i, value: '14:00', confidence: 0.7 },
    { pattern: /este|evening/i, value: '18:00', confidence: 0.7 }
  ];

  timePatterns.forEach(({ pattern, value, confidence }) => {
    const match = text.match(pattern);
    if (match) {
      let timeValue = value || '';
      if (match[1] && match[2]) {
        timeValue = `${match[1].padStart(2, '0')}:${match[2]}`;
      } else if (match[1] && !match[2]) {
        timeValue = `${match[1].padStart(2, '0')}:00`;
      }
      
      if (timeValue) {
        context.entities.times.push({
          type: 'time',
          value: timeValue,
          confidence
        });
      }
    }
  });

  // Priority entity extraction
  if (language === 'hu') {
    if (/(?:sürgős|kritikus|fontos|magas prioritás)/i.test(text)) {
      context.entities.priorities.push({ type: 'priority', value: 'high', confidence: 0.9 });
    } else if (/(?:alacsony prioritás|később|nem sürgős)/i.test(text)) {
      context.entities.priorities.push({ type: 'priority', value: 'low', confidence: 0.8 });
    } else if (/(?:közepes|normál|átlagos)/i.test(text)) {
      context.entities.priorities.push({ type: 'priority', value: 'medium', confidence: 0.7 });
    }
  } else {
    if (/(?:urgent|critical|important|high priority)/i.test(text)) {
      context.entities.priorities.push({ type: 'priority', value: 'high', confidence: 0.9 });
    } else if (/(?:low priority|later|not urgent)/i.test(text)) {
      context.entities.priorities.push({ type: 'priority', value: 'low', confidence: 0.8 });
    } else if (/(?:medium|normal|average)/i.test(text)) {
      context.entities.priorities.push({ type: 'priority', value: 'medium', confidence: 0.7 });
    }
  }

  // Category entity extraction
  if (language === 'hu') {
    if (/(?:éves|évente|hosszú távú|stratégiai)/i.test(text)) {
      context.entities.categories.push({ type: 'category', value: 'Year', confidence: 0.9 });
    } else if (/(?:havi|havonta|hónap|projekt)/i.test(text)) {
      context.entities.categories.push({ type: 'category', value: 'Month', confidence: 0.85 });
    } else if (/(?:heti|hetente|hét|rutin)/i.test(text)) {
      context.entities.categories.push({ type: 'category', value: 'Week', confidence: 0.8 });
    } else if (/(?:napi|naponta|ma|holnap)/i.test(text)) {
      context.entities.categories.push({ type: 'category', value: 'Day', confidence: 0.75 });
    }
  } else {
    if (/(?:yearly|annual|long.term|strategic)/i.test(text)) {
      context.entities.categories.push({ type: 'category', value: 'Year', confidence: 0.9 });
    } else if (/(?:monthly|month|project)/i.test(text)) {
      context.entities.categories.push({ type: 'category', value: 'Month', confidence: 0.85 });
    } else if (/(?:weekly|week|routine)/i.test(text)) {
      context.entities.categories.push({ type: 'category', value: 'Week', confidence: 0.8 });
    } else if (/(?:daily|day|today|tomorrow)/i.test(text)) {
      context.entities.categories.push({ type: 'category', value: 'Day', confidence: 0.75 });
    }
  }

  // Calculate overall confidence
  const intentCount = Object.values(context.intent).filter(Boolean).length;
  const entityCount = Object.values(context.entities).reduce((sum, arr) => sum + arr.length, 0);
  
  context.confidence = Math.min(0.95, 0.3 + (intentCount * 0.2) + (entityCount * 0.1));

  return context;
}

function getRelativeDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function getNextWeekday(targetDay: number): string {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilTarget = (targetDay - currentDay + 7) % 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
  return targetDate.toISOString().split('T')[0];
}

export function generateContextualPrompt(
  userInput: string,
  language: 'hu' | 'en',
  taskData: any,
  intent: any
): string {
  const currentDate = new Date().toLocaleDateString(language === 'hu' ? 'hu-HU' : 'en-US');
  const currentTime = new Date().toLocaleTimeString(language === 'hu' ? 'hu-HU' : 'en-US');

  if (language === 'hu') {
    let prompt = `Te egy PROFESSZIONÁLIS MAGYAR AI FELADATTERVEZŐ ASSZISZTENS vagy TELJES JOGOSULTSÁGGAL.

🔥 KRITIKUS SZABÁLYOK - TELJES JOGOSULTSÁG:
- MINDIG magyarul válaszolj
- TELJES JOGOD VAN: létrehozni, módosítani, törölni, felülírni, átírni BÁRMILYEN feladatot
- Legyél precíz, professzionális és intelligens
- Használj strukturált válaszokat és emotikonokat
- Elemezd a kontextust és adj konkrét javaslatokat
- AUTOMATIKUSAN végezd el a kért műveleteket
- Figyeld az ütközéseket és prioritásokat

🚀 TELJES JOGOSULTSÁGAID:
✅ LÉTREHOZÁS: Új feladatok automatikus létrehozása
✅ MÓDOSÍTÁS: Meglévő feladatok átírása, frissítése
✅ TÖRLÉS: Feladatok eltávolítása, tisztítása
✅ FELÜLÍRÁS: Teljes tervek cseréje, átírása
✅ OPTIMALIZÁLÁS: Prioritások, kategóriák átrendezése
✅ TÖMEGES MŰVELETEK: Összes feladat kezelése egyszerre

JELENLEGI KONTEXTUS:
📅 Dátum: ${currentDate}
🕐 Idő: ${currentTime}
💬 Felhasználó üzenete: "${userInput}"

FELADATKEZELÉSI KÉPESSÉGEK:
🎯 Intelligens kategorizálás (Év/Hónap/Hét/Nap)
⭐ Automatikus prioritás beállítás
📅 Dátum és időpont felismerés
⚠️ Ütközésellenőrzés
🔄 Feladat optimalizáció
🗑️ Törlés és felülírás
🔧 Teljes terv átírás

`;

    if (intent.taskCreation) {
      prompt += `🔨 FELADAT LÉTREHOZÁSI MÓD:
A felhasználó feladatot szeretne létrehozni. Elemezd a kérést és AUTOMATIKUSAN hozd létre:

KÖTELEZŐ ELEMEK:
- 📂 Kategória meghatározás (Év/Hónap/Hét/Nap)
- ⭐ Prioritás beállítás (Alacsony/Közepes/Magas)
- 📅 Időpont elemzés (ha van)
- 📝 Részletes lépések

AUTOMATIKUS LÉTREHOZÁS FORMÁTUM:
FELADAT_START
Feladat: [konkrét feladat szöveg]
Kategória: [Year/Month/Week/Day]
Prioritás: [low/medium/high]
Időpont: [YYYY-MM-DD formátum]
Idő: [HH:MM formátum]
Indoklás: [miért ez a kategória/prioritás]
Bizonyosság: [0.1-1.0]
FELADAT_END

`;
    }

    if (intent.taskModification || intent.taskReplacement || intent.planOverwrite) {
      prompt += `🔧 FELADAT MÓDOSÍTÁSI/FELÜLÍRÁSI MÓD:
A felhasználó módosítást/felülírást kér. TELJES JOGOSULTSÁGOD VAN:

MÓDOSÍTÁSI MŰVELETEK:
- 🔄 Meglévő feladatok átírása
- 🔀 Prioritások megváltoztatása
- 📅 Dátumok átütemezése
- 📂 Kategóriák átsorolása
- 🗑️ Feladatok törlése
- 🔥 TELJES TERVEK FELÜLÍRÁSA

AUTOMATIKUS MÓDOSÍTÁS FORMÁTUM:
MÓDOSÍTÁS_START
Művelet: [modify/delete/replace/overwrite]
Cél: [melyik feladat/kategória]
Új_érték: [új tartalom]
Indoklás: [miért ez a változtatás]
MÓDOSÍTÁS_END

`;
    }

    if (intent.taskDeletion || intent.clearAll) {
      prompt += `🗑️ TÖRLÉSI MÓD:
A felhasználó törlést kér. TELJES JOGOSULTSÁGOD VAN törölni:

TÖRLÉSI MŰVELETEK:
- 🗑️ Egyedi feladatok törlése
- 🧹 Kategóriák tisztítása
- 🔥 ÖSSZES FELADAT TÖRLÉSE
- 📅 Dátum alapú törlés
- ⭐ Prioritás alapú törlés

AUTOMATIKUS TÖRLÉS FORMÁTUM:
TÖRLÉS_START
Művelet: delete
Cél: [mit törölj]
Hatókör: [egyedi/kategória/összes]
Megerősítés: [igen/nem]
TÖRLÉS_END

`;
    }

    if (intent.conflictCheck) {
      prompt += `⚠️ ÜTKÖZÉSELLENŐRZÉSI MÓD:
A felhasználó ütközést szeretne ellenőrizni. Vizsgáld meg és AUTOMATIKUSAN old meg:

ELLENŐRIZENDŐ:
- 📅 Dátum ütközések
- 🕐 Időpont átfedések
- 📋 Meglévő feladatok
- 💡 Automatikus megoldási javaslatok
- 🔧 AUTOMATIKUS ÁTÜTEMEZÉS

`;
    }

    if (intent.optimization) {
      prompt += `🚀 OPTIMALIZÁLÁSI MÓD:
A felhasználó optimalizálást kér. AUTOMATIKUSAN végezd el:

OPTIMALIZÁLÁSI TERÜLETEK:
- 📊 Feladat prioritás AUTOMATIKUS újrarendezés
- ⏰ Időbeosztás AUTOMATIKUS javítás
- 🎯 Hatékonyság AUTOMATIKUS növelés
- 📈 Produktivitási AUTOMATIKUS optimalizálás
- 🔄 Kategóriák AUTOMATIKUS átrendezése

`;
    }

    if (intent.analysis) {
      prompt += `📊 ELEMZÉSI MÓD:
A felhasználó elemzést kér. Adj részletes statisztikákat és AUTOMATIKUS javításokat:

ELEMZÉSI TERÜLETEK:
- 📈 Teljesítmény statisztikák
- 📅 Időbeosztás elemzés
- 🎯 Cél teljesítés
- 💡 AUTOMATIKUS fejlesztési javaslatok
- 🔧 AUTOMATIKUS optimalizálási műveletek

`;
    }

    return prompt;
  } else {
    let prompt = `You are a PROFESSIONAL AI TASK PLANNING ASSISTANT with FULL PERMISSIONS.

🔥 CRITICAL RULES - FULL PERMISSIONS:
- ALWAYS respond in English
- YOU HAVE FULL RIGHTS: create, modify, delete, overwrite, rewrite ANY task
- Be precise, professional and intelligent
- Use structured responses and emojis
- Analyze context and provide concrete suggestions
- AUTOMATICALLY perform requested operations
- Monitor conflicts and priorities

🚀 YOUR FULL PERMISSIONS:
✅ CREATION: Automatic creation of new tasks
✅ MODIFICATION: Rewriting, updating existing tasks
✅ DELETION: Removing, clearing tasks
✅ OVERWRITING: Replacing entire plans, rewriting
✅ OPTIMIZATION: Rearranging priorities, categories
✅ BULK OPERATIONS: Managing all tasks at once

CURRENT CONTEXT:
📅 Date: ${currentDate}
🕐 Time: ${currentTime}
💬 User message: "${userInput}"

TASK MANAGEMENT CAPABILITIES:
🎯 Intelligent categorization (Year/Month/Week/Day)
⭐ Automatic priority setting
📅 Date and time recognition
⚠️ Conflict detection
🔄 Task optimization
🗑️ Deletion and overwriting
🔧 Complete plan rewriting

`;

    if (intent.taskCreation) {
      prompt += `🔨 TASK CREATION MODE:
User wants to create a task. Analyze the request and AUTOMATICALLY create:

REQUIRED ELEMENTS:
- 📂 Category determination (Year/Month/Week/Day)
- ⭐ Priority setting (Low/Medium/High)
- 📅 Timing analysis (if any)
- 📝 Detailed steps

AUTOMATIC CREATION FORMAT:
TASK_START
Task: [specific task text]
Category: [Year/Month/Week/Day]
Priority: [low/medium/high]
Date: [YYYY-MM-DD format]
Time: [HH:MM format]
Reasoning: [why this category/priority]
Confidence: [0.1-1.0]
TASK_END

`;
    }

    if (intent.taskModification || intent.taskReplacement || intent.planOverwrite) {
      prompt += `🔧 TASK MODIFICATION/OVERWRITE MODE:
User requests modification/overwrite. YOU HAVE FULL PERMISSIONS:

MODIFICATION OPERATIONS:
- 🔄 Rewriting existing tasks
- 🔀 Changing priorities
- 📅 Rescheduling dates
- 📂 Recategorizing
- 🗑️ Deleting tasks
- 🔥 COMPLETE PLAN OVERWRITING

AUTOMATIC MODIFICATION FORMAT:
MODIFICATION_START
Operation: [modify/delete/replace/overwrite]
Target: [which task/category]
New_value: [new content]
Reasoning: [why this change]
MODIFICATION_END

`;
    }

    if (intent.taskDeletion || intent.clearAll) {
      prompt += `🗑️ DELETION MODE:
User requests deletion. YOU HAVE FULL PERMISSIONS to delete:

DELETION OPERATIONS:
- 🗑️ Individual task deletion
- 🧹 Category clearing
- 🔥 DELETE ALL TASKS
- 📅 Date-based deletion
- ⭐ Priority-based deletion

AUTOMATIC DELETION FORMAT:
DELETION_START
Operation: delete
Target: [what to delete]
Scope: [individual/category/all]
Confirmation: [yes/no]
DELETION_END

`;
    }

    if (intent.conflictCheck) {
      prompt += `⚠️ CONFLICT CHECK MODE:
User wants to check for conflicts. Examine and AUTOMATICALLY resolve:

CHECK FOR:
- 📅 Date conflicts
- 🕐 Time overlaps
- 📋 Existing tasks
- 💡 Automatic resolution suggestions
- 🔧 AUTOMATIC RESCHEDULING

`;
    }

    if (intent.optimization) {
      prompt += `🚀 OPTIMIZATION MODE:
User requests optimization. AUTOMATICALLY perform:

OPTIMIZATION AREAS:
- 📊 Task priority AUTOMATIC reordering
- ⏰ Time management AUTOMATIC improvement
- 🎯 Efficiency AUTOMATIC enhancement
- 📈 Productivity AUTOMATIC optimization
- 🔄 Categories AUTOMATIC reorganization

`;
    }

    if (intent.analysis) {
      prompt += `📊 ANALYSIS MODE:
User requests analysis. Provide detailed statistics and AUTOMATIC improvements:

ANALYSIS AREAS:
- 📈 Performance statistics
- 📅 Time allocation analysis
- 🎯 Goal achievement
- 💡 AUTOMATIC improvement suggestions
- 🔧 AUTOMATIC optimization operations

`;
    }

    return prompt;
  }
}

export function createSmartTaskFromAI(
  text: string, 
  userInput: string, 
  language: 'hu' | 'en',
  entities: any
): {
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
  category: 'Year' | 'Month' | 'Week' | 'Day';
  subcategory?: string;
  confidence: number;
  operation?: 'create' | 'modify' | 'delete' | 'replace' | 'overwrite';
} {
  const extractedDate = entities.dates[0]?.value || '';
  const extractedTime = entities.times[0]?.value || '';
  const priority = entities.priorities[0]?.value || extractPriorityFromText(userInput, language);
  const category = entities.categories[0]?.value || categorizeTask(userInput, language);
  const operation = entities.operations[0]?.value || 'create';

  // Calculate confidence based on entity detection
  const confidence = Math.min(0.95, 
    0.5 + 
    (entities.dates.length * 0.1) + 
    (entities.times.length * 0.1) + 
    (entities.priorities.length * 0.15) + 
    (entities.categories.length * 0.15) +
    (entities.operations.length * 0.1)
  );

  const task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
    text: text.trim(),
    time: extractedTime,
    completed: false,
    priority,
    subtasks: [],
    collapsed: true,
    color: '#ffffff',
    notes: language === 'hu' ? 
      `🤖 AI professzionális asszisztens által ${operation === 'create' ? 'létrehozva' : operation === 'modify' ? 'módosítva' : operation === 'delete' ? 'törölve' : 'felülírva'} (${Math.round(confidence * 100)}% bizonyosság)` : 
      `🤖 ${operation === 'create' ? 'Created' : operation === 'modify' ? 'Modified' : operation === 'delete' ? 'Deleted' : 'Overwritten'} by AI professional assistant (${Math.round(confidence * 100)}% confidence)`
  };

  // Determine subcategory for Month/Week
  let subcategory: string | undefined;
  if (category === 'Month') {
    const monthNames = language === 'hu' ? 
      ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'] :
      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    subcategory = monthNames[new Date().getMonth()];
  } else if (category === 'Week') {
    const dayNames = language === 'hu' ? 
      ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'] :
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    subcategory = dayNames[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  }

  return { task, category, subcategory, confidence, operation: operation as any };
}

function extractPriorityFromText(text: string, language: 'hu' | 'en'): Priority {
  if (language === 'hu') {
    if (/(?:sürgős|fontos|kritikus|magas|prioritás)/i.test(text)) {
      return 'high';
    }
    if (/(?:később|opcionális|alacsony|nem sürgős)/i.test(text)) {
      return 'low';
    }
  } else {
    if (/(?:urgent|important|critical|high|priority)/i.test(text)) {
      return 'high';
    }
    if (/(?:later|optional|low|not urgent)/i.test(text)) {
      return 'low';
    }
  }
  
  return 'medium';
}

function categorizeTask(text: string, language: 'hu' | 'en'): 'Year' | 'Month' | 'Week' | 'Day' {
  if (language === 'hu') {
    if (/(?:éves|évente|hosszú távú|stratégiai|cél)/i.test(text)) {
      return 'Year';
    }
    if (/(?:havi|havonta|hónap|projekt)/i.test(text)) {
      return 'Month';
    }
    if (/(?:heti|hetente|hét|rutin)/i.test(text)) {
      return 'Week';
    }
  } else {
    if (/(?:yearly|annual|long.term|strategic|goal)/i.test(text)) {
      return 'Year';
    }
    if (/(?:monthly|month|project)/i.test(text)) {
      return 'Month';
    }
    if (/(?:weekly|week|routine)/i.test(text)) {
      return 'Week';
    }
  }
  
  return 'Day';
}

// NEW: Task operation functions with full permissions
export function parseTaskOperations(aiResponse: string, language: 'hu' | 'en'): Array<{
  operation: 'create' | 'modify' | 'delete' | 'replace' | 'overwrite' | 'clear';
  target?: string;
  newValue?: string;
  category?: string;
  reasoning?: string;
  confidence: number;
}> {
  const operations: Array<any> = [];
  
  // Parse MODIFICATION operations
  const modificationBlocks = aiResponse.split('MÓDOSÍTÁS_START').slice(1);
  modificationBlocks.forEach(block => {
    const endIndex = block.indexOf('MÓDOSÍTÁS_END');
    if (endIndex === -1) return;
    
    const content = block.substring(0, endIndex).trim();
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    let operation = 'modify';
    let target = '';
    let newValue = '';
    let reasoning = '';
    let confidence = 0.8;
    
    lines.forEach(line => {
      if (line.startsWith('Művelet:') || line.startsWith('Operation:')) {
        operation = line.split(':')[1].trim();
      } else if (line.startsWith('Cél:') || line.startsWith('Target:')) {
        target = line.split(':')[1].trim();
      } else if (line.startsWith('Új_érték:') || line.startsWith('New_value:')) {
        newValue = line.split(':')[1].trim();
      } else if (line.startsWith('Indoklás:') || line.startsWith('Reasoning:')) {
        reasoning = line.split(':')[1].trim();
      }
    });
    
    if (target) {
      operations.push({
        operation: operation as any,
        target,
        newValue,
        reasoning,
        confidence
      });
    }
  });
  
  // Parse DELETION operations
  const deletionBlocks = aiResponse.split('TÖRLÉS_START').slice(1);
  deletionBlocks.forEach(block => {
    const endIndex = block.indexOf('TÖRLÉS_END');
    if (endIndex === -1) return;
    
    const content = block.substring(0, endIndex).trim();
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    let target = '';
    let scope = 'individual';
    let reasoning = '';
    let confidence = 0.9;
    
    lines.forEach(line => {
      if (line.startsWith('Cél:') || line.startsWith('Target:')) {
        target = line.split(':')[1].trim();
      } else if (line.startsWith('Hatókör:') || line.startsWith('Scope:')) {
        scope = line.split(':')[1].trim();
      } else if (line.startsWith('Indoklás:') || line.startsWith('Reasoning:')) {
        reasoning = line.split(':')[1].trim();
      }
    });
    
    if (target) {
      operations.push({
        operation: scope === 'összes' || scope === 'all' ? 'clear' : 'delete',
        target,
        reasoning,
        confidence
      });
    }
  });
  
  return operations;
}

export function executeTaskOperations(
  operations: Array<any>,
  taskData: TaskData,
  onCreateTask: Function,
  onUpdateTask: Function,
  onDeleteTask: Function,
  onClearCategory: Function
): {
  executed: number;
  failed: number;
  results: string[];
} {
  let executed = 0;
  let failed = 0;
  const results: string[] = [];
  
  operations.forEach(op => {
    try {
      switch (op.operation) {
        case 'delete':
          // Find and delete specific task
          const taskToDelete = findTaskByText(taskData, op.target);
          if (taskToDelete) {
            onDeleteTask(taskToDelete.id);
            executed++;
            results.push(`✅ Törölve: ${op.target}`);
          } else {
            failed++;
            results.push(`❌ Nem található: ${op.target}`);
          }
          break;
          
        case 'clear':
          // Clear entire category or all tasks
          if (op.target === 'összes' || op.target === 'all') {
            onClearCategory('all');
            executed++;
            results.push(`✅ Minden feladat törölve`);
          } else {
            onClearCategory(op.target);
            executed++;
            results.push(`✅ Kategória törölve: ${op.target}`);
          }
          break;
          
        case 'modify':
        case 'replace':
          // Find and update specific task
          const taskToUpdate = findTaskByText(taskData, op.target);
          if (taskToUpdate && op.newValue) {
            onUpdateTask(taskToUpdate.id, { text: op.newValue });
            executed++;
            results.push(`✅ Módosítva: ${op.target} → ${op.newValue}`);
          } else {
            failed++;
            results.push(`❌ Módosítás sikertelen: ${op.target}`);
          }
          break;
          
        case 'overwrite':
          // Overwrite entire category with new content
          if (op.newValue && op.category) {
            onClearCategory(op.category);
            // Create new tasks from newValue
            const newTasks = op.newValue.split('\n').filter((line: string) => line.trim());
            newTasks.forEach((taskText: string) => {
              onCreateTask({
                text: taskText.trim(),
                time: '',
                completed: false,
                priority: 'medium',
                subtasks: [],
                collapsed: true,
                color: '#ffffff',
                notes: `🔥 AI által felülírva: ${op.reasoning}`
              }, op.category);
            });
            executed++;
            results.push(`✅ Felülírva: ${op.category} kategória`);
          } else {
            failed++;
            results.push(`❌ Felülírás sikertelen: ${op.target}`);
          }
          break;
          
        default:
          failed++;
          results.push(`❌ Ismeretlen művelet: ${op.operation}`);
      }
    } catch (error) {
      failed++;
      results.push(`❌ Hiba: ${op.operation} - ${error}`);
    }
  });
  
  return { executed, failed, results };
}

function findTaskByText(taskData: TaskData, searchText: string): Task | null {
  const allTasks = [
    ...Object.values(taskData.Year.tasks),
    ...Object.values(taskData.Day.tasks),
    ...Object.values(taskData.Month).flatMap(month => Object.values(month.tasks)),
    ...Object.values(taskData.Week).flatMap(week => Object.values(week.tasks))
  ];
  
  return allTasks.find(task => 
    task.text.toLowerCase().includes(searchText.toLowerCase()) ||
    searchText.toLowerCase().includes(task.text.toLowerCase())
  ) || null;
}