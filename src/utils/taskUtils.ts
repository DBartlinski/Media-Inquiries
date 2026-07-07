import { format, parseISO, isValid, isBefore, isAfter } from 'date-fns'
import type { Task, FilterState } from '@/types'

export function generateTaskId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = parseISO(dateStr) 
    if (isValid(d)) return format(d, 'MMM d, yyyy')
    // Try MM/DD/YYYY format
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const d2 = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]))
      if (isValid(d2)) return format(d2, 'MMM d, yyyy')
    }
    return dateStr
  } catch {
    return dateStr
  }
}

export function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false
  try {
    const d = parseISO(dueDate)
    if (isValid(d)) return isBefore(d, new Date())
    const parts = dueDate.split('/')
    if (parts.length === 3) {
      const d2 = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]))
      return isBefore(d2, new Date())
    }
    return false
  } catch {
    return false
  }
}

export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  try {
    const iso = parseISO(dateStr)
    if (isValid(iso)) return iso
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]))
      if (isValid(d)) return d
    }
    return null
  } catch {
    return null
  }
}

export const PRIORITY_ORDER: Record<string, number> = {
  Urgent: 0,
  Important: 1,
  Medium: 2,
  Low: 3,
}

export const PRIORITY_COLORS: Record<string, string> = {
  Urgent: 'bg-red-500',
  Important: 'bg-yellow-400',
  Medium: 'bg-blue-500',
  Low: 'bg-gray-400',
}

export const PRIORITY_BADGE_COLORS: Record<string, string> = {
  Urgent: 'bg-red-100 text-red-700 border-red-200',
  Important: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Medium: 'bg-blue-100 text-blue-700 border-blue-200',
  Low: 'bg-gray-100 text-gray-600 border-gray-200',
}

export const STATUS_COLORS: Record<string, string> = {
  'Not started': 'bg-gray-200 text-gray-700',
  'In progress': 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Archive: 'bg-gray-100 text-gray-500',
}

function searchMatches(task: Task, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  const searchable = [
    task.name,
    task.description,
    task.labels,
    task.createdBy,
    task.bucket,
    ...task.assignedTo,
    ...task.checklist.map((c) => c.item),
  ]
    .join(' ')
    .toLowerCase()
  return searchable.includes(q)
}

export function filterTasks(tasks: Task[], filters: FilterState): Task[] {
  return tasks.filter((task) => {
    if (!filters.includeArchive && task.progress === 'Archive') return false
    if (!searchMatches(task, filters.search)) return false
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false
    if (filters.status.length > 0 && !filters.status.includes(task.progress)) return false

    if (filters.dateFrom) {
      const taskDate = parseDate(task.dueDate) ?? parseDate(task.createdDate)
      if (taskDate && isAfter(parseISO(filters.dateFrom), taskDate)) return false
    }
    if (filters.dateTo) {
      const taskDate = parseDate(task.dueDate) ?? parseDate(task.createdDate)
      if (taskDate && isBefore(parseISO(filters.dateTo), taskDate)) return false
    }

    return true
  })
}

export function getInitials(name: string): string {
  return name
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

export const DEFAULT_CHECKLIST_ITEMS = [
  "Rec'd request from reporter/outlet/ORD Comms",
  "Rec'd questions and passed along to SME",
  'Looped in ORD Comms',
  "Rec'd responses from SME",
  'Reviewed responses and sent to ORD Comms',
]

export const DEFAULT_DESCRIPTION_TEMPLATE = `**News Agency:** 

**Reporter:** 

**Query Submitted:** 

**Deadline:** 

**Topic:** 

**Source/SME:**`

export const KANBAN_COLUMNS: Array<{ id: Task['progress']; label: string; color: string }> = [
  { id: 'Not started', label: 'Not Started', color: 'border-gray-300' },
  { id: 'In progress', label: 'In Progress', color: 'border-blue-400' },
  { id: 'Completed', label: 'Completed', color: 'border-green-400' },
]
