import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { WorkPackage, Worker, AppState, WorkPackageTemplate, Task } from './types';
import { TaskStatus } from './types';
import { INITIAL_WORKERS } from './constants';
import { TEMPLATES as INITIAL_TEMPLATES } from './templates';
import WorkPackageCreator from './components/WorkPackageCreator';
import WorkPackageCard from './components/WorkPackageCard';
import TeamManagement from './components/TeamManagement';
import TemplateSelector from './components/TemplateSelector';
import TemplateManagement from './components/TemplateManagement';
import { UploadIcon, DownloadIcon, UsersIcon, PackageIcon, ClipboardListIcon, DatabaseIcon } from './components/icons';
import { airSync, airFetch } from './services/airtableService';
import AirtableInfoModal from './components/AirtableInfoModal';
import AirtableFetchConfirmModal from './components/AirtableFetchConfirmModal';
import ConfirmModal from './components/ConfirmModal';

type View = 'packages' | 'team' | 'templates';
type DeleteTarget = { type: 'package' | 'worker' | 'template'; id: string; name: string };

const App: React.FC = () => {
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [templates, setTemplates] = useState<WorkPackageTemplate[]>(INITIAL_TEMPLATES);
  const [currentView, setCurrentView] = useState<View>('packages');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isAirtableModalOpen, setIsAirtableModalOpen] = useState(false);
  const [isAirtableFetchModalOpen, setIsAirtableFetchModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);


  const handleCreatePackage = useCallback((newPackage: WorkPackage) => {
    const firstWorkerId = workers[0]?.id;
    const packageToCreate = firstWorkerId
      ? {
          ...newPackage,
          tasks: newPackage.tasks.map(task => ({
            ...task,
            assignedWorkerIds: [firstWorkerId],
          })),
        }
      : newPackage;

    setWorkPackages(prev => [packageToCreate, ...prev]);
  }, [workers]);

  const handleCreatePackageFromTemplate = useCallback((template: WorkPackageTemplate) => {
    const firstWorkerId = workers[0]?.id;
    const newPackage: WorkPackage = {
        id: `wp-${Date.now()}`,
        title: template.title,
        description: template.description,
        tasks: template.tasks.map((taskTemplate, index): Task => ({
            id: `task-${Date.now()}-${index}`,
            title: taskTemplate.title,
            status: TaskStatus.Pending,
            assignedWorkerIds: firstWorkerId ? [firstWorkerId] : [],
            durationSeconds: taskTemplate.durationMinutes * 60,
            subTasks: taskTemplate.subTasks.map((st, stIndex) => ({
                id: `subtask-${Date.now()}-${index}-${stIndex}`,
                title: st.title,
                completed: false,
            })),
        })),
    };
    setWorkPackages(prev => [newPackage, ...prev]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [workers]);
  
  const handleUpdateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    setWorkPackages(prevPackages => {
      const newPackages = [...prevPackages];
      let wpIndex = -1;
      let taskIndex = -1;

      for (let i = 0; i < newPackages.length; i++) {
          const foundIndex = newPackages[i].tasks.findIndex(t => t.id === taskId);
          if (foundIndex !== -1) {
              wpIndex = i;
              taskIndex = foundIndex;
              break;
          }
      }

      if (wpIndex === -1 || taskIndex === -1) {
          return prevPackages;
      }

      const targetTask = newPackages[wpIndex].tasks[taskIndex];
      const updatedTask = { ...targetTask, status: newStatus };

      if (targetTask.status === TaskStatus.Completed && newStatus === TaskStatus.Pending) {
          updatedTask.startTime = undefined;
          updatedTask.endTime = undefined;
          updatedTask.managerNotes = '';
          updatedTask.subTasks = targetTask.subTasks.map(st => ({ ...st, completed: false, completionTime: undefined }));
      }
      if (newStatus === TaskStatus.Active && !targetTask.startTime) {
          updatedTask.startTime = Date.now();
      }
      if (newStatus === TaskStatus.Completed && !targetTask.endTime) {
          updatedTask.endTime = Date.now();
      }

      newPackages[wpIndex].tasks[taskIndex] = updatedTask;
      return newPackages;
    });
  }, []);
  
  const handleUpdateTaskDuration = useCallback((taskId: string, newDurationMinutes: number) => {
    setWorkPackages(prevPackages =>
        prevPackages.map(wp => ({
            ...wp,
            tasks: wp.tasks.map(task => {
                if (task.id !== taskId) return task;
                return { ...task, durationSeconds: newDurationMinutes * 60 };
            })
        }))
    );
  }, []);

  const handleUpdateTaskNotes = useCallback((taskId: string, notes: string) => {
      setWorkPackages(prevPackages =>
          prevPackages.map(wp => ({
              ...wp,
              tasks: wp.tasks.map(task => {
                  if (task.id !== taskId) return task;
                  return { ...task, managerNotes: notes };
              })
          }))
      );
  }, []);


  const handleToggleTaskWorker = useCallback((taskId: string, workerId: string) => {
    setWorkPackages(prevPackages =>
        prevPackages.map(wp => ({
            ...wp,
            tasks: wp.tasks.map(task => {
                if (task.id !== taskId) return task;
                const isAssigned = task.assignedWorkerIds.includes(workerId);
                const newAssignedWorkerIds = isAssigned
                    ? task.assignedWorkerIds.filter(id => id !== workerId)
                    : [...task.assignedWorkerIds, workerId];
                return { ...task, assignedWorkerIds: newAssignedWorkerIds };
            })
        }))
    );
  }, []);

  const handleToggleSubTask = useCallback((taskId: string, subTaskId: string) => {
    setWorkPackages(prevPackages =>
      prevPackages.map(wp => ({
        ...wp,
        tasks: wp.tasks.map(task => {
          if (task.id !== taskId) {
            return task;
          }

          // Subtasks can be toggled only when active or completed (to allow reopening)
          if (task.status !== TaskStatus.Active && task.status !== TaskStatus.Completed) {
            return task;
          }

          const newSubTasks = task.subTasks.map(st =>
            st.id === subTaskId ? { ...st, completed: !st.completed, completionTime: !st.completed ? Date.now() : undefined } : st
          );

          let updatedTask = { ...task, subTasks: newSubTasks };

          if (task.status === TaskStatus.Active) {
            const allSubTasksCompleted = newSubTasks.every(st => st.completed);
            if (allSubTasksCompleted) {
              updatedTask.status = TaskStatus.Completed;
              updatedTask.endTime = Date.now();
            }
          } else if (task.status === TaskStatus.Completed) {
            const allSubTasksIncomplete = newSubTasks.every(st => !st.completed);
            if (allSubTasksIncomplete) {
              // Reopen the task by resetting it
              updatedTask.status = TaskStatus.Pending;
              updatedTask.startTime = undefined;
              updatedTask.endTime = undefined;
              updatedTask.managerNotes = '';
              // Explicitly ensure all subtasks are marked as incomplete
              updatedTask.subTasks = newSubTasks.map(st => ({ ...st, completed: false }));
            }
          }

          return updatedTask;
        })
      }))
    );
  }, []);

  const handleDeleteWorkPackage = useCallback((packageId: string, packageTitle: string) => {
    setDeleteTarget({ type: 'package', id: packageId, name: packageTitle });
  }, []);


  const handleAddWorker = useCallback((name: string) => {
    const newWorker: Worker = {
      id: `w-${Date.now()}`,
      name,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`
    };
    setWorkers(prev => [...prev, newWorker]);
  }, []);
  
  const handleUpdateWorker = useCallback((workerId: string, newName: string, newAvatar: string) => {
    setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, name: newName, avatar: newAvatar } : w));
  }, []);


  const handleDeleteWorker = (workerId: string, workerName: string) => {
    setDeleteTarget({ type: 'worker', id: workerId, name: workerName });
  };
  
  const handleAddTemplate = useCallback((template: Omit<WorkPackageTemplate, 'id'>) => {
    const newTemplate: WorkPackageTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
    };
    setTemplates(prev => [newTemplate, ...prev]);
  }, []);

  const handleUpdateTemplate = useCallback((updatedTemplate: WorkPackageTemplate) => {
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  }, []);

  const handleDeleteTemplate = (templateId: string, templateTitle: string) => {
    setDeleteTarget({ type: 'template', id: templateId, name: templateTitle });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const { type, id } = deleteTarget;

    if (type === 'package') {
      setWorkPackages(prev => prev.filter(wp => wp.id !== id));
    } else if (type === 'worker') {
      setWorkers(prev => prev.filter(w => w.id !== id));
      setWorkPackages(prev => prev.map(wp => ({
        ...wp,
        tasks: wp.tasks.map(task => ({
          ...task,
          assignedWorkerIds: task.assignedWorkerIds.filter(workerId => workerId !== id),
        })),
      })));
    } else if (type === 'template') {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }

    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleExportData = () => {
    const appState: AppState = { workPackages, workers, templates };
    const dataStr = JSON.stringify(appState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'santiye-pomodoro-veri.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Mevcut tüm verilerinizin üzerine içe aktarılan veriler yazılacaktır. Devam etmek istiyor musunuz?")) {
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text) as AppState;
        
        if (Array.isArray(data.workPackages) && Array.isArray(data.workers)) {
          setWorkPackages(data.workPackages);
          setWorkers(data.workers);
          if (Array.isArray(data.templates)) {
            setTemplates(data.templates);
          } else {
            setTemplates(INITIAL_TEMPLATES);
          }
          alert("Veri başarıyla içe aktarıldı!");
        } else {
          throw new Error("Geçersiz dosya formatı.");
        }
      } catch (error) {
        console.error("İçe aktarma hatası:", error);
        alert("Veri içe aktarılırken bir hata oluştu. Lütfen dosyanın doğru formatta olduğundan emin olun.");
      } finally {
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };
  
  const openAirtableModal = () => {
    setIsAirtableModalOpen(true);
  };
  
  const handleAirFetch = async () => {
    setIsAirtableFetchModalOpen(false);
    setIsFetching(true);
    try {
      const { workPackages, workers } = await airFetch();
      setWorkPackages(workPackages);
      setWorkers(workers);
      alert('Veriler başarıyla Airtable\'dan çekildi!');
    } catch (error) {
      alert(`Airtable'dan veri çekilirken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsFetching(false);
    }
  };

  const handleAirSync = async () => {
    setIsSyncing(true);
    try {
      await airSync(workPackages, workers);
      alert('Tüm görevler başarıyla Airtable\'a gönderildi!');
    } catch (error) {
      alert(`Airtable'a gönderilirken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const ongoingPackages = workPackages.filter(wp => wp.tasks.some(t => t.status !== TaskStatus.Completed));
  const completedPackages = workPackages.filter(wp => wp.tasks.every(t => t.status === TaskStatus.Completed));

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                 <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Şantiye Pomodoro</h1>
                 <div className="flex items-center gap-2">
                    <button onClick={() => setIsAirtableFetchModalOpen(true)} disabled={isFetching || isSyncing} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-wait">
                        <DownloadIcon className="w-4 h-4" />
                        <span>{isFetching ? 'Alınıyor...' : 'Airtable\'dan Al'}</span>
                    </button>
                    <button onClick={openAirtableModal} disabled={isSyncing || isFetching} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-wait">
                        <DatabaseIcon className="w-4 h-4" />
                        <span>{isSyncing ? 'Gönderiliyor...' : 'Airtable\'a Gönder'}</span>
                    </button>
                     <button onClick={handleImportClick} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">
                        <UploadIcon className="w-4 h-4" />
                        <span>İçe Aktar</span>
                     </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImportData}
                        accept="application/json"
                        className="hidden"
                      />
                     <button onClick={handleExportData} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">
                        <DownloadIcon className="w-4 h-4" />
                        <span>Dışa Aktar</span>
                    </button>
                 </div>
            </div>
             <nav className="flex border-t border-slate-200">
                <button 
                    onClick={() => setCurrentView('packages')}
                    className={`flex items-center gap-2 px-4 py-3 text-base font-semibold border-b-2 transition-colors ${currentView === 'packages' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <PackageIcon className="w-5 h-5"/>
                    İş Paketleri
                </button>
                <button 
                    onClick={() => setCurrentView('team')}
                    className={`flex items-center gap-2 px-4 py-3 text-base font-semibold border-b-2 transition-colors ${currentView === 'team' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <UsersIcon className="w-5 h-5"/>
                    Ekip Yönetimi
                </button>
                <button 
                    onClick={() => setCurrentView('templates')}
                    className={`flex items-center gap-2 px-4 py-3 text-base font-semibold border-b-2 transition-colors ${currentView === 'templates' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <ClipboardListIcon className="w-5 h-5"/>
                    Şablon Yönetimi
                </button>
             </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAirtableModalOpen && (
          <AirtableInfoModal
            onClose={() => setIsAirtableModalOpen(false)}
            onConfirm={() => {
              setIsAirtableModalOpen(false);
              handleAirSync();
            }}
          />
        )}
        
        {isAirtableFetchModalOpen && (
          <AirtableFetchConfirmModal
            onClose={() => setIsAirtableFetchModalOpen(false)}
            onConfirm={handleAirFetch}
          />
        )}

        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Silme Onayı"
          message={
            <>
              <strong>'{deleteTarget?.name}'</strong> öğesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </>
          }
          onConfirm={handleConfirmDelete}
          onClose={handleCancelDelete}
        />

        {currentView === 'packages' && (
            <>
                 <WorkPackageCreator onCreatePackage={handleCreatePackage} />
                 <TemplateSelector templates={templates} onSelectTemplate={handleCreatePackageFromTemplate} />

                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-emerald-800 border-b-2 border-emerald-500 pb-2 mb-6">Aktif İş Paketleri</h2>
                    {ongoingPackages.length > 0 ? (
                        ongoingPackages.map(wp => (
                            <WorkPackageCard 
                                key={wp.id} 
                                workPackage={wp}
                                workers={workers}
                                onUpdateTaskStatus={handleUpdateTaskStatus}
                                onToggleTaskWorker={handleToggleTaskWorker}
                                onToggleSubTask={handleToggleSubTask}
                                onDeletePackage={handleDeleteWorkPackage}
                                onUpdateTaskDuration={handleUpdateTaskDuration}
                                onUpdateTaskNotes={handleUpdateTaskNotes}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-sm">
                            <p className="text-slate-500">Henüz aktif bir iş paketi bulunmuyor.</p>
                            <p className="text-slate-400 text-sm mt-1">Yukarıdan yeni bir iş paketi oluşturarak veya bir şablon seçerek başlayın.</p>
                        </div>
                    )}
                </div>

                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-slate-500 pb-2 mb-6">Tamamlanan İş Paketleri</h2>
                    {completedPackages.length > 0 ? (
                        completedPackages.map(wp => (
                            <WorkPackageCard 
                                key={wp.id} 
                                workPackage={wp}
                                workers={workers}
                                onUpdateTaskStatus={handleUpdateTaskStatus}
                                onToggleTaskWorker={handleToggleTaskWorker}
                                onToggleSubTask={handleToggleSubTask}
                                onDeletePackage={handleDeleteWorkPackage}
                                onUpdateTaskDuration={handleUpdateTaskDuration}
                                onUpdateTaskNotes={handleUpdateTaskNotes}
                            />
                        ))
                    ) : (
                         <div className="text-center py-10 px-6 bg-white rounded-lg shadow-sm">
                            <p className="text-slate-500">Henüz tamamlanmış bir iş paketi yok.</p>
                        </div>
                    )}
                </div>
            </>
        )}
        {currentView === 'team' && (
            <TeamManagement
                workers={workers}
                onAddWorker={handleAddWorker}
                onUpdateWorker={handleUpdateWorker}
                onDeleteWorker={handleDeleteWorker}
            />
        )}
        {currentView === 'templates' && (
            <TemplateManagement
              templates={templates}
              onAddTemplate={handleAddTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
        )}
      </main>
    </div>
  );
};

export default App;