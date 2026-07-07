import { useState } from 'react'
import { Archive, Save } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDate, isOverdue, PRIORITY_BADGE_COLORS, STATUS_COLORS } from '@/utils/taskUtils'
import { cn } from '@/lib/utils'
import type { Task, ChecklistItem } from '@/types'

interface TaskModalProps {
  task: Task
  onClose: () => void
  onSave: (task: Task) => void
  onArchive: (task: Task) => void
}

const PRIORITIES = ['Urgent', 'Important', 'Medium', 'Low']
const STATUSES: Task['progress'][] = ['Not started', 'In progress', 'Completed', 'Archive']

function renderDescription(text: string) {
  // Simple markdown-like rendering without a library
  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>
      }
      return part
    })
    return (
      <p key={i} className={cn('text-sm text-gray-700 leading-relaxed', line === '' && 'h-2')}>
        {parts}
      </p>
    )
  })
}

export function TaskModal({ task, onClose, onSave, onArchive }: TaskModalProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Task>(task)

  const overdue = isOverdue(task.dueDate) && task.progress !== 'Completed'

  function handleChecklistToggle(index: number) {
    const updated: ChecklistItem[] = draft.checklist.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    )
    const updatedTask = { ...draft, checklist: updated }
    setDraft(updatedTask)
    onSave(updatedTask)
  }

  function handleSave() {
    onSave(draft)
    setEditing(false)
  }

  const completedItems = draft.checklist.filter((c) => c.completed).length
  const totalItems = draft.checklist.length

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {editing ? (
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0 text-gray-900"
                  placeholder="Inquiry title"
                />
              ) : (
                <DialogTitle
                  className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-violet-700 leading-snug"
                  onClick={() => setEditing(true)}
                  title="Click to edit"
                >
                  {task.name}
                </DialogTitle>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    STATUS_COLORS[task.progress] ?? 'bg-gray-100 text-gray-600'
                  )}
                >
                  {task.progress}
                </span>
                <Badge
                  className={cn(
                    'text-xs border',
                    PRIORITY_BADGE_COLORS[task.priority] ?? 'bg-gray-100 text-gray-600'
                  )}
                  variant="outline"
                >
                  {task.priority}
                </Badge>
                {task.dueDate && (
                  <span className={cn('text-xs', overdue ? 'text-red-600 font-medium' : 'text-gray-500')}>
                    Due {formatDate(task.dueDate)}
                    {overdue && ' · Overdue'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-0 divide-x">
            {/* Main content: Description */}
            <div className="col-span-2 px-6 py-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Description
                  </Label>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="text-xs text-violet-600 hover:text-violet-800"
                  >
                    {editing ? 'Preview' : 'Edit'}
                  </button>
                </div>
                {editing ? (
                  <Textarea
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    className="min-h-[220px] text-sm font-mono text-gray-700 resize-none"
                    placeholder="**News Agency:** &#10;&#10;**Reporter:** &#10;&#10;**Deadline:** &#10;&#10;**Topic:**"
                  />
                ) : (
                  <div className="space-y-0.5 description-content bg-gray-50 rounded-md p-3 min-h-[100px]">
                    {task.description ? renderDescription(task.description) : (
                      <p className="text-sm text-gray-400 italic">No description — click Edit to add one.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Checklist */}
              {totalItems > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Checklist
                    </Label>
                    <span className="text-xs text-gray-400">
                      {completedItems}/{totalItems}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all"
                        style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {draft.checklist.map((item, idx) => (
                      <label key={idx} className="flex items-start gap-2.5 cursor-pointer group">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleChecklistToggle(idx)}
                          className="mt-0.5"
                        />
                        <span
                          className={cn(
                            'text-sm leading-snug select-none',
                            item.completed ? 'line-through text-gray-400' : 'text-gray-700 group-hover:text-gray-900'
                          )}
                        >
                          {item.item}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: Meta fields */}
            <div className="px-4 py-4 space-y-4 text-sm bg-gray-50/50">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  Status
                </Label>
                {editing ? (
                  <Select
                    value={draft.progress}
                    onValueChange={(v) => setDraft({ ...draft, progress: v as Task['progress'] })}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_COLORS[task.progress])}>
                    {task.progress}
                  </span>
                )}
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  Priority
                </Label>
                {editing ? (
                  <Select
                    value={draft.priority}
                    onValueChange={(v) => setDraft({ ...draft, priority: v })}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={cn('text-xs border', PRIORITY_BADGE_COLORS[task.priority])} variant="outline">
                    {task.priority}
                  </Badge>
                )}
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  Assigned To
                </Label>
                {editing ? (
                  <Input
                    value={draft.assignedTo.join('; ')}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        assignedTo: e.target.value.split(';').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="h-8 text-sm"
                    placeholder="Name; Name"
                  />
                ) : (
                  <div className="space-y-0.5">
                    {task.assignedTo.length > 0 ? (
                      task.assignedTo.map((p) => (
                        <p key={p} className="text-gray-700 text-xs">{p}</p>
                      ))
                    ) : (
                      <p className="text-gray-400 text-xs italic">Unassigned</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  Due Date
                </Label>
                {editing ? (
                  <Input
                    type="date"
                    value={draft.dueDate}
                    onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                    className="h-8 text-sm"
                  />
                ) : (
                  <p className={cn('text-xs', overdue ? 'text-red-600 font-medium' : 'text-gray-700')}>
                    {formatDate(task.dueDate) || '—'}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  Start Date
                </Label>
                {editing ? (
                  <Input
                    type="date"
                    value={draft.startDate}
                    onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                    className="h-8 text-sm"
                  />
                ) : (
                  <p className="text-xs text-gray-700">{formatDate(task.startDate) || '—'}</p>
                )}
              </div>

              {task.completedDate && (
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                    Completed
                  </Label>
                  <p className="text-xs text-gray-700">{formatDate(task.completedDate)}</p>
                  {task.completedBy && (
                    <p className="text-xs text-gray-500">{task.completedBy}</p>
                  )}
                </div>
              )}

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  Labels
                </Label>
                {editing ? (
                  <Input
                    value={draft.labels}
                    onChange={(e) => setDraft({ ...draft, labels: e.target.value })}
                    className="h-8 text-sm"
                    placeholder="label1, label2"
                  />
                ) : (
                  <p className="text-xs text-gray-700">{task.labels || '—'}</p>
                )}
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  Created
                </Label>
                <p className="text-xs text-gray-500">
                  {formatDate(task.createdDate)}
                  {task.createdBy && ` · ${task.createdBy}`}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t gap-2">
          {task.progress !== 'Archive' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onArchive(task)}
              className="text-gray-600 mr-auto"
            >
              <Archive className="h-4 w-4 mr-1.5" />
              Archive
            </Button>
          )}
          {task.progress === 'Archive' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSave({ ...task, progress: 'Not started' })}
              className="text-gray-600 mr-auto"
            >
              Restore
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          {editing && (
            <Button size="sm" onClick={handleSave} className="bg-violet-700 hover:bg-violet-800">
              <Save className="h-4 w-4 mr-1.5" />
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
