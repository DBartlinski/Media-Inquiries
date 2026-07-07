import { useState } from 'react'
import type { GitHubConfig } from '@/types'

const CONFIG_KEY = 'github_config'

export function useGitHub() {
  const [config, setConfig] = useState<GitHubConfig | null>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_KEY)
      return saved ? (JSON.parse(saved) as GitHubConfig) : null
    } catch {
      return null
    }
  })

  function saveConfig(newConfig: GitHubConfig) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig))
    setConfig(newConfig)
  }

  function clearConfig() {
    localStorage.removeItem(CONFIG_KEY)
    setConfig(null)
  }

  return {
    config,
    isConfigured: config !== null,
    saveConfig,
    clearConfig,
  }
}
