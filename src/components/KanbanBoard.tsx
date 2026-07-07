import { Plus } from 'lucide-react'
import { TaskCard } from '@/components/TaskCard'
import { ScrollArea } from '@/components/ui/scroll-area'
import { KANBAN_COLUMNS } from '@/utils/taskUtils'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onAddTask: () => void
}

export function KanbanBoard({ tasks, onTaskClick, onAddTask }: KanbanBoardProps) {
  const isEmpty = tasks.filter((t) => t.progress !== 'Archive').length === 0

  return (
    <main className="flex-1 overflow-x-auto p-4">
      {isEmpty && (
        <div className="flex flex-col items-center justify-center h-full text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No inquiries yet</h2>
          <p className="text-sm text-gray-500 mb-4 max-w-xs">
            Import your CSV to populate the board, or create a new inquiry to get started.
          </p>
          <button
            onClick={onAddTask}
            className="text-sm text-violet-600 hover:text-violet-800 font-medium underline underline-offset-2"
          >
            + Add first inquiry
          </button>
        </div>
      )}

      {!isEmpty && (
        <div className="flex gap-4 h-full min-h-0">
          {KANBAN_COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.progress === col.id)
            return (
              <div
                key={col.id}
                className={cn(
                  'flex flex-col w-72 shrink-0 rounded-lg border-t-4 bg-gray-50',
                  col.color
                )}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-700">{col.label}</span>
                    <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  {col.id === 'In progress' && (
                    <button
                      onClick={onAddTask}
                      className="text-gray-400 hover:text-violet-600 transition-colors"
                      title="Add new inquiry"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Cards */}
                <ScrollArea className="flex-1 px-2 pb-2 kanban-column">
                  <div className="space-y-2 pt-0.5">
                    {columnTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                    ))}
                    {columnTasks.length === 0 && (
                      <div className="text-xs text-gray-400 text-center py-8">No tasks</div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )
          })}

          {/* Archive column — only show if archive tasks exist */}
          {tasks.some((t) => t.progress === 'Archive') && (
            <div className="flex flex-col w-72 shrink-0 rounded-lg border-t-4 border-gray-300 bg-gray-50 opacity-75">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="font-semibold text-sm text-gray-500">Archive</span>
                <span className="bg-gray-200 text-gray-500 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {tasks.filter((t) => t.progress === 'Archive').length}
                </span>
              </div>
              <ScrollArea className="flex-1 px-2 pb-2 kanban-column">
                <div className="space-y-2 pt-0.5">
                  {tasks
                    .filter((t) => t.progress === 'Archive')
                    .map((task) => (
                      <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                    ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
