import { Calendar, CheckSquare, User } from 'lucide-react'
import type { Task } from '@/types'
import { formatDate, isOverdue, PRIORITY_COLORS, PRIORITY_BADGE_COLORS, getInitials } from '@/utils/taskUtils'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onClick: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const completedItems = task.checklist.filter((c) => c.completed).length
  const totalItems = task.checklist.length
  const overdue = isOverdue(task.dueDate) && task.progress !== 'Completed'
  const priorityBar = PRIORITY_COLORS[task.priority] ?? 'bg-gray-300'
  const priorityBadge = PRIORITY_BADGE_COLORS[task.priority] ?? 'bg-gray-100 text-gray-600 border-gray-200'

  // Extract a description preview (first non-empty line)
  const descPreview = task.description
    .replace(/\*\*/g, '')
    .split('\n')
    .find((l) => l.trim().length > 0) ?? ''

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="group bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md hover:border-violet-300 cursor-pointer transition-all flex overflow-hidden"
    >
      {/* Priority color strip */}
      <div className={cn('w-1 shrink-0 rounded-l-md', priorityBar)} />

      <div className="flex-1 p-3 min-w-0">
        {/* Task name */}
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-1.5">
          {task.name}
        </p>

        {/* Description preview */}
        {descPreview && (
          <p className="text-xs text-gray-500 line-clamp-1 mb-2">{descPreview}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority badge */}
          <span className={cn('text-xs px-1.5 py-0.5 rounded border font-medium', priorityBadge)}>
            {task.priority}
          </span>

          {/* Due date */}
          {task.dueDate && (
            <span
              className={cn(
                'flex items-center gap-0.5 text-xs',
                overdue ? 'text-red-600 font-medium' : 'text-gray-500'
              )}
            >
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-2">
          {/* Checklist progress */}
          {totalItems > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <CheckSquare className="h-3 w-3" />
              <span>
                {completedItems}/{totalItems}
              </span>
              {/* Mini progress bar */}
              <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Assignees */}
          {task.assignedTo.length > 0 && (
            <div className="flex -space-x-1">
              {task.assignedTo.slice(0, 3).map((person) => (
                <div
                  key={person}
                  title={person}
                  className="w-5 h-5 rounded-full bg-violet-100 border border-white flex items-center justify-center text-[9px] font-bold text-violet-700 shrink-0"
                >
                  {getInitials(person)}
                </div>
              ))}
              {task.assignedTo.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[9px] font-bold text-gray-600">
                  +{task.assignedTo.length - 3}
                </div>
              )}
            </div>
          )}

          {!task.assignedTo.length && (
            <User className="h-3 w-3 text-gray-300" />
          )}
        </div>
      </div>
    </div>
  )
}
