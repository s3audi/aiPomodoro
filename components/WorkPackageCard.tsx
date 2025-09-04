import React from 'react';
import type { WorkPackage, Task, Worker } from '../types';
import { TaskStatus } from '../types';
import TaskCard from './TaskCard';
import { PackageIcon, TrashIcon } from './icons';

interface WorkPackageCardProps {
  workPackage: WorkPackage;
  workers: Worker[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onToggleTaskWorker: (taskId: string, workerId: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  onDeletePackage: (packageId: string, packageTitle: string) => void;
  onUpdateTaskDuration: (taskId: string, newDurationMinutes: number) => void;
  onUpdateTaskNotes: (taskId: string, notes: string) => void;
}

const WorkPackageCard: React.FC<WorkPackageCardProps> = ({ 
  workPackage, 
  workers, 
  onUpdateTaskStatus, 
  onToggleTaskWorker, 
  onToggleSubTask, 
  onDeletePackage,
  onUpdateTaskDuration,
  onUpdateTaskNotes
}) => {
  const completedTasks = workPackage.tasks.filter(t => t.status === TaskStatus.Completed).length;
  const totalTasks = workPackage.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const isCompleted = workPackage.tasks.every(task => task.status === TaskStatus.Completed);

  const handleDelete = () => {
    // Confirmation is now handled by the parent component
    onDeletePackage(workPackage.id, workPackage.title);
  };


  return (
    <div className="p-6 mb-6 bg-white border border-slate-200 rounded-xl shadow-md">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="p-3 bg-slate-100 rounded-lg flex-shrink-0">
            <PackageIcon className="w-6 h-6 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{workPackage.title}</h3>
            <p className="text-base text-slate-500">{workPackage.description}</p>
          </div>
        </div>
        {!isCompleted && (
          <button 
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors flex-shrink-0"
            aria-label="İş paketini sil"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
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
            workers={workers}
            onUpdateStatus={(newStatus) => onUpdateTaskStatus(task.id, newStatus)}
            onToggleWorker={(workerId) => onToggleTaskWorker(task.id, workerId)}
            onToggleSubTask={(subTaskId) => onToggleSubTask(task.id, subTaskId)}
            onUpdateTaskDuration={(newDuration) => onUpdateTaskDuration(task.id, newDuration)}
            onUpdateTaskNotes={(notes) => onUpdateTaskNotes(task.id, notes)}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkPackageCard;
