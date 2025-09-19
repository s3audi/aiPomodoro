export enum TaskStatus {
  Pending = 'PENDING',
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
}

export interface Worker {
  id: string;
  name: string;
  avatar: string;
  company?: string;
  position?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completionTime?: number;
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
  company?: string;
  companyFilter?: string;
  imageUrl?: string;
  pdfUrl?: string;
}

export interface AppState {
  workPackages: WorkPackage[];
  workers: Worker[];
  templates?: WorkPackageTemplate[];
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