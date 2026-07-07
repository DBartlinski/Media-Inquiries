import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle2, Plus, RefreshCw, Minus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { parseCSV, buildImportDiff } from '@/utils/csvParser'
import type { Task, ImportDiff } from '@/types'

interface ImportModalProps {
  existingTasks: Task[]
  onClose: () => void
  onImport: (diff: ImportDiff) => void
}

type ImportStep = 'upload' | 'preview' | 'done'

export function ImportModal({ existingTasks, onClose, onImport }: ImportModalProps) {
  const [step, setStep] = useState<ImportStep>('upload')
  const [diff, setDiff] = useState<ImportDiff | null>(null)
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function processFile(file: File) {
    setParseError('')
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseError('Please select a .csv file.')
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      try {
        const csvTasks = parseCSV(text)
        if (csvTasks.length === 0) {
          setParseError('No valid tasks found in CSV. Check that the file has a Task ID column.')
          return
        }
        const importDiff = buildImportDiff(existingTasks, csvTasks)
        setDiff(importDiff)
        setStep('preview')
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse CSV')
      }
    }
    reader.readAsText(file)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function handleConfirmImport() {
    if (!diff) return
    onImport(diff)
    setStep('done')
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle>Import CSV</DialogTitle>
          <DialogDescription>
            Import from a Microsoft Planner CSV export. New tasks will be added; existing tasks will
            be updated (preserving local edits to status and checklist).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Step: Upload */}
          {step === 'upload' && (
            <div className="p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-300 hover:border-violet-400 hover:bg-gray-50'
                }`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Drop your CSV file here, or click to browse
                </p>
                <p className="text-xs text-gray-500">Microsoft Planner export format (.csv)</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>
              {parseError && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  {parseError}
                </p>
              )}
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && diff && (
            <>
              {/* Summary bar */}
              <div className="px-6 py-3 bg-gray-50 border-b flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5 text-green-700">
                  <Plus className="h-4 w-4" />
                  <span className="font-semibold">{diff.newTasks.length}</span> new
                </div>
                <div className="flex items-center gap-1.5 text-blue-700">
                  <RefreshCw className="h-4 w-4" />
                  <span className="font-semibold">{diff.updatedTasks.length}</span> updated
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Minus className="h-4 w-4" />
                  <span className="font-semibold">{diff.unchangedCount}</span> unchanged
                </div>
                <div className="ml-auto flex items-center gap-1 text-gray-500 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  {fileName}
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="px-6 py-3 space-y-3">
                  {diff.newTasks.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1.5">
                        New Inquiries ({diff.newTasks.length})
                      </p>
                      {diff.newTasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-green-50 group"
                        >
                          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                          <span className="text-sm text-gray-800 line-clamp-1 flex-1">{t.name}</span>
                          <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded shrink-0">
                            New
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {diff.updatedTasks.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1.5">
                        Updated Inquiries ({diff.updatedTasks.length})
                      </p>
                      {diff.updatedTasks.map(({ original, changedFields }) => (
                        <div key={original.id} className="py-1.5 px-2 rounded hover:bg-blue-50">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            <span className="text-sm text-gray-800 line-clamp-1 flex-1">
                              {original.name}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 ml-4 mt-0.5">
                            Changes: {changedFields.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {diff.newTasks.length === 0 && diff.updatedTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No changes detected. Your data is already up to date.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Import complete!</h3>
              <p className="text-sm text-gray-500 mb-1">
                {diff?.newTasks.length ?? 0} new · {diff?.updatedTasks.length ?? 0} updated
              </p>
              <p className="text-xs text-gray-400">Changes are being saved to GitHub…</p>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t gap-2">
          {step === 'upload' && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          )}
          {step === 'preview' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setStep('upload'); setDiff(null) }}
              >
                Choose different file
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmImport}
                disabled={diff?.newTasks.length === 0 && diff?.updatedTasks.length === 0}
                className="bg-violet-700 hover:bg-violet-800"
              >
                Confirm Import
              </Button>
            </>
          )}
          {step === 'done' && (
            <Button size="sm" onClick={onClose} className="bg-violet-700 hover:bg-violet-800">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
