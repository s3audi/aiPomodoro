export enum TaskStatus {
  Pending = 'PENDING',
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
}

export interface Worker {
  id: string;
  name: string;
  avatar: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assignedWorkerIds: string[];
  subTasks: SubTask[];
  startTime?: number;
  endTime?: number;
  durationSeconds?: number;
  managerNotes?: string;
}

export interface WorkPackage {
  id:string;
  title: string;
  description: string;
  tasks: Task[];
}

export interface AppState {
  workPackages: WorkPackage[];
  workers: Worker[];
  templates?: WorkPackageTemplate[];
  airtableRecordId?: string;
}

// For templates
export interface SubTaskTemplate {
  title: string;
}

export interface TaskTemplate {
  title: string;
  durationMinutes: number;
  subTasks: SubTaskTemplate[];
}

export interface WorkPackageTemplate {
  id: string;
  title: string;
  description: string;
  tasks: TaskTemplate[];
}