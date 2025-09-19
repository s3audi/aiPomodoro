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
import { UploadIcon, DownloadIcon, UsersIcon, PackageIcon, ClipboardListIcon, DatabaseIcon, ZapIcon, SaveIcon, RotateCcwIcon } from './components/icons';
import { airSync, airFetch, airSyncTemplates, airFetchTemplates, airSyncWorkers, airFetchWorkers } from './services/airtableService';
import AirtableInfoModal from './components/AirtableInfoModal';
import AirtableFetchConfirmModal from './components/AirtableFetchConfirmModal';
import ConfirmModal from './components/ConfirmModal';
import ActiveTasksView from './components/ActiveTasksView';
import Toast from './components/Toast';
import QuickLinksDropdown from './components/QuickLinksDropdown';

type View = 'packages' | 'activeTasks' | 'team' | 'templates';
type DeleteTarget = { type: 'package' | 'worker' | 'template'; id: string; name: string };


interface WorkerEditModalProps {
  isOpen: boolean;
  worker: Worker | null;
  onClose: () => void;
  onSave: (workerId: string, newName: string, newAvatar: string, newCompany?: string, newPosition?: string) => void;
}

const WorkerEditModal: React.FC<WorkerEditModalProps> = ({ isOpen, worker, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [photoId, setPhotoId] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');

  useEffect(() => {
    if (worker) {
      setName(worker.name);
      setAvatar(worker.avatar);
      setCompany(worker.company || '');
      setPosition(worker.position || '');
      const match = worker.avatar.match(/cebi\.com\.tr\/foto\/(.+)\.png/);
      if (match && match[1]) {
        if (match[1].startsWith('random')) {
           setPhotoId(match[1]);
        } else {
           setPhotoId(match[1]);
        }
      } else {
        setPhotoId('');
      }
    }
  }, [worker]);

  useEffect(() => {
      if (photoId.trim() !== '') {
          const newAvatarUrl = `https://cebi.com.tr/foto/${photoId.trim()}.png`;
          setAvatar(newAvatarUrl);
      }
  }, [photoId]);

  if (!isOpen || !worker) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(worker.id, name.trim(), avatar, company.trim(), position.trim());
    }
  };

  const handleRefreshAvatar = () => {
    const randomNumber = Math.floor(Math.random() * 11) + 1;
    const randomId = `random${randomNumber}`;
    setPhotoId(randomId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-800 p-6 border-b border-slate-200">Personel Düzenle</h3>
        <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                    <img src={avatar} alt={name} className="w-24 h-24 rounded-full object-cover border-2 border-slate-200" />
                    <button 
                        type="button" 
                        onClick={handleRefreshAvatar} 
                        className="absolute -bottom-1 -right-1 p-2 bg-white rounded-full shadow-lg text-blue-600 hover:bg-blue-100 transition-transform hover:scale-110"
                        title="Rastgele yeni avatar"
                    >
                        <RotateCcwIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-grow space-y-3">
                    <div>
                        <label htmlFor="worker-edit-name" className="block text-base font-medium text-slate-700 mb-1">Personel Adı</label>
                        <input
                            id="worker-edit-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                        />
                    </div>
                     <div>
                        <label htmlFor="worker-edit-company" className="block text-base font-medium text-slate-700 mb-1">Şirket</label>
                        <input
                            id="worker-edit-company"
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                            placeholder="Örn: İnşaat A.Ş."
                        />
                    </div>
                </div>
            </div>
            <div>
              <label htmlFor="worker-edit-position" className="block text-base font-medium text-slate-700 mb-1">Statü</label>
              <input
                  id="worker-edit-position"
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="Örn: Şef, Usta, Yardımcı"
              />
            </div>
             <div className="pt-2">
                <label htmlFor="worker-photo-id" className="block text-base font-medium text-slate-700 mb-1">Personel Fotoğraf ID</label>
                <input
                    id="worker-photo-id"
                    type="text"
                    value={photoId}
                    onChange={(e) => setPhotoId(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                    placeholder="Örn: 15 veya random3"
                />
            </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <button onClick={onClose} type="button" className="px-4 py-2 text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
                İptal
            </button>
            <button onClick={handleSave} type="button" className="inline-flex items-center gap-2 px-4 py-2 text-base font-bold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                <SaveIcon className="w-5 h-5" />
                Kaydet
            </button>
        </div>
      </div>
    </div>
  );
};


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
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);


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
    showToast(`'${template.title}' şablonundan paket oluşturuldu!`, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [workers, showToast]);
  
  const handleUpdateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    let chiefAssigned: Worker | null = null;

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

      const targetWorkPackage = newPackages[wpIndex];
      const targetTask = targetWorkPackage.tasks[taskIndex];
      const updatedTask = { ...targetTask, status: newStatus };

      if (targetTask.status === TaskStatus.Completed && newStatus === TaskStatus.Pending) {
          updatedTask.startTime = undefined;
          updatedTask.endTime = undefined;
          updatedTask.managerNotes = '';
          updatedTask.subTasks = targetTask.subTasks.map(st => ({ ...st, completed: false, completionTime: undefined }));
      }
      if (newStatus === TaskStatus.Active) {
          if (!targetTask.startTime) {
            updatedTask.startTime = Date.now();
          }
          // Smart Assignment on Task Start
          if (targetWorkPackage.companyFilter && updatedTask.assignedWorkerIds.length === 0) {
              const chief = workers.find(w => w.company === targetWorkPackage.companyFilter && w.position === 'Şef');
              if (chief) {
                  updatedTask.assignedWorkerIds = [chief.id];
                  chiefAssigned = chief;
              }
          }
      }
      if (newStatus === TaskStatus.Completed && !targetTask.endTime) {
          updatedTask.endTime = Date.now();
      }

      newPackages[wpIndex].tasks[taskIndex] = updatedTask;
      return newPackages;
    });

    if (chiefAssigned) {
        showToast(`${chiefAssigned.name} ('Şef') göreve otomatik atandı.`, 'success');
    }
  }, [workers, showToast]);
  
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

  const handleUpdateWorkPackageCompanyFilter = useCallback((packageId: string, company: string) => {
    setWorkPackages(prev => {
        const newPackages = [...prev];
        const wpIndex = newPackages.findIndex(wp => wp.id === packageId);
        if (wpIndex === -1) return prev;
        
        const companyFilter = company === 'all' ? undefined : company;
        newPackages[wpIndex].companyFilter = companyFilter;
        // Also update the work package's main company property to match the filter.
        // This ensures it gets displayed and synced to Airtable.
        newPackages[wpIndex].company = companyFilter;


        // Smart Assignment Logic
        if (companyFilter) {
            const chief = workers.find(w => w.company === companyFilter && w.position === 'Şef');
            if (chief) {
                newPackages[wpIndex].tasks = newPackages[wpIndex].tasks.map(task => {
                    // Assign only if the task has no one assigned
                    if (task.assignedWorkerIds.length === 0) {
                        return { ...task, assignedWorkerIds: [chief.id] };
                    }
                    return task;
                });
            }
        }
        return newPackages;
    });
  }, [workers]);

  const handleUpdateWorkPackageUrls = useCallback((packageId: string, urls: { imageUrl?: string; pdfUrl?: string }) => {
    setWorkPackages(prev =>
      prev.map(wp => {
        if (wp.id !== packageId) return wp;
        const updatedWp = { ...wp };
        if (urls.imageUrl !== undefined) {
          updatedWp.imageUrl = urls.imageUrl.trim() || undefined;
        }
        if (urls.pdfUrl !== undefined) {
          updatedWp.pdfUrl = urls.pdfUrl.trim() || undefined;
        }
        return updatedWp;
      })
    );
  }, []);


  const handleAddWorker = useCallback((name: string, company?: string, position?: string) => {
    const workerId = `w-${Date.now()}`;
    const randomNumber = Math.floor(Math.random() * 11) + 1;
    const newWorker: Worker = {
      id: workerId,
      name,
      avatar: `https://cebi.com.tr/foto/random${randomNumber}.png`,
      company: company,
      position: position,
    };
    setWorkers(prev => [...prev, newWorker]);
  }, []);
  
  const handleUpdateWorker = useCallback((workerId: string, newName: string, newAvatar: string, newCompany?: string, newPosition?: string) => {
    setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, name: newName, avatar: newAvatar, company: newCompany, position: newPosition } : w));
    setEditingWorker(null);
  }, []);
  
  const handleCopyWorker = useCallback((workerId: string) => {
    const workerToCopy = workers.find(w => w.id === workerId);
    if (!workerToCopy) return;

    const newWorker: Worker = {
        ...workerToCopy,
        id: `w-${Date.now()}`,
        name: `${workerToCopy.name} (Kopya)`,
    };
    setWorkers(prev => [...prev, newWorker]);
  }, [workers]);


  const handleStartEditWorker = useCallback((workerId: string) => {
    const workerToEdit = workers.find(w => w.id === workerId);
    if (workerToEdit) {
      setEditingWorker(workerToEdit);
    }
  }, [workers]);


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

  const handleCopyTemplate = useCallback((templateId: string) => {
    const templateToCopy = templates.find(t => t.id === templateId);
    if (!templateToCopy) return;

    const newTemplate: WorkPackageTemplate = {
      ...templateToCopy,
      id: `tpl-${Date.now()}`,
      title: `${templateToCopy.title} (Kopya)`,
    };

    setTemplates(prev => [newTemplate, ...prev]);
    showToast(`'${templateToCopy.title}' şablonu kopyalandı.`, 'success');
  }, [templates, showToast]);

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

    showToast(`'${deleteTarget.name}' başarıyla silindi.`, 'success');
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
    showToast('Veriler başarıyla dışa aktarıldı!', 'success');
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
          showToast("Veri başarıyla içe aktarıldı!", 'success');
        } else {
          throw new Error("Geçersiz dosya formatı.");
        }
      } catch (error) {
        console.error("İçe aktarma hatası:", error);
        showToast("Veri içe aktarılırken bir hata oluştu.", 'error');
      } finally {
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    // FIX: Corrected a typo in the FileReader API call from `readText` to `readAsText`.
    reader.readAsText(file);
  };
  
  const openAirtableModal = () => {
    setIsAirtableModalOpen(true);
  };
  
  const handleAirFetch = async () => {
    setIsAirtableFetchModalOpen(false);
    setIsFetching(true);
    try {
      const [fetchedTemplates, initialWorkers] = await Promise.all([
        airFetchTemplates(),
        airFetchWorkers()
      ]);
      
      const { workPackages, workers: updatedWorkers } = await airFetch(initialWorkers);
      
      setTemplates(fetchedTemplates);
      setWorkers(updatedWorkers);
      setWorkPackages(workPackages);
      
      showToast('Tüm veriler başarıyla Airtable\'dan çekildi!', 'success');
    } catch (error) {
      showToast(`Airtable'dan veri çekilirken hata: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setIsFetching(false);
    }
  };

  const handleAirSync = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([
        airSync(workPackages, workers),
        airSyncTemplates(templates),
        airSyncWorkers(workers)
      ]);
      showToast('Tüm veriler başarıyla Airtable\'a gönderildi!', 'success');
    } catch (error) {
      showToast(`Airtable'a gönderilirken hata: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const ongoingPackages = workPackages.filter(wp => wp.tasks.some(t => t.status !== TaskStatus.Completed));
  const completedPackages = workPackages.filter(wp => wp.tasks.every(t => t.status === TaskStatus.Completed));
  const activeTaskCount = workPackages.flatMap(wp => wp.tasks).filter(t => t.status === TaskStatus.Active).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                 <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Şantiye Pomodoro</h1>
                 <div className="flex items-center gap-2">
                    <QuickLinksDropdown />
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
                    onClick={() => setCurrentView('activeTasks')}
                    className={`relative flex items-center gap-2 px-4 py-3 text-base font-semibold border-b-2 transition-colors ${currentView === 'activeTasks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <ZapIcon className="w-5 h-5"/>
                    Aktif Görevler
                    {activeTaskCount > 0 && (
                        <span className="absolute top-1.5 right-0 flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full">
                            {activeTaskCount}
                        </span>
                    )}
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

        <WorkerEditModal
          isOpen={!!editingWorker}
          worker={editingWorker}
          onClose={() => setEditingWorker(null)}
          onSave={handleUpdateWorker}
        />

        {currentView === 'packages' && (
            <>
                 <WorkPackageCreator onCreatePackage={handleCreatePackage} showToast={showToast} />
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
                                onEditWorker={handleStartEditWorker}
                                onUpdateCompanyFilter={handleUpdateWorkPackageCompanyFilter}
                                onUpdateUrls={handleUpdateWorkPackageUrls}
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
                                onEditWorker={handleStartEditWorker}
                                onUpdateCompanyFilter={handleUpdateWorkPackageCompanyFilter}
                                onUpdateUrls={handleUpdateWorkPackageUrls}
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
        {currentView === 'activeTasks' && (
            <ActiveTasksView
                workPackages={workPackages}
                workers={workers}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onToggleTaskWorker={handleToggleTaskWorker}
                onToggleSubTask={handleToggleSubTask}
                onUpdateTaskDuration={handleUpdateTaskDuration}
                onUpdateTaskNotes={handleUpdateTaskNotes}
                onEditWorker={handleStartEditWorker}
            />
        )}
        {currentView === 'team' && (
            <TeamManagement
                workers={workers}
                workPackages={workPackages}
                onAddWorker={handleAddWorker}
                onDeleteWorker={handleDeleteWorker}
                onEditWorker={handleStartEditWorker}
                onCopyWorker={handleCopyWorker}
            />
        )}
        {currentView === 'templates' && (
            <TemplateManagement
              templates={templates}
              onAddTemplate={handleAddTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onCopyTemplate={handleCopyTemplate}
            />
        )}
      </main>
    </div>
  );
};

export default App;