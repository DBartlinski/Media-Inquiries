export type Priority = 'Urgent' | 'Important' | 'Medium' | 'Low';
export type Progress = 'Not started' | 'In progress' | 'Completed' | 'Archive';
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export interface ChecklistItem {
  item: string;
  completed: boolean;
}

export interface Task {
  id: string;
  name: string;
  bucket: string;
  progress: Progress;
  priority: string;
  assignedTo: string[];
  createdBy: string;
  createdDate: string;
  startDate: string;
  dueDate: string;
  isRecurring: boolean;
  late: boolean;
  completedDate: string;
  completedBy: string;
  checklist: ChecklistItem[];
  labels: string;
  description: string;
  localEditTimestamp?: string;
}

export interface DataStore {
  version: number;
  lastImported: string;
  tasks: Task[];
}

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
}

export interface ImportDiff {
  newTasks: Task[];
  updatedTasks: Array<{ original: Task; updated: Task; changedFields: string[] }>;
  unchangedCount: number;
}

export interface FilterState {
  search: string;
  priority: string[];
  status: string[];
  dateFrom: string;
  dateTo: string;
  includeArchive: boolean;
}
