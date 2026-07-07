import { Database, Plus, Upload, RefreshCw, Settings, CheckCircle2, AlertCircle, Loader2, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SyncStatus } from '@/types'

interface HeaderProps {
  syncStatus: SyncStatus
  error: string | null
  onAddTask: () => void
  onImport: () => void
  onToggleSidebar: () => void
  onSettings: () => void
  onRefresh: () => void
  sidebarOpen: boolean
}

function SyncIndicator({ status }: { status: SyncStatus }) {
  if (status === 'syncing')
    return (
      <span className="flex items-center gap-1 text-xs text-violet-200">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    )
  if (status === 'synced')
    return (
      <span className="flex items-center gap-1 text-xs text-green-300">
        <CheckCircle2 className="h-3 w-3" /> Saved
      </span>
    )
  if (status === 'error')
    return (
      <span className="flex items-center gap-1 text-xs text-red-300">
        <AlertCircle className="h-3 w-3" /> Sync error
      </span>
    )
  return null
}

export function Header({
  syncStatus,
  error,
  onAddTask,
  onImport,
  onToggleSidebar,
  onSettings,
  onRefresh,
  sidebarOpen,
}: HeaderProps) {
  return (
    <div className="flex flex-col shrink-0">
      <header className="bg-violet-800 text-white px-4 h-14 flex items-center gap-3 shadow-md">
        {/* Sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="text-violet-200 hover:text-white transition-colors p-1 rounded"
          title={sidebarOpen ? 'Hide filters' : 'Show filters'}
        >
          {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 mr-2">
          <Database className="h-5 w-5 text-violet-300" />
          <span className="font-semibold text-base tracking-tight">VA Research Media Inquiries</span>
          <span className="text-violet-400 text-xs hidden sm:block">· ORD Communications</span>
        </div>

        <div className="flex-1" />

        {/* Sync status */}
        <SyncIndicator status={syncStatus} />

        {/* Action buttons */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onRefresh}
          className="text-violet-200 hover:text-white hover:bg-violet-700"
          title="Refresh from GitHub"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onImport}
          className="text-violet-200 hover:text-white hover:bg-violet-700"
        >
          <Upload className="h-4 w-4 mr-1.5" />
          Import CSV
        </Button>

        <Button
          size="sm"
          onClick={onAddTask}
          className="bg-white text-violet-800 hover:bg-violet-50 font-semibold"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Inquiry
        </Button>

        <button
          onClick={onSettings}
          className="text-violet-300 hover:text-white transition-colors p-1 rounded ml-1"
          title="Disconnect / change GitHub repo"
        >
          <Settings className="h-4 w-4" />
        </button>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
