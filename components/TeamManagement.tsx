import React, { useState } from 'react';
import type { Worker } from '../types';
import { TrashIcon, PencilIcon } from './icons';

interface TeamManagementProps {
  workers: Worker[];
  onAddWorker: (name: string) => void;
  onDeleteWorker: (workerId: string, workerName: string) => void;
  onEditWorker: (workerId: string) => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ workers, onAddWorker, onDeleteWorker, onEditWorker }) => {
  const [newWorkerName, setNewWorkerName] = useState('');

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkerName.trim()) {
      onAddWorker(newWorkerName.trim());
      setNewWorkerName('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Worker Form */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-md">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Yeni Personel Ekle</h2>
        <form onSubmit={handleAddWorker} className="flex items-center gap-4">
          <div className="flex-grow">
            <label htmlFor="worker-name" className="sr-only">Personel Adı</label>
            <input
              type="text"
              id="worker-name"
              value={newWorkerName}
              onChange={(e) => setNewWorkerName(e.target.value)}
              className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="Örn: Zeynep Güneş"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 text-base font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400"
          >
            Ekle
          </button>
        </form>
      </div>

      {/* Worker List */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-md">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Mevcut Ekip Üyeleri</h2>
        {workers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map(worker => (
              <div key={worker.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <img src={worker.avatar} alt={worker.name} className="w-20 h-20 rounded-full object-cover" />
                  <span className="font-medium text-base text-slate-700">{worker.name}</span>
                </div>
                <div className="flex items-center">
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
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-4">Ekip üyesi bulunmuyor.</p>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;