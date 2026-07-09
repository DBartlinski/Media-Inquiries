import { useState, useEffect, useRef, useCallback } from 'react'
import type { Task, DataStore, GitHubConfig, SyncStatus, ImportDiff } from '@/types'
import { fetchDataFromGitHub, commitDataToGitHub } from '@/utils/github'
import { applyImportDiff } from '@/utils/csvParser'
import { generateTaskId } from '@/utils/taskUtils'
import { parseDescriptionFields } from '@/utils/descriptionParser'

const CACHE_KEY = 'tasks_cache'

/** Backfill new structured fields for tasks that predate these fields */
function migrateTaskFields(tasks: Task[]): { tasks: Task[]; changed: boolean } {
  let changed = false
  const migrated = tasks.map((t) => {
    if (t.newsOutlet !== undefined && t.reporter !== undefined &&
        t.subject !== undefined && t.sourceSme !== undefined) {
      return t
    }
    changed = true
    const parsed = parseDescriptionFields(t.description)
    return {
      ...t,
      newsOutlet: t.newsOutlet ?? parsed.newsOutlet,
      reporter: t.reporter ?? parsed.reporter,
      subject: t.subject ?? parsed.subject,
      sourceSme: t.sourceSme ?? parsed.sourceSme,
    }
  })
  return { tasks: migrated, changed }
}

function loadCache(): DataStore | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as DataStore) : null
  } catch {
    return null
  }
}

function saveCache(data: DataStore) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // localStorage may be full — non-critical
  }
}

export function useTasks(config: GitHubConfig | null) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const shaRef = useRef<string | undefined>(undefined)

  const buildStore = useCallback(
    (updatedTasks: Task[]): DataStore => ({
      version: 1,
      lastImported: new Date().toISOString(),
      tasks: updatedTasks,
    }),
    []
  )

  const syncToGitHub = useCallback(
    async (updatedTasks: Task[], message: string) => {
      if (!config) return
      setSyncStatus('syncing')
      setError(null)
      try {
        const store = buildStore(updatedTasks)
        const newSha = await commitDataToGitHub(config, store, message, shaRef.current)
        shaRef.current = newSha
        saveCache(store)
        setSyncStatus('synced')
      } catch (err) {
        setSyncStatus('error')
        setError(err instanceof Error ? err.message : 'Sync failed')
      }
    },
    [config, buildStore]
  )

  const reload = useCallback(async () => {
    if (!config) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDataFromGitHub(config)
      const migration = migrateTaskFields(data.tasks)
      setTasks(migration.tasks)
      saveCache({ ...data, tasks: migration.tasks })
      setSyncStatus('synced')
      if (migration.changed) {
        const store = { ...data, tasks: migration.tasks }
        try {
          await commitDataToGitHub(config, store, 'Migrate: backfill structured fields', shaRef.current)
        } catch {
          // Non-critical — next save will persist
        }
      }
    } catch (err) {
      const cached = loadCache()
      if (cached) {
        const migration = migrateTaskFields(cached.tasks)
        setTasks(migration.tasks)
        setError('Could not reach GitHub — showing cached data.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      }
      setSyncStatus('error')
    } finally {
      setLoading(false)
    }
  }, [config])

  useEffect(() => {
    if (!config) {
      setTasks([])
      return
    }
    void reload()
  }, [config, reload])

  const addTask = useCallback(
    async (partial: Omit<Task, 'id'>) => {
      const newTask: Task = { ...partial, id: generateTaskId() }
      const updated = [...tasks, newTask]
      setTasks(updated)
      await syncToGitHub(updated, `Add: ${newTask.name}`)
    },
    [tasks, syncToGitHub]
  )

  const updateTask = useCallback(
    async (updated: Task) => {
      const timestamped = { ...updated, localEditTimestamp: new Date().toISOString() }
      const updatedList = tasks.map((t) => (t.id === updated.id ? timestamped : t))
      setTasks(updatedList)
      await syncToGitHub(updatedList, `Update: ${updated.name}`)
    },
    [tasks, syncToGitHub]
  )

  const importTasks = useCallback(
    async (diff: ImportDiff) => {
      const merged = applyImportDiff(tasks, diff)
      setTasks(merged)
      await syncToGitHub(
        merged,
        `CSV import: ${diff.newTasks.length} new, ${diff.updatedTasks.length} updated`
      )
    },
    [tasks, syncToGitHub]
  )

  return {
    tasks,
    loading,
    error,
    syncStatus,
    addTask,
    updateTask,
    importTasks,
    reload,
  }
}
