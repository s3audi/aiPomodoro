import React, { useMemo } from 'react';
import type { WorkPackage, Task, Worker } from '../types';
import { TaskStatus } from '../types';
import TaskCard from './TaskCard';
import { PackageIcon, TrashIcon } from './icons';

const companyColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981',
    '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#d946ef', '#ec4899', '#f43f5e',
];

const stringToColor = (str: string): string => {
  if (!str) return '#64748b'; // slate-500
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % companyColors.length);
  return companyColors[index];
};


interface WorkPackageCardProps {
  workPackage: WorkPackage;
  workers: Worker[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onToggleTaskWorker: (taskId: string, workerId: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  onDeletePackage: (packageId: string, packageTitle: string) => void;
  onUpdateTaskDuration: (taskId: string, newDurationMinutes: number) => void;
  onUpdateTaskNotes: (taskId: string, notes: string) => void;
  onEditWorker: (workerId: string) => void;
  onUpdateCompanyFilter: (packageId: string, company: string) => void;
}

const WorkPackageCard: React.FC<WorkPackageCardProps> = ({ 
  workPackage, 
  workers, 
  onUpdateTaskStatus, 
  onToggleTaskWorker, 
  onToggleSubTask, 
  onDeletePackage,
  onUpdateTaskDuration,
  onUpdateTaskNotes,
  onEditWorker,
  onUpdateCompanyFilter
}) => {
  const completedTasks = workPackage.tasks.filter(t => t.status === TaskStatus.Completed).length;
  const totalTasks = workPackage.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const isCompleted = workPackage.tasks.every(task => task.status === TaskStatus.Completed);

  const handleDelete = () => {
    // Confirmation is now handled by the parent component
    onDeletePackage(workPackage.id, workPackage.title);
  };
  
  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    workers.forEach(worker => {
        if (worker.company) {
            companies.add(worker.company);
        }
    });
    return Array.from(companies).sort();
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    if (!workPackage.companyFilter) {
        return workers;
    }
    return workers.filter(w => w.company === workPackage.companyFilter);
  }, [workers, workPackage.companyFilter]);


  return (
    <div className="p-6 mb-6 bg-white border border-slate-200 rounded-xl shadow-md">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="p-3 bg-slate-100 rounded-lg flex-shrink-0">
            <PackageIcon className="w-6 h-6 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{workPackage.title}</h3>
                {workPackage.company && (
                    <span 
                        className="text-xs font-semibold text-white px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{ backgroundColor: stringToColor(workPackage.company) }}
                    >
                        {workPackage.company}
                    </span>
                )}
            </div>
            <p className="text-base text-slate-500 mt-1">{workPackage.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            {uniqueCompanies.length > 0 && !isCompleted && (
                 <select
                    value={workPackage.companyFilter || 'all'}
                    onChange={(e) => onUpdateCompanyFilter(workPackage.id, e.target.value)}
                    className="block w-full max-w-xs pl-3 pr-8 py-1.5 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-slate-50 text-slate-700"
                    aria-label="Şirkete göre filtrele"
                  >
                    <option value="all">Tüm Şirketler</option>
                    {uniqueCompanies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
            )}
            {!isCompleted && (
              <button 
                onClick={handleDelete}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
                aria-label="İş paketini sil"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
        </div>
      </div>
      
      <div className="mb-4">
          <div className="flex justify-between mb-1 text-base font-medium text-slate-600">
              <span>İlerleme</span>
              <span>{completedTasks} / {totalTasks} Tamamlandı</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
          </div>
      </div>

      <div>
        {workPackage.tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            workers={filteredWorkers}
            onUpdateStatus={(newStatus) => onUpdateTaskStatus(task.id, newStatus)}
            onToggleWorker={(workerId) => onToggleTaskWorker(task.id, workerId)}
            onToggleSubTask={(subTaskId) => onToggleSubTask(task.id, subTaskId)}
            onUpdateTaskDuration={(newDuration) => onUpdateTaskDuration(task.id, newDuration)}
            onUpdateTaskNotes={(notes) => onUpdateTaskNotes(task.id, notes)}
            onEditWorker={onEditWorker}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkPackageCard;