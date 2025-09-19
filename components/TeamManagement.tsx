import React, { useState, useMemo, useEffect } from 'react';
import type { Worker, WorkPackage, Task } from '../types';
import { TaskStatus } from '../types';
import { TrashIcon, PencilIcon, DatabaseIcon, DownloadIcon, AlertTriangleIcon, CopyIcon, PlusIcon, LoaderIcon, ClipboardCheckIcon } from './icons';

// --- UTILITY FUNCTIONS FOR BRANDING ---
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

const getInitials = (name: string): string => {
    if (!name) return '?';
    const words = name.split(' ').filter(Boolean);
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const CompanyLogo: React.FC<{ company?: string }> = ({ company }) => {
    const [logoError, setLogoError] = useState(false);
    const logoUrl = company ? `https://cebi.com.tr/foto/${company.replace(/\s+/g, '_')}.png` : '';

    useEffect(() => {
        setLogoError(false);
    }, [company]);

    if (!company) {
        return <div className="w-10 h-10 flex-shrink-0" />;
    }

    if (logoError || !logoUrl) {
        const bgColor = stringToColor(company);
        const initials = getInitials(company);
        return (
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                style={{ backgroundColor: bgColor }}
                title={company}
            >
                {initials}
            </div>
        );
    }

    return (
        <img
            src={logoUrl}
            alt={`${company} logo`}
            className="w-10 h-10 rounded-lg object-contain bg-white p-0.5 border border-slate-200"
            onError={() => setLogoError(true)}
        />
    );
};


interface AddWorkerModalProps {
    onClose: () => void;
    onAddWorker: (name: string, company?: string, position?: string) => void;
}

const AddWorkerModal: React.FC<AddWorkerModalProps> = ({ onClose, onAddWorker }) => {
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [position, setPosition] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onAddWorker(name.trim(), company.trim() || undefined, position.trim() || undefined);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-800 p-6 border-b border-slate-200">Yeni Personel Ekle</h3>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="new-worker-name" className="block text-base font-medium text-slate-700 mb-1">Personel Adı</label>
                        <input
                            id="new-worker-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                            placeholder="Örn: Zeynep Güneş"
                            required
                            autoFocus
                        />
                    </div>
                     <div>
                        <label htmlFor="new-worker-company" className="block text-base font-medium text-slate-700 mb-1">Şirket (İsteğe Bağlı)</label>
                        <input
                            id="new-worker-company"
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                            placeholder="Örn: İnşaat A.Ş."
                        />
                    </div>
                    <div>
                        <label htmlFor="new-worker-position" className="block text-base font-medium text-slate-700 mb-1">Statü (İsteğe Bağlı)</label>
                        <input
                            id="new-worker-position"
                            type="text"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                            placeholder="Örn: Şef, Usta, Yardımcı"
                        />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={onClose} type="button" className="px-4 py-2 text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
                        İptal
                    </button>
                    <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 text-base font-bold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                        <PlusIcon className="w-5 h-5" />
                        Ekle
                    </button>
                </div>
            </form>
        </div>
    );
};

