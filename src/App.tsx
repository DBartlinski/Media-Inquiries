import { useState } from 'react'
import { useGitHub } from '@/hooks/useGitHub'
import { useTasks } from '@/hooks/useTasks'
import { AuthModal } from '@/components/AuthModal'
import { Header } from '@/components/Header'
import { SearchSidebar } from '@/components/SearchSidebar'
import { KanbanBoard } from '@/components/KanbanBoard'
import { TaskModal } from '@/components/TaskModal'
import { AddTaskForm } from '@/components/AddTaskForm'
import { ImportModal } from '@/components/ImportModal'
import { filterTasks } from '@/utils/taskUtils'
import type { Task, FilterState } from '@/types'

const DEFAULT_FILTERS: FilterState = {
  search: '',
  priority: [],
  status: [],
  dateFrom: '',
  dateTo: '',
  includeArchive: false,
}

export default function App() {
  const { config, isConfigured, saveConfig, clearConfig } = useGitHub()
  const { tasks, loading, error, syncStatus, addTask, updateTask, importTasks, reload } =
    useTasks(config)

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!isConfigured) {
    return <AuthModal onSave={saveConfig} />
  }

  const filteredTasks = filterTasks(tasks, filters)

  function handleUpdateTask(updated: Task) {
    void updateTask(updated)
    // Keep the modal open with the updated task
    setSelectedTask(updated)
  }

  function handleArchiveTask(task: Task) {
    void updateTask({ ...task, progress: 'Archive' })
    setSelectedTask(null)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        syncStatus={syncStatus}
        error={error}
        onAddTask={() => setIsAddingTask(true)}
        onImport={() => setIsImporting(true)}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onSettings={clearConfig}
        onRefresh={() => void reload()}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <SearchSidebar
            filters={filters}
            onChange={setFilters}
            taskCount={filteredTasks.length}
          />
        )}

        {loading ? (
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600">Loading from GitHub…</p>
            </div>
          </main>
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            onTaskClick={setSelectedTask}
            onAddTask={() => setIsAddingTask(true)}
          />
        )}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleUpdateTask}
          onArchive={handleArchiveTask}
        />
      )}

      {isAddingTask && (
        <AddTaskForm
          onClose={() => setIsAddingTask(false)}
          onSave={(task) => {
            void addTask(task)
            setIsAddingTask(false)
          }}
        />
      )}

      {isImporting && (
        <ImportModal
          existingTasks={tasks}
          onClose={() => setIsImporting(false)}
          onImport={(diff) => {
            void importTasks(diff)
            setIsImporting(false)
          }}
        />
      )}
    </div>
  )
}
