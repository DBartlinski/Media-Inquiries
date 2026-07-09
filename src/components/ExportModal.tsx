import { useState, useMemo } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  exportToExcel,
  exportToMarkdown,
  downloadBlob,
  downloadText,
} from '@/utils/exportUtils'
import { parseDate } from '@/utils/taskUtils'
import { isAfter, isBefore } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

interface ExportModalProps {
  tasks: Task[]
  onClose: () => void
}

type ExportFormat = 'excel' | 'markdown'

export function ExportModal({ tasks, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('excel')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const matchingCount = useMemo(() => {
    if (!dateFrom && !dateTo) return tasks.length
    return tasks.filter((t) => {
      const d = parseDate(t.dueDate) ?? parseDate(t.createdDate)
      if (!d) return true
      if (dateFrom && isBefore(d, new Date(dateFrom))) return false
      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(23, 59, 59, 999)
        if (isAfter(d, to)) return false
      }
      return true
    }).length
  }, [tasks, dateFrom, dateTo])

  function handleExport() {
    const timestamp = new Date().toISOString().slice(0, 10)
    if (format === 'excel') {
      const blob = exportToExcel(tasks, dateFrom || undefined, dateTo || undefined)
      downloadBlob(blob, `media-inquiries-${timestamp}.xlsx`)
    } else {
      const md = exportToMarkdown(tasks, dateFrom || undefined, dateTo || undefined)
      downloadText(md, `media-inquiries-${timestamp}.md`)
    }
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Records</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Format selection */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2">
              Format
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm font-medium transition-colors',
                  format === 'excel'
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => setFormat('markdown')}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm font-medium transition-colors',
                  format === 'markdown'
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                <FileText className="h-4 w-4" />
                Markdown (.md)
              </button>
            </div>
            {format === 'markdown' && (
              <p className="text-xs text-gray-500 mt-1.5">
                Formatted for AI analysis — includes summary statistics and structured per-inquiry blocks.
              </p>
            )}
          </div>

          {/* Date range */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2">
              Date Range (optional)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500">From</Label>
                <Input
                  type="date"
                  className="h-8 text-sm mt-0.5"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">To</Label>
                <Input
                  type="date"
                  className="h-8 text-sm mt-0.5"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Preview count */}
          <div className="bg-gray-50 rounded-md px-3 py-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">Records to export</span>
            <span className="text-sm font-semibold text-gray-800">{matchingCount}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={matchingCount === 0}
            className="bg-violet-700 hover:bg-violet-800"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
