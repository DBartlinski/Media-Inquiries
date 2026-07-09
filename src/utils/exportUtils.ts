import * as XLSX from 'xlsx'
import type { Task } from '@/types'
import { parseDate } from '@/utils/taskUtils'
import { isAfter, isBefore } from 'date-fns'

function filterByDateRange(tasks: Task[], dateFrom?: string, dateTo?: string): Task[] {
  if (!dateFrom && !dateTo) return tasks

  return tasks.filter((task) => {
    const taskDate = parseDate(task.dueDate) ?? parseDate(task.createdDate)
    if (!taskDate) return true // include tasks without dates

    if (dateFrom) {
      const from = new Date(dateFrom)
      if (isBefore(taskDate, from)) return false
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      if (isAfter(taskDate, to)) return false
    }
    return true
  })
}

function taskToRow(task: Task) {
  return {
    'Inquiry Title': task.name,
    'News Outlet': task.newsOutlet ?? '',
    'Reporter': task.reporter ?? '',
    'Subject': task.subject ?? '',
    'Source/SME': (task.sourceSme ?? []).join('; '),
    'Status': task.progress,
    'Priority': task.priority,
    'Assigned To': task.assignedTo.join('; '),
    'Created Date': task.createdDate,
    'Start Date': task.startDate,
    'Due Date': task.dueDate,
    'Completed Date': task.completedDate,
    'Completed By': task.completedBy,
    'Labels': task.labels,
    'Checklist Progress': task.checklist.length > 0
      ? `${task.checklist.filter((c) => c.completed).length}/${task.checklist.length}`
      : '',
    'Description': task.description,
  }
}

export function exportToExcel(tasks: Task[], dateFrom?: string, dateTo?: string): Blob {
  const filtered = filterByDateRange(tasks, dateFrom, dateTo)
  const rows = filtered.map(taskToRow)

  const ws = XLSX.utils.json_to_sheet(rows)

  // Auto-size columns
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.map((r) => String((r as Record<string, unknown>)[key] ?? '').length)
    )
    return { wch: Math.min(maxLen + 2, 60) }
  })
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Media Inquiries')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export function exportToMarkdown(tasks: Task[], dateFrom?: string, dateTo?: string): string {
  const filtered = filterByDateRange(tasks, dateFrom, dateTo)
  const lines: string[] = []

  // Summary statistics
  lines.push('# Media Inquiries Export')
  lines.push('')
  lines.push(`**Export Date:** ${new Date().toLocaleDateString('en-US')}`)
  if (dateFrom || dateTo) {
    lines.push(`**Date Range:** ${dateFrom || 'Any'} — ${dateTo || 'Any'}`)
  }
  lines.push(`**Total Records:** ${filtered.length}`)
  lines.push('')

  // Status breakdown
  const statusCounts: Record<string, number> = {}
  const priorityCounts: Record<string, number> = {}
  const outletCounts: Record<string, number> = {}

  for (const t of filtered) {
    statusCounts[t.progress] = (statusCounts[t.progress] ?? 0) + 1
    priorityCounts[t.priority] = (priorityCounts[t.priority] ?? 0) + 1
    if (t.newsOutlet) {
      outletCounts[t.newsOutlet] = (outletCounts[t.newsOutlet] ?? 0) + 1
    }
  }

  lines.push('## Summary Statistics')
  lines.push('')
  lines.push('### By Status')
  for (const [status, count] of Object.entries(statusCounts).sort((a, b) => b[1] - a[1])) {
    lines.push(`- ${status}: ${count}`)
  }
  lines.push('')

  lines.push('### By Priority')
  for (const [priority, count] of Object.entries(priorityCounts).sort((a, b) => b[1] - a[1])) {
    lines.push(`- ${priority}: ${count}`)
  }
  lines.push('')

  if (Object.keys(outletCounts).length > 0) {
    lines.push('### By News Outlet')
    for (const [outlet, count] of Object.entries(outletCounts).sort((a, b) => b[1] - a[1])) {
      lines.push(`- ${outlet}: ${count}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')

  // Per-inquiry blocks
  lines.push('## Individual Inquiries')
  lines.push('')

  for (const task of filtered) {
    lines.push(`### ${task.name}`)
    lines.push('')
    lines.push(`| Field | Value |`)
    lines.push(`|-------|-------|`)
    lines.push(`| Status | ${task.progress} |`)
    lines.push(`| Priority | ${task.priority} |`)
    lines.push(`| News Outlet | ${task.newsOutlet || 'N/A'} |`)
    lines.push(`| Reporter | ${task.reporter || 'N/A'} |`)
    lines.push(`| Subject | ${task.subject || 'N/A'} |`)
    lines.push(`| Source/SME | ${(task.sourceSme ?? []).join(', ') || 'N/A'} |`)
    lines.push(`| Assigned To | ${task.assignedTo.join(', ') || 'Unassigned'} |`)
    lines.push(`| Created Date | ${task.createdDate || 'N/A'} |`)
    lines.push(`| Due Date | ${task.dueDate || 'N/A'} |`)
    lines.push(`| Completed Date | ${task.completedDate || 'N/A'} |`)
    lines.push('')

    if (task.checklist.length > 0) {
      const completed = task.checklist.filter((c) => c.completed).length
      lines.push(`**Checklist Progress:** ${completed}/${task.checklist.length}`)
      for (const item of task.checklist) {
        lines.push(`- [${item.completed ? 'x' : ' '}] ${item.item}`)
      }
      lines.push('')
    }

    if (task.description) {
      lines.push('**Description:**')
      lines.push('')
      lines.push(task.description)
      lines.push('')
    }

    lines.push('---')
    lines.push('')
  }

  return lines.join('\n')
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
  downloadBlob(blob, filename)
}
