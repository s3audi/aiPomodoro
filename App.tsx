import React, { useState, useCallback, useRef } from 'react';
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
import { airFetch, airSync } from './services/airtableService';
import AirtableInfoModal from './components/AirtableInfoModal';

type View = 'packages' | 'team' | 'templates';

const App: React.FC = () => {
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [templates, setTemplates] = useState<WorkPackageTemplate[]>(INITIAL_TEMPLATES);
  const [currentView, setCurrentView] = useState<View>('packages');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [airtableRecordId, setAirtableRecordId] = useState<string | undefined>();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isAirtableModalOpen, setIsAirtableModalOpen] = useState(false);
  const [airtableAction, setAirtableAction] = useState<'sync' | 'fetch' | null>(null);


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

  const handleUpdateTaskStatus = useCallback((packageId: string, taskId: string, newStatus: TaskStatus) => {
    setWorkPackages(prevPackages => 
      prevPackages.map(wp => {
        if (wp.id === packageId) {
          return {
            ...wp,
            tasks: wp.tasks.map(task => {
              if (task.id === taskId) {
                const updatedTask: Task = { ...task, status: newStatus };
                if (newStatus === TaskStatus.Active && !task.startTime) {
                  updatedTask.startTime = Date.now();
                }
                if (newStatus === TaskStatus.Completed && !task.endTime) {
                    updatedTask.endTime = Date.now();
                }
                if (task.status === TaskStatus.Completed && newStatus === TaskStatus.Pending) {
                    updatedTask.startTime = undefined;
                    updatedTask.endTime = undefined;
                    updatedTask.managerNotes = '';
                    updatedTask.subTasks = task.subTasks.map(st => ({ ...st, completed: false }));
                }
                return updatedTask;
              }
              return task;
            }),
          };
        }
        return wp;
      })
    );
  }, []);
  
  const handleUpdateTaskDuration = useCallback((packageId: string, taskId: string, newDurationMinutes: number) => {
    setWorkPackages(prevPackages =>
        prevPackages.map(wp => {
            if (wp.id !== packageId) return wp;
            return {
                ...wp,
                tasks: wp.tasks.map(task => {
                    if (task.id !== taskId) return task;
                    return { ...task, durationSeconds: newDurationMinutes * 60 };
                })
            };
        })
    );
  }, []);

  const handleUpdateTaskNotes = useCallback((packageId: string, taskId: string, notes: string) => {
      setWorkPackages(prevPackages =>
          prevPackages.map(wp => {
              if (wp.id !== packageId) return wp;
              return {
                  ...wp,
                  tasks: wp.tasks.map(task => {
                      if (task.id !== taskId) return task;
                      return { ...task, managerNotes: notes };
                  })
              };
          })
      );
  }, []);


  const handleToggleTaskWorker = useCallback((packageId: string, taskId: string, workerId: string) => {
    setWorkPackages(prevPackages => 
      prevPackages.map(wp => {
        if (wp.id === packageId) {
          return {
            ...wp,
            tasks: wp.tasks.map(task => {
              if (task.id === taskId) {
                const isAssigned = task.assignedWorkerIds.includes(workerId);
                const newAssignedWorkerIds = isAssigned 
                  ? task.assignedWorkerIds.filter(id => id !== workerId)
                  : [...task.assignedWorkerIds, workerId];
                return { ...task, assignedWorkerIds: newAssignedWorkerIds };
              }
              return task;
            }),
          };
        }
        return wp;
      })
    );
  }, []);

  const handleToggleSubTask = useCallback((packageId: string, taskId: string, subTaskId: string) => {
    setWorkPackages(prevPackages =>
        prevPackages.map(wp => {
            if (wp.id !== packageId) return wp;
            return {
                ...wp,
                tasks: wp.tasks.map(task => {
                    if (task.id !== taskId) return task;
                    return {
                        ...task,
                        subTasks: task.subTasks.map(st => {
                            if (st.id !== subTaskId) return st;
                            return { ...st, completed: !st.completed };
                        })
                    };
                })
            };
        })
    );
}, []);

  const handleDeleteWorkPackage = useCallback((packageId: string, packageTitle: string) => {
    if (window.confirm(`'${packageTitle}' başlıklı iş paketini silmek istediğinizden emin misiniz?`)) {
        setWorkPackages(prevPackages => prevPackages.filter(wp => wp.id !== packageId));
    }
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
    if (window.confirm(`'${workerName}' adlı personeli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
        setWorkers(prev => prev.filter(w => w.id !== workerId));
        setWorkPackages(prev => prev.map(wp => ({
            ...wp,
            tasks: wp.tasks.map(task => ({
                ...task,
                assignedWorkerIds: task.assignedWorkerIds.filter(id => id !== workerId),
            }))
        })));
    }
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

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm("Bu şablonu silmek istediğinizden emin misiniz?")) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleExportData = () => {
    const appState: AppState = { workPackages, workers, templates, airtableRecordId };
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
          setAirtableRecordId(data.airtableRecordId);
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
  
  const openAirtableModal = (action: 'sync' | 'fetch') => {
    setAirtableAction(action);
    setIsAirtableModalOpen(true);
  };

  const handleAirSync = async () => {
    setIsSyncing(true);
    try {
      const appState: AppState = { workPackages, workers, templates, airtableRecordId };
      const dataStr = JSON.stringify(appState);
      const newRecordId = await airSync(dataStr, airtableRecordId);
      setAirtableRecordId(newRecordId);
      alert('Veri başarıyla Airtable\'a gönderildi!');
    } catch (error) {
      alert(`Airtable'a gönderilirken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAirFetch = async () => {
    // Confirmation is now handled by the modal
    setIsFetching(true);
    try {
      const result = await airFetch();
      if (result) {
        const data = JSON.parse(result.data) as AppState;
        if (Array.isArray(data.workPackages) && Array.isArray(data.workers)) {
          setWorkPackages(data.workPackages);
          setWorkers(data.workers);
          setTemplates(data.templates || INITIAL_TEMPLATES);
          setAirtableRecordId(result.recordId);
          alert("Veri başarıyla Airtable'dan alındı!");
        } else {
          throw new Error("Airtable'dan gelen veri formatı geçersiz.");
        }
      } else {
        alert("Airtable'da kayıt bulunamadı. Önce veri göndermeyi deneyin.");
      }
    } catch (error) {
      alert(`Airtable'dan veri alınırken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsFetching(false);
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
                    <button onClick={() => openAirtableModal('fetch')} disabled={isFetching} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-wait">
                      <DatabaseIcon className="w-4 h-4" />
                      <span>{isFetching ? 'Alınıyor...' : 'AirAl'}</span>
                    </button>
                    <button onClick={() => openAirtableModal('sync')} disabled={isSyncing} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-wait">
                        <DatabaseIcon className="w-4 h-4" />
                        <span>{isSyncing ? 'Veriliyor...' : 'AirVer'}</span>
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
        {isAirtableModalOpen && airtableAction && (
          <AirtableInfoModal
            action={airtableAction}
            onClose={() => setIsAirtableModalOpen(false)}
            onConfirm={() => {
              setIsAirtableModalOpen(false);
              if (airtableAction === 'sync') {
                handleAirSync();
              } else if (airtableAction === 'fetch') {
                if (window.confirm("Mevcut tüm verilerinizin üzerine Airtable'dan alınan veriler yazılacaktır. Devam etmek istiyor musunuz?")) {
                   handleAirFetch();
                }
              }
            }}
          />
        )}

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
                                onUpdateTaskStatus={(taskId, status) => handleUpdateTaskStatus(wp.id, taskId, status)}
                                onToggleTaskWorker={(taskId, workerId) => handleToggleTaskWorker(wp.id, taskId, workerId)}
                                onToggleSubTask={(taskId, subTaskId) => handleToggleSubTask(wp.id, taskId, subTaskId)}
                                onDeletePackage={handleDeleteWorkPackage}
                                onUpdateTaskDuration={(taskId, duration) => handleUpdateTaskDuration(wp.id, taskId, duration)}
                                onUpdateTaskNotes={(taskId, notes) => handleUpdateTaskNotes(wp.id, taskId, notes)}
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
                                onUpdateTaskStatus={(taskId, status) => handleUpdateTaskStatus(wp.id, taskId, status)}
                                onToggleTaskWorker={(taskId, workerId) => handleToggleTaskWorker(wp.id, taskId, workerId)}
                                onToggleSubTask={(taskId, subTaskId) => handleToggleSubTask(wp.id, taskId, subTaskId)}
                                onDeletePackage={handleDeleteWorkPackage}
                                onUpdateTaskDuration={(taskId, duration) => handleUpdateTaskDuration(wp.id, taskId, duration)}
                                onUpdateTaskNotes={(taskId, notes) => handleUpdateTaskNotes(wp.id, taskId, notes)}
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