import Papa from 'papaparse'
import type { Task, ChecklistItem, ImportDiff } from '@/types'
import { parseDescriptionFields } from '@/utils/descriptionParser'

interface CsvRow {
  'Task ID': string
  'Task Name': string
  'Bucket Name': string
  'Progress': string
  'Priority': string
  'Assigned To': string
  'Created By': string
  'Created Date': string
  'Start date': string
  'Due date': string
  'Is Recurring': string
  'Late': string
  'Completed Date': string
  'Completed By': string
  'Completed Checklist Items': string
  'Checklist Items': string
  'Labels': string
  'Description': string
}

function parseChecklist(itemsStr: string, completedStr: string): ChecklistItem[] {
  const items = itemsStr
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
  if (items.length === 0) return []

  // completedStr is like "3/5" — first N are completed
  const completedCount = parseInt(completedStr.split('/')[0] ?? '0', 10) || 0

  return items.map((item, idx) => ({
    item,
    completed: idx < completedCount,
  }))
}

function parseRow(row: CsvRow): Task | null {
  const id = row['Task ID']?.trim()
  if (!id) return null

  const description = row['Description']?.trim() ?? ''
  const parsed = parseDescriptionFields(description)

  return {
    id,
    name: row['Task Name']?.trim() ?? '',
    bucket: row['Bucket Name']?.trim() ?? 'Media Inquiries',
    progress: (row['Progress']?.trim() as Task['progress']) || 'Not started',
    priority: row['Priority']?.trim() || 'Medium',
    assignedTo: (row['Assigned To'] ?? '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean),
    createdBy: row['Created By']?.trim() ?? '',
    createdDate: row['Created Date']?.trim() ?? '',
    startDate: row['Start date']?.trim() ?? '',
    dueDate: row['Due date']?.trim() ?? '',
    isRecurring: row['Is Recurring']?.trim().toLowerCase() === 'true',
    late: row['Late']?.trim().toLowerCase() === 'true',
    completedDate: row['Completed Date']?.trim() ?? '',
    completedBy: row['Completed By']?.trim() ?? '',
    checklist: parseChecklist(
      row['Checklist Items'] ?? '',
      row['Completed Checklist Items'] ?? '0'
    ),
    labels: row['Labels']?.trim() ?? '',
    description,
    newsOutlet: parsed.newsOutlet,
    reporter: parsed.reporter,
    subject: parsed.subject,
    sourceSme: parsed.sourceSme,
  }
}

export function parseCSV(csvText: string): Task[] {
  const result = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: false,
    dynamicTyping: false,
  })

  return result.data
    .map(parseRow)
    .filter((t): t is Task => t !== null && t.id.length > 0)
}

function getChangedFields(original: Task, incoming: Task): string[] {
  const csvFields: (keyof Task)[] = [
    'name',
    'priority',
    'dueDate',
    'startDate',
    'completedDate',
    'completedBy',
    'assignedTo',
  ]
  const changed: string[] = []
  for (const field of csvFields) {
    const a = JSON.stringify(original[field])
    const b = JSON.stringify(incoming[field])
    if (a !== b) changed.push(field)
  }
  return changed
}

function mergeChecklist(
  existing: ChecklistItem[],
  incoming: ChecklistItem[]
): ChecklistItem[] {
  // Keep local completion state; add any new checklist items from CSV
  const existingMap = new Map(existing.map((item) => [item.item, item.completed]))
  return incoming.map((item) => ({
    item: item.item,
    completed: existingMap.has(item.item) ? (existingMap.get(item.item) ?? item.completed) : item.completed,
  }))
}

export function buildImportDiff(existingTasks: Task[], csvTasks: Task[]): ImportDiff {
  const existingMap = new Map(existingTasks.map((t) => [t.id, t]))
  const newTasks: Task[] = []
  const updatedTasks: ImportDiff['updatedTasks'] = []
  let unchangedCount = 0

  for (const csvTask of csvTasks) {
    const existing = existingMap.get(csvTask.id)
    if (!existing) {
      newTasks.push(csvTask)
    } else {
      const changedFields = getChangedFields(existing, csvTask)
      if (changedFields.length > 0) {
        const updated: Task = {
          ...existing,
          // CSV is source of truth for these fields:
          name: csvTask.name,
          priority: csvTask.priority,
          dueDate: csvTask.dueDate,
          startDate: csvTask.startDate,
          completedDate: csvTask.completedDate,
          completedBy: csvTask.completedBy,
          assignedTo: csvTask.assignedTo,
          // Local state preserved:
          progress: existing.localEditTimestamp ? existing.progress : csvTask.progress,
          checklist: mergeChecklist(existing.checklist, csvTask.checklist),
          localEditTimestamp: existing.localEditTimestamp,
        }
        updatedTasks.push({ original: existing, updated, changedFields })
      } else {
        unchangedCount++
      }
    }
  }

  return { newTasks, updatedTasks, unchangedCount }
}

export function applyImportDiff(existingTasks: Task[], diff: ImportDiff): Task[] {
  const result = [...existingTasks]

  for (const { updated } of diff.updatedTasks) {
    const idx = result.findIndex((t) => t.id === updated.id)
    if (idx >= 0) result[idx] = updated
  }

  for (const newTask of diff.newTasks) {
    result.push(newTask)
  }

  return result
}
