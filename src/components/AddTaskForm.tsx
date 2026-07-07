import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DEFAULT_CHECKLIST_ITEMS, DEFAULT_DESCRIPTION_TEMPLATE } from '@/utils/taskUtils'
import type { Task } from '@/types'

interface AddTaskFormProps {
  onClose: () => void
  onSave: (task: Omit<Task, 'id'>) => void
}

const PRIORITIES = ['Urgent', 'Important', 'Medium', 'Low']
const STATUSES: Task['progress'][] = ['Not started', 'In progress', 'Completed']

export function AddTaskForm({ onClose, onSave }: AddTaskFormProps) {
  const [name, setName] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [progress, setProgress] = useState<Task['progress']>('In progress')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION_TEMPLATE)
  const [labels, setLabels] = useState('')
  const [checklistItems, setChecklistItems] = useState<string[]>([...DEFAULT_CHECKLIST_ITEMS])
  const [newItem, setNewItem] = useState('')

  function addChecklistItem() {
    if (newItem.trim()) {
      setChecklistItems([...checklistItems, newItem.trim()])
      setNewItem('')
    }
  }

  function removeChecklistItem(idx: number) {
    setChecklistItems(checklistItems.filter((_, i) => i !== idx))
  }

  function handleSave() {
    if (!name.trim()) return
    const task: Omit<Task, 'id'> = {
      name: name.trim(),
      bucket: 'Media Inquiries',
      progress,
      priority,
      assignedTo: assignedTo.split(';').map((s) => s.trim()).filter(Boolean),
      createdBy: '',
      createdDate: new Date().toLocaleDateString('en-US'),
      startDate,
      dueDate,
      isRecurring: false,
      late: false,
      completedDate: '',
      completedBy: '',
      checklist: checklistItems.map((item) => ({ item, completed: false })),
      labels,
      description,
    }
    onSave(task)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle>New Media Inquiry</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Inquiry Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Study on Veterans mental health — Reuters"
                className="mt-1"
                autoFocus
              />
            </div>

            {/* Priority + Status row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  Priority
                </Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  Status
                </Label>
                <Select value={progress} onValueChange={(v) => setProgress(v as Task['progress'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assigned to + dates row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  Assigned To
                </Label>
                <Input
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Name; Name"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  Due Date
                </Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Labels */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                Labels
              </Label>
              <Input
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                placeholder="e.g., mental health, study"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[180px] text-sm font-mono"
                placeholder="**News Agency:**&#10;&#10;**Reporter:**&#10;&#10;**Deadline:**&#10;&#10;**Topic:**"
              />
            </div>

            {/* Checklist */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2">
                Workflow Checklist
              </Label>
              <div className="space-y-1.5 mb-2">
                {checklistItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 group">
                    <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                    <span className="text-sm text-gray-700 flex-1">{item}</span>
                    <button
                      onClick={() => removeChecklistItem(idx)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                  placeholder="Add checklist item…"
                  className="h-8 text-sm"
                />
                <Button variant="outline" size="sm" onClick={addChecklistItem} className="shrink-0">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!name.trim()}
            className="bg-violet-700 hover:bg-violet-800"
          >
            Create Inquiry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
