import { useState } from 'react'
import { Github, Lock, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateToken } from '@/utils/github'
import type { GitHubConfig } from '@/types'

interface AuthModalProps {
  onSave: (config: GitHubConfig) => void
}

export function AuthModal({ onSave }: AuthModalProps) {
  const [token, setToken] = useState('')
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [branch, setBranch] = useState('main')
  const [filePath, setFilePath] = useState('data.json')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConnect() {
    if (!token || !owner || !repo) {
      setError('Token, owner, and repo are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const config: GitHubConfig = { token, owner, repo, branch, filePath }
      await validateToken(config)
      onSave(config)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        {/* Logo area */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-violet-700 rounded-lg p-2">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">VA Research Media Inquiries</h1>
            <p className="text-sm text-gray-500">ORD Communications</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <Lock className="h-4 w-4 text-blue-500 shrink-0" />
          <span>
            Connect to a GitHub repository to store and sync your inquiry data. Your token is saved
            locally in this browser only.
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="token">GitHub Personal Access Token</Label>
            <Input
              id="token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Needs <code className="bg-gray-100 px-1 rounded">repo</code> scope.{' '}
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=Media+Inquiries+Dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-violet-600 hover:underline"
              >
                Generate one here →
              </a>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="owner">GitHub Owner</Label>
              <Input
                id="owner"
                placeholder="your-username"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="repo">Repository</Label>
              <Input
                id="repo"
                placeholder="media-inquiries-data"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                placeholder="main"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="filePath">Data file path</Label>
              <Input
                id="filePath"
                placeholder="data.json"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <Button
            className="w-full bg-violet-700 hover:bg-violet-800"
            onClick={() => void handleConnect()}
            disabled={loading}
          >
            <Github className="mr-2 h-4 w-4" />
            {loading ? 'Connecting…' : 'Connect to GitHub'}
          </Button>
        </div>

        <p className="text-xs text-center text-gray-400 mt-6">
          First time? Create an empty GitHub repo, then connect here. Import your CSV to populate
          data.
        </p>
      </div>
    </div>
  )
}