const WorkerTooltip: React.FC<{ workerId: string, workPackages: WorkPackage[] }> = ({ workerId, workPackages }) => {
  const activeTasks = useMemo(() => {
    const tasks: { title: string; startTime: number }[] = [];
    workPackages.forEach(wp => {
      wp.tasks.forEach(task => {
        if (task.status === TaskStatus.Active && task.assignedWorkerIds.includes(workerId) && task.startTime) {
          tasks.push({ title: task.title, startTime: task.startTime });
        }
      });
    });
    return tasks;
  }, [workerId, workPackages]);

  if (activeTasks.length === 0) {
    return null;
  }

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs p-3 bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-hover:delay-1000 transition-opacity duration-300 z-10 pointer-events-none">
      <h4 className="font-bold border-b border-slate-600 pb-1 mb-1">Aktif Görevler</h4>
      <ul className="space-y-1">
        {activeTasks.map((task, index) => (
          <li key={index} className="truncate">
            <strong>{task.title}</strong> - {new Date(task.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </li>
        ))}
      </ul>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800"></div>
    </div>
  );
};


interface TeamManagementProps {
  workers: Worker[];
  workPackages: WorkPackage[];
  onAddWorker: (name: string, company?: string, position?: string) => void;
  onDeleteWorker: (workerId: string, workerName: string) => void;
  onEditWorker: (workerId: string) => void;
  onCopyWorker: (workerId: string) => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ workers, workPackages, onAddWorker, onDeleteWorker, onEditWorker, onCopyWorker }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getPhotoId = (avatarUrl: string): string => {
      const match = avatarUrl.match(/cebi\.com\.tr\/foto\/(.+)\.png$/);
      return match ? match[1] : '';
  };
  
  const workerTaskCounts = useMemo(() => {
    const counts = new Map<string, number>();
    workers.forEach(w => counts.set(w.id, 0));
    workPackages.forEach(wp => {
        wp.tasks.forEach(task => {
            if (task.status === TaskStatus.Active) {
                task.assignedWorkerIds.forEach(workerId => {
                    counts.set(workerId, (counts.get(workerId) || 0) + 1);
                });
            }
        });
    });
    return counts;
  }, [workPackages, workers]);

  const sortedAndFilteredWorkers = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    
    let filtered = workers;
    if (lowercasedFilter) {
      filtered = workers.filter(worker =>
          worker.name.toLowerCase().includes(lowercasedFilter) ||
          (worker.company && worker.company.toLowerCase().includes(lowercasedFilter)) ||
          getPhotoId(worker.avatar).toLowerCase().includes(lowercasedFilter)
      );
    }
    
    return filtered.sort((a, b) => {
        const countA = workerTaskCounts.get(a.id) || 0;
        const countB = workerTaskCounts.get(b.id) || 0;
        return countB - countA;
    });
  }, [workers, searchTerm, workerTaskCounts]);


  return (
    <div className="space-y-8">
      {isAddModalOpen && <AddWorkerModal onClose={() => setIsAddModalOpen(false)} onAddWorker={onAddWorker} />}
      
      {/* Management Card */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-md">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">Ekip Yönetimi</h2>
        </div>
        <p className="text-base text-slate-500">Yeni personel ekleyin veya mevcut personelleri düzenleyin. Tüm verilerinizi ana sayfadaki düğmeleri kullanarak Airtable ile senkronize edebilirsiniz.</p>
      </div>
      
      {/* Search and Add Controls */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-md">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-grow relative">
            <label htmlFor="worker-search" className="sr-only">Personel Ara</label>
            <input
              type="text"
              id="worker-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full px-4 py-2 pr-10 bg-green-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base text-slate-900 font-bold"
              placeholder="Personel adı, şirket veya ID'ye göre ara..."
            />
             {searchTerm && (
                <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    aria-label="Aramayı temizle"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-base font-bold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Yeni Personel Ekle
          </button>
        </div>
      </div>

      {/* Worker List */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-md">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Mevcut Ekip Üyeleri ({sortedAndFilteredWorkers.length})</h2>
        {sortedAndFilteredWorkers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedAndFilteredWorkers.map(worker => {
              const taskCount = workerTaskCounts.get(worker.id) || 0;
              return (
                <div key={worker.id} className="group relative flex flex-col justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                   <WorkerTooltip workerId={worker.id} workPackages={workPackages} />
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <img src={worker.avatar} alt={worker.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base text-slate-800 truncate">{worker.name}</p>
                      <p className="text-sm font-medium text-teal-600 truncate">{worker.position || 'Statü Belirtilmemiş'}</p>
                       <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                        <CompanyLogo company={worker.company} />
                        <p className="text-sm text-slate-500 truncate">{worker.company || 'Şirket belirtilmemiş'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div title={`${taskCount} aktif görevde`} className={`flex items-center gap-1.5 text-sm ${taskCount > 0 ? 'text-blue-600 font-semibold' : 'text-slate-500'}`}>
                        <ClipboardCheckIcon className="w-4 h-4" />
                        <span>{taskCount}</span>
                    </div>
                    <div className="flex items-center">
                      <button onClick={() => onCopyWorker(worker.id)} className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-100 rounded-full" aria-label={`${worker.name} adlı personeli kopyala`}>
                        <CopyIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => onEditWorker(worker.id)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-100 rounded-full" aria-label={`${worker.name} adlı personeli düzenle`}>
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDeleteWorker(worker.id, worker.name)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full"
                        aria-label={`${worker.name} adlı personeli sil`}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-4">
            {searchTerm ? 'Arama kriterlerine uyan personel bulunamadı.' : 'Ekip üyesi bulunmuyor.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;