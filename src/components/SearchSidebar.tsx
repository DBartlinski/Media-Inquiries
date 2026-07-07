import { Search, X, RotateCcw, Archive } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import type { FilterState } from '@/types'

const PRIORITIES = ['Urgent', 'Important', 'Medium', 'Low']
const STATUSES = ['Not started', 'In progress', 'Completed']

interface SearchSidebarProps {
  filters: FilterState
  onChange: (f: FilterState) => void
  taskCount: number
}

function toggleArrayItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
}

const PRIORITY_DOTS: Record<string, string> = {
  Urgent: 'bg-red-500',
  Important: 'bg-yellow-400',
  Medium: 'bg-blue-500',
  Low: 'bg-gray-400',
}

export function SearchSidebar({ filters, onChange, taskCount }: SearchSidebarProps) {
  const hasFilters =
    filters.search !== '' ||
    filters.priority.length > 0 ||
    filters.status.length > 0 ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.includeArchive

  function reset() {
    onChange({
      search: '',
      priority: [],
      status: [],
      dateFrom: '',
      dateTo: '',
      includeArchive: false,
    })
  }

  return (
    <aside className="w-60 shrink-0 border-r bg-white flex flex-col overflow-hidden">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search all inquiries…"
            className="pl-8 text-sm h-8"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
          {filters.search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => onChange({ ...filters, search: '' })}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5 text-sm">
        {/* Priority */}
        <div>
          <p className="font-semibold text-gray-600 mb-2 uppercase text-xs tracking-wider">
            Priority
          </p>
          <div className="space-y-1.5">
            {PRIORITIES.map((p) => (
              <label key={p} className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <Checkbox
                  checked={filters.priority.includes(p)}
                  onCheckedChange={() =>
                    onChange({ ...filters, priority: toggleArrayItem(filters.priority, p) })
                  }
                />
                <span
                  className={`inline-block w-2 h-2 rounded-full ${PRIORITY_DOTS[p] ?? 'bg-gray-400'}`}
                />
                {p}
              </label>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <p className="font-semibold text-gray-600 mb-2 uppercase text-xs tracking-wider">
            Status
          </p>
          <div className="space-y-1.5">
            {STATUSES.map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <Checkbox
                  checked={filters.status.includes(s)}
                  onCheckedChange={() =>
                    onChange({ ...filters, status: toggleArrayItem(filters.status, s) })
                  }
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        {/* Archive */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
            <Checkbox
              checked={filters.includeArchive}
              onCheckedChange={(v) => onChange({ ...filters, includeArchive: v === true })}
            />
            <Archive className="h-3.5 w-3.5 text-gray-500" />
            Include Archive
          </label>
        </div>

        {/* Date range */}
        <div>
          <p className="font-semibold text-gray-600 mb-2 uppercase text-xs tracking-wider">
            Due Date Range
          </p>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-gray-500">From</Label>
              <Input
                type="date"
                className="h-7 text-xs mt-0.5"
                value={filters.dateFrom}
                onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">To</Label>
              <Input
                type="date"
                className="h-7 text-xs mt-0.5"
                value={filters.dateTo}
                onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{taskCount}</span> result
            {taskCount !== 1 ? 's' : ''}
          </span>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={reset} className="h-6 text-xs px-2">
              <RotateCcw className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}
