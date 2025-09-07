import React, { useState } from 'react';
import type { Task, Worker, SubTask } from '../types';
import { TaskStatus } from '../types';
import { POMODORO_DURATION_SECONDS } from '../constants';
import PomodoroTimer from './PomodoroTimer';
import { CheckCircleIcon, UsersIcon, SaveIcon, RotateCcwIcon } from './icons';

interface TaskCardProps {
  task: Task;
  workers: Worker[];
  onUpdateStatus: (newStatus: TaskStatus) => void;
  onToggleWorker: (workerId: string) => void;
  onToggleSubTask: (subTaskId: string) => void;
  onUpdateTaskDuration: (newDurationMinutes: number) => void;
  onUpdateTaskNotes: (notes: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, workers, onUpdateStatus, onToggleWorker, onToggleSubTask, onUpdateTaskDuration, onUpdateTaskNotes }) => {
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [editableDuration, setEditableDuration] = useState(String(task.durationSeconds ? task.durationSeconds / 60 : 25));
  const [managerNotes, setManagerNotes] = useState(task.managerNotes || '');


  const getWorkerById = (id: string): Worker | undefined => workers.find(w => w.id === id);

  const assignedWorkers = task.assignedWorkerIds.map(getWorkerById).filter(Boolean) as Worker[];
  const unassignedWorkers = workers.filter(w => !task.assignedWorkerIds.includes(w.id));
  
  const completedSubTasks = task.subTasks.filter(st => st.completed).length;
  const totalSubTasks = task.subTasks.length;
  const subTaskProgress = totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0;

  const handleStart = () => {
    onUpdateStatus(TaskStatus.Active);
  };
  
  const handleFinish = () => {
    onUpdateStatus(TaskStatus.Completed);
  };

  const handleDurationSave = () => {
    const newDurationMinutes = parseInt(editableDuration, 10);
    if (!isNaN(newDurationMinutes) && newDurationMinutes > 0) {
      onUpdateTaskDuration(newDurationMinutes);
    } else {
      setEditableDuration(String(task.durationSeconds ? task.durationSeconds / 60 : 25));
    }
    setIsEditingDuration(false);
  };

  const handleDurationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDurationSave();
    } else if (e.key === 'Escape') {
      setEditableDuration(String(task.durationSeconds ? task.durationSeconds / 60 : 25));
      setIsEditingDuration(false);
    }
  };
  
  const handleSaveNotes = () => {
    onUpdateTaskNotes(managerNotes);
  };

  const handleReopen = () => {
    if (window.confirm("Bu görevi yeniden açmak, ilerlemesini sıfırlayacaktır. Emin misiniz?")) {
      onUpdateStatus(TaskStatus.Pending);
    }
  };


  const getStatusBadge = () => {
    switch (task.status) {
      case TaskStatus.Pending:
        return <span className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-200 rounded-full">Bekliyor</span>;
      case TaskStatus.Active:
        return <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full animate-pulse">Aktif</span>;
      case TaskStatus.Completed:
        return <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Tamamlandı</span>;
    }
  };

  return (
    <div className={`p-4 mb-3 transition-shadow duration-300 bg-white border-l-4 rounded-r-lg shadow-sm ${
      task.status === TaskStatus.Active ? 'border-blue-500 shadow-lg' : 
      task.status === TaskStatus.Completed ? 'border-green-500 opacity-70' : 
      'border-slate-300 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <h4 className="font-semibold text-base text-slate-800">{task.title}</h4>
          {task.status === TaskStatus.Pending && (
            !isEditingDuration ? (
              <p 
                className="text-base text-slate-500 mt-1 cursor-pointer"
                onDoubleClick={() => setIsEditingDuration(true)}
                title="Süreyi düzenlemek için çift tıklayın"
              >
                Tahmini Süre: {task.durationSeconds ? `${task.durationSeconds / 60} dakika` : '25 dakika'}
              </p>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <label htmlFor={`duration-${task.id}`} className="text-base text-slate-500">Süre:</label>
                <input
                  id={`duration-${task.id}`}
                  type="number"
                  value={editableDuration}
                  onChange={(e) => setEditableDuration(e.target.value)}
                  onBlur={handleDurationSave}
                  onKeyDown={handleDurationKeyDown}
                  className="w-20 px-2 py-1 text-base border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                  autoFocus
                />
                <span className="text-base text-slate-500">dakika</span>
              </div>
            )
          )}
        </div>
        {getStatusBadge()}
      </div>

      {task.status === TaskStatus.Active && task.startTime && (
        <PomodoroTimer 
            startTime={task.startTime} 
            onComplete={handleFinish} 
            durationSeconds={task.durationSeconds || POMODORO_DURATION_SECONDS}
        />
      )}

      {task.subTasks.length > 0 && task.status !== TaskStatus.Pending && (
        <div className="mt-4">
          <div className="flex justify-between mb-1 text-base font-medium text-slate-600">
              <span>Alt Görevler</span>
              <span>{completedSubTasks} / {totalSubTasks}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{width: `${subTaskProgress}%`}}></div>
          </div>
          <div className="mt-2 space-y-1">
            {task.subTasks.map(subTask => (
              <label key={subTask.id} className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer ${task.status === TaskStatus.Completed ? 'cursor-default' : 'hover:bg-slate-50'}`}>
                <input
                  type="checkbox"
                  checked={subTask.completed}
                  onChange={() => task.status !== TaskStatus.Completed && onToggleSubTask(subTask.id)}
                  disabled={task.status === TaskStatus.Completed}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-base ${subTask.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{subTask.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
            <h5 className="text-base font-medium text-slate-500">Görevdeki Ekip</h5>
            {task.status === TaskStatus.Pending && (
                <button 
                    onClick={() => setIsEditingTeam(!isEditingTeam)} 
                    className={`text-sm font-semibold flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${isEditingTeam ? 'bg-blue-100 text-blue-700' : 'text-blue-600 hover:bg-blue-50'}`}
                >
                    <UsersIcon className="w-4 h-4" />
                    {isEditingTeam ? 'Kaydet' : 'Ekibi Düzenle'}
                </button>
            )}
        </div>

        {isEditingTeam && task.status === TaskStatus.Pending ? (
            <div className="pt-2 pb-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {workers.map(worker => (
                        <label key={worker.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={task.assignedWorkerIds.includes(worker.id)}
                                onChange={() => onToggleWorker(worker.id)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <img src={worker.avatar} alt={worker.name} className="w-6 h-6 rounded-full" />
                            <span className={`text-base ${task.assignedWorkerIds.includes(worker.id) ? 'font-bold text-blue-600' : 'text-slate-800'}`}>{worker.name}</span>
                        </label>
                    ))}
                </div>
            </div>
        ) : (
            <div className="flex flex-wrap items-center gap-2 min-h-[40px]">
              {assignedWorkers.length > 0 ? (
                assignedWorkers.map(worker => (
                  <div key={worker.id} className="flex items-center gap-2 px-2 py-1 text-base bg-slate-100 rounded-full">
                    <img src={worker.avatar} alt={worker.name} className="w-6 h-6 rounded-full" />
                    <span className="text-slate-800">{worker.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-base text-slate-400 italic">
                  {task.status === TaskStatus.Pending ? "Henüz kimse atanmadı." : "Henüz kimse katılmadı."}
                </p>
              )}
            </div>
        )}
      </div>

      {task.status === TaskStatus.Active && unassignedWorkers.length > 0 && (
        <div className="mt-4 pt-3 border-t">
          <h5 className="text-base font-medium text-slate-500 mb-2">Katılabilecek Personel</h5>
          <div className="flex flex-wrap gap-2">
            {unassignedWorkers.map(worker => (
              <button key={worker.id} onClick={() => onToggleWorker(worker.id)} className="flex items-center gap-2 px-3 py-1.5 text-base bg-white border border-slate-300 rounded-full hover:bg-slate-50 transition-colors">
                <img src={worker.avatar} alt={worker.name} className="w-5 h-5 rounded-full" />
                {worker.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {task.status === TaskStatus.Completed && (
         <>
          <div className="flex items-center gap-2 mt-4 text-green-600">
              <CheckCircleIcon className="w-5 h-5" />
              <p className="text-base font-semibold">Görev başarıyla tamamlandı.</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h5 className="text-base font-medium text-slate-600 mb-2">Müdür Değerlendirmesi</h5>
            <textarea
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              placeholder="Bu görevle ilgili notlarınızı buraya ekleyin..."
              className="w-full p-2 text-base border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
            <div className="flex items-center justify-end gap-2 mt-2">
               <button onClick={handleSaveNotes} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                <SaveIcon className="w-4 h-4" />
                Notları Kaydet
              </button>
              <button onClick={handleReopen} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors">
                <RotateCcwIcon className="w-4 h-4" />
                Görevi Tekrar Aç
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end mt-4">
        {task.status === TaskStatus.Pending && (
          <button 
            onClick={handleStart} 
            disabled={assignedWorkers.length === 0}
            className="px-4 py-2 text-base font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            Görevi Başlat
          </button>
        )}
        {task.status === TaskStatus.Active && (
          <button onClick={handleFinish} className="px-4 py-2 text-base font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
            Görevi Bitir (Ekip Şefi)
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;