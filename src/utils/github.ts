import type { DataStore, GitHubConfig } from '@/types'

const API_BASE = 'https://api.github.com'

function encodeBase64Unicode(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  )
}

function decodeBase64Unicode(base64: string): string {
  return decodeURIComponent(
    atob(base64.replace(/\s/g, ''))
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }
}

export async function validateToken(config: GitHubConfig): Promise<void> {
  const url = `${API_BASE}/repos/${config.owner}/${config.repo}`
  const res = await fetch(url, { headers: headers(config.token) })
  if (res.status === 401) throw new Error('Invalid token. Check your Personal Access Token.')
  if (res.status === 404) throw new Error('Repository not found. Check owner and repo name.')
  if (!res.ok) throw new Error(`GitHub error: ${res.status}`)
}

interface FileInfo {
  content: string
  sha: string
}

async function getFile(config: GitHubConfig): Promise<FileInfo | null> {
  const url = `${API_BASE}/repos/${config.owner}/${config.repo}/contents/${config.filePath}?ref=${config.branch}`
  const res = await fetch(url, { headers: headers(config.token) })
  if (res.status === 404) return null
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message || `GitHub API error: ${res.status}`)
  }
  return res.json() as Promise<FileInfo>
}

export async function fetchDataFromGitHub(config: GitHubConfig): Promise<DataStore> {
  const file = await getFile(config)
  if (!file) {
    return { version: 1, lastImported: new Date().toISOString(), tasks: [] }
  }
  const json = decodeBase64Unicode(file.content)
  return JSON.parse(json) as DataStore
}

export async function commitDataToGitHub(
  config: GitHubConfig,
  data: DataStore,
  message: string,
  knownSha?: string
): Promise<string> {
  const url = `${API_BASE}/repos/${config.owner}/${config.repo}/contents/${config.filePath}`

  let sha = knownSha
  if (!sha) {
    const file = await getFile(config)
    if (file) sha = file.sha
  }

  const body: Record<string, string> = {
    message,
    content: encodeBase64Unicode(JSON.stringify(data, null, 2)),
    branch: config.branch,
  }
  if (sha) body.sha = sha

  const res = await fetch(url, {
    method: 'PUT',
    headers: headers(config.token),
    body: JSON.stringify(body),
  })

  // Conflict: file changed externally — retry with fresh SHA
  if (res.status === 409) {
    return commitDataToGitHub(config, data, message)
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message || `GitHub commit failed: ${res.status}`)
  }

  const result = await res.json() as { content: { sha: string } }
  return result.content.sha
}
