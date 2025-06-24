import type {
  TaskData,
  ImportOptions,
  TaskCollection,
  Task,
  Note,
} from '../types';

/**
 * Serialize TaskData to a pretty-printed JSON string.
 */
export function exportData(data: TaskData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Parse and validate a JSON backup file into TaskData.
 * @throws Error if JSON is invalid or fails schema validation.
 */
export async function importData(file: File): Promise<TaskData> {
  const text = await file.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Failed to parse JSON');
  }

  if (!validateImportData(parsed)) {
    throw new Error('Backup data does not match expected format');
  }

  const d = parsed as TaskData;
  return {
    Year:  d.Year  ?? { text: '', tasks: {} },
    Month: d.Month ?? {},
    Week:  d.Week  ?? {},
    Day:   d.Day   ?? { text: '', tasks: {} },
    Notes: d.Notes ?? {},
  };
}

/**
 * Merge or replace two TaskData objects according to the given mode.
 *
 * - 'merge': overwrite existing entries with incoming ones.
 * - 'append': add only non-duplicate entries.
 * - 'replace': fully replace target with incoming.
 */
export function mergeTaskData(
  existing: TaskData,
  incoming: TaskData,
  options: ImportOptions
): TaskData {
  const result = deepClone(existing);
  const mode = options.mode;

  // Merge single collections
  for (const key of ['Year', 'Day'] as const) {
    const incomingColl = incoming[key];
    if (incomingColl && isValidTaskCollection(incomingColl)) {
      ensureCollection(result, key);
      const targetColl = result[key];
      if (targetColl) {
        applyMerge(targetColl, incomingColl, mode);
      }
    }
  }

  // Merge keyed collections: Month & Week
  for (const key of ['Month', 'Week'] as const) {
    const incomingMap = incoming[key];
    if (!incomingMap) continue;
    result[key] = result[key] ?? {};
    for (const subKey of Object.keys(incomingMap)) {
      const incomingColl = incomingMap[subKey];
      if (!isValidTaskCollection(incomingColl)) continue;
      result[key]![subKey] = result[key]![subKey] ?? { text: '', tasks: {} };
      const targetColl = result[key]![subKey];
      if (targetColl) {
        applyMerge(targetColl, incomingColl, mode);
      }
    }
  }

  // Merge Notes
  result.Notes = result.Notes ?? {};
  if (mode === 'replace') {
    result.Notes = { ...incoming.Notes };
  } else {
    for (const [id, note] of Object.entries(incoming.Notes ?? {})) {
      if (!isValidNote(note)) continue;
      if (mode === 'merge') {
        const existingNote = result.Notes[id];
        if (!existingNote || note.updatedAt > existingNote.updatedAt) {
          result.Notes[id] = note;
        }
      } else {
        // append mode
        let newId = id;
        while (result.Notes[newId]) {
          newId += '-imported';
        }
        result.Notes[newId] = note;
      }
    }
  }

  return result;
}

/** ─── Helper Functions ─────────────────────────────────────────────────────── */

/** Deep-clones an object via JSON serialization. */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Ensures that a top-level Year/Day collection exists and is valid. */
function ensureCollection(
  data: TaskData,
  key: 'Year' | 'Day'
): void {
  if (!isValidTaskCollection(data[key])) {
    (data as any)[key] = { text: '', tasks: {} };
  }
}

/**
 * Apply merge/append/replace logic to a single TaskCollection.
 */
function applyMerge(
  target: TaskCollection,
  source: TaskCollection,
  mode: 'merge' | 'append' | 'replace'
) {
  switch (mode) {
    case 'replace':
      target.text = source.text;
      target.tasks = { ...source.tasks };
      break;
    case 'merge':
      target.text = source.text;
      Object.assign(target.tasks, source.tasks);
      break;
    case 'append':
      for (const [id, task] of Object.entries(source.tasks)) {
        if (!target.tasks[id]) {
          target.tasks[id] = task;
        }
      }
      if (!target.text.trim()) {
        target.text = source.text;
      }
      break;
  }
}

/** Type guard: non-null object. */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Validate a Task shape. */
function isValidTask(item: unknown): item is Task {
  if (!isObject(item)) return false;
  const t = item as Partial<Task>;
  const priorities = ['low', 'medium', 'high'] as const;

  return (
    typeof t.id === 'string' &&
    typeof t.text === 'string' &&
    typeof t.completed === 'boolean' &&
    priorities.includes(t.priority as any) &&
    (t.subtasks === undefined ||
      (Array.isArray(t.subtasks) &&
        t.subtasks.every(st => isObject(st) && typeof (st as any).id === 'string'))) &&
    (t.createdAt === undefined || typeof t.createdAt === 'string') &&
    (t.updatedAt === undefined || typeof t.updatedAt === 'string')
  );
}

/** Validate a TaskCollection. */
function isValidTaskCollection(coll: unknown): coll is TaskCollection {
  if (!isObject(coll)) return false;
  const c = coll as Partial<TaskCollection>;
  return (
    typeof c.text === 'string' &&
    isObject(c.tasks) &&
    Object.values(c.tasks).every(isValidTask)
  );
}

/** Validate a Note shape. */
function isValidNote(item: unknown): item is Note {
  if (!isObject(item)) return false;
  const n = item as Partial<Note>;
  return (
    typeof n.id === 'string' &&
    typeof n.title === 'string' &&
    typeof n.content === 'string' &&
    (n.tags === undefined ||
      (Array.isArray(n.tags) && n.tags.every(t => typeof t === 'string'))) &&
    typeof n.createdAt === 'string' &&
    typeof n.updatedAt === 'string'
  );
}

/**
 * Validate that an arbitrary object conforms to TaskData.
 * @throws Error with a descriptive message on first failure.
 */
export function validateImportData(data: unknown): data is TaskData {
  if (!isObject(data)) {
    throw new Error('Data is not an object');
  }
  const d = data as any;

  if (!isValidTaskCollection(d.Year)) {
    throw new Error('Missing or invalid Year collection');
  }
  if (!isObject(d.Month)) {
    throw new Error('Missing or invalid Month map');
  }
  if (!isObject(d.Week)) {
    throw new Error('Missing or invalid Week map');
  }
  if (!isValidTaskCollection(d.Day)) {
    throw new Error('Missing or invalid Day collection');
  }
  if (!isObject(d.Notes)) {
    throw new Error('Missing or invalid Notes map');
  }

  for (const m of Object.keys(d.Month)) {
    if (!isValidTaskCollection(d.Month[m])) {
      throw new Error(`Invalid Month[${m}] collection`);
    }
  }
  for (const w of Object.keys(d.Week)) {
    if (!isValidTaskCollection(d.Week[w])) {
      throw new Error(`Invalid Week[${w}] collection`);
    }
  }
  for (const n of Object.keys(d.Notes)) {
    if (!isValidNote(d.Notes[n])) {
      throw new Error(`Invalid Note[${n}] entry`);
    }
  }

  return true;
}