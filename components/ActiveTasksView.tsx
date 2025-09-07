import React from 'react';
import type { WorkPackage, Task, Worker } from '../types';
import { TaskStatus } from '../types';
import TaskCard from './TaskCard';
import { ZapIcon } from './icons';

interface ActiveTask {
    task: Task;
    workPackage: WorkPackage;
}

interface ActiveTasksViewProps {
  workPackages: WorkPackage[];
  workers: Worker[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onToggleTaskWorker: (taskId: string, workerId: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  onUpdateTaskDuration: (taskId: string, newDurationMinutes: number) => void;
  onUpdateTaskNotes: (taskId: string, notes: string) => void;
  onEditWorker: (workerId: string) => void;
}

const ActiveTasksView: React.FC<ActiveTasksViewProps> = ({
  workPackages,
  workers,
  onUpdateTaskStatus,
  onToggleTaskWorker,
  onToggleSubTask,
  onUpdateTaskDuration,
  onUpdateTaskNotes,
  onEditWorker,
}) => {
  const activeTasks: ActiveTask[] = [];
  workPackages.forEach(wp => {
    wp.tasks.forEach(task => {
      if (task.status === TaskStatus.Active) {
        activeTasks.push({ task, workPackage: wp });
      }
    });
  });

  return (
    <div className="p-6 mb-6 bg-white border border-slate-200 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-500 pb-2 mb-6">Devam Eden Aktif Görevler</h2>
      {activeTasks.length > 0 ? (
        <div className="space-y-6">
          {activeTasks.map(({ task, workPackage }) => (
            <div key={task.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm font-semibold text-slate-500 mb-2">
                    İş Paketi: <span className="text-slate-700">{workPackage.title}</span>
                </p>
                <TaskCard
                    task={task}
                    workers={workers}
                    onUpdateStatus={(newStatus) => onUpdateTaskStatus(task.id, newStatus)}
                    onToggleWorker={(workerId) => onToggleTaskWorker(task.id, workerId)}
                    onToggleSubTask={(subTaskId) => onToggleSubTask(task.id, subTaskId)}
                    onUpdateTaskDuration={(newDuration) => onUpdateTaskDuration(task.id, newDuration)}
                    onUpdateTaskNotes={(notes) => onUpdateTaskNotes(task.id, notes)}
                    onEditWorker={onEditWorker}
                />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-6">
          <div className="flex justify-center items-center mb-4">
              <ZapIcon className="w-12 h-12 text-slate-300" />
          </div>
          <p className="text-slate-500">Şu anda devam eden aktif bir görev bulunmuyor.</p>
          <p className="text-slate-400 text-sm mt-1">Bir görevi başlatmak için 'İş Paketleri' sekmesine gidin.</p>
        </div>
      )}
    </div>
  );
};

export default ActiveTasksView;