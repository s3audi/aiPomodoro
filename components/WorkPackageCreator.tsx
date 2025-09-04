import React, { useState } from 'react';
import type { WorkPackage, Task, SubTask } from '../types';
import { TaskStatus } from '../types';
import { suggestTasks, AITaskSuggestion } from '../services/geminiService';
import { BrainCircuitIcon, PlusIcon, TrashIcon } from './icons';

interface WorkPackageCreatorProps {
  onCreatePackage: (newPackage: WorkPackage) => void;
}

type EditableTask = {
  title: string;
  duration: string;
  subTasks: { title: string }[];
};

const WorkPackageCreator: React.FC<WorkPackageCreatorProps> = ({ onCreatePackage }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState<EditableTask[]>([{ title: '', duration: '25', subTasks: [] }]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleTaskChange = (index: number, field: 'title' | 'duration', value: string) => {
    const newTasks = [...tasks];
    if (field === 'duration') {
      if (/^\d*$/.test(value)) {
        newTasks[index][field] = value;
        setTasks(newTasks);
      }
    } else {
      newTasks[index][field] = value;
      setTasks(newTasks);
    }
  };
  
  const handleSubTaskChange = (taskIndex: number, subTaskIndex: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].subTasks[subTaskIndex].title = value;
    setTasks(newTasks);
  };

  const addTaskInput = () => {
    setTasks([...tasks, { title: '', duration: '25', subTasks: [] }]);
  };
  
  const addSubTaskInput = (taskIndex: number) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].subTasks.push({ title: '' });
    setTasks(newTasks);
  };

  const removeTaskInput = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const removeSubTaskInput = (taskIndex: number, subTaskIndex: number) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].subTasks = newTasks[taskIndex].subTasks.filter((_, i) => i !== subTaskIndex);
    setTasks(newTasks);
  };

  const handleGetAISuggestions = async () => {
    if (!title) {
      alert('Lütfen önce bir İş Paketi Başlığı girin.');
      return;
    }
    setIsLoadingAI(true);
    try {
      const suggested = await suggestTasks(title);
      if (suggested.length > 0) {
        setTasks(suggested.map(task => ({
          title: task.title,
          duration: String(task.duration),
          subTasks: task.subTasks ? task.subTasks.map(st => ({ title: st.title })) : [],
        })));
      } else {
        alert('Yapay zeka görev öneremedi. Lütfen manuel olarak ekleyin.');
      }
    } catch (error) {
      console.error(error);
      alert('Görev önerileri alınırken bir hata oluştu.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || tasks.every(t => !t.title.trim())) {
      alert('Başlık ve en az bir görev gereklidir.');
      return;
    }

    const newPackage: WorkPackage = {
      id: `wp-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      tasks: tasks
        .filter(t => t.title.trim())
        .map((task, index): Task => ({
          id: `task-${Date.now()}-${index}`,
          title: task.title.trim(),
          status: TaskStatus.Pending,
          assignedWorkerIds: [],
          durationSeconds: (parseInt(task.duration, 10) || 25) * 60,
          subTasks: task.subTasks
            .filter(st => st.title.trim())
            .map((st, stIndex): SubTask => ({
              id: `subtask-${Date.now()}-${index}-${stIndex}`,
              title: st.title.trim(),
              completed: false,
            })),
        })),
    };

    onCreatePackage(newPackage);
    setTitle('');
    setDescription('');
    setTasks([{ title: '', duration: '25', subTasks: [] }]);
  };

  return (
    <div className="p-6 mb-8 bg-white border border-slate-200 rounded-xl shadow-md">
      <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Yeni İş Paketi Oluştur</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-base font-medium text-slate-700">İş Paketi Başlığı</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-amber-50 text-black border border-slate-300 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Örn: A Blok Temel Betonu"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-base font-medium text-slate-700">Açıklama</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full px-3 py-2 bg-amber-50 text-black border border-slate-300 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="İş paketi ile ilgili kısa detaylar"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-base font-medium text-slate-700">Görevler ve Alt Görevler</label>
                <button
                    type="button"
                    onClick={handleGetAISuggestions}
                    disabled={isLoadingAI || !title}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                    <BrainCircuitIcon className="w-4 h-4" />
                    {isLoadingAI ? 'Oluşturuluyor...' : 'AI ile Görev Öner'}
                </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {tasks.map((task, taskIndex) => (
                <div key={taskIndex} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => handleTaskChange(taskIndex, 'title', e.target.value)}
                      className="flex-grow px-3 py-2 bg-amber-50 text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base placeholder-slate-500"
                      placeholder={`Görev ${taskIndex + 1}`}
                    />
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={task.duration}
                        onChange={(e) => handleTaskChange(taskIndex, 'duration', e.target.value)}
                        className="w-16 text-center px-2 py-2 bg-amber-50 text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                        placeholder="Süre"
                      />
                      <span className="text-base text-slate-500">dk</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTaskInput(taskIndex)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full flex-shrink-0"
                      aria-label="Görevi kaldır"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="pl-6 mt-2 space-y-2">
                     {task.subTasks.map((subTask, subTaskIndex) => (
                         <div key={subTaskIndex} className="flex items-center gap-2">
                            <span className="text-slate-400">└</span>
                            <input
                                type="text"
                                value={subTask.title}
                                onChange={(e) => handleSubTaskChange(taskIndex, subTaskIndex, e.target.value)}
                                className="flex-grow px-2 py-1 bg-amber-50 text-black border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base placeholder-slate-500"
                                placeholder={`Alt Görev ${subTaskIndex + 1}`}
                            />
                             <button
                                type="button"
                                onClick={() => removeSubTaskInput(taskIndex, subTaskIndex)}
                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full flex-shrink-0"
                                aria-label="Alt görevi kaldır"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                         </div>
                     ))}
                     <button type="button" onClick={() => addSubTaskInput(taskIndex)} className="text-sm font-medium text-blue-500 hover:text-blue-700 ml-5">+ Alt Görev Ekle</button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addTaskInput}
              className="text-base font-medium text-blue-600 hover:text-blue-800"
            >
              + Yeni Görev Ekle
            </button>
          </div>
        </div>
        <div className="text-right mt-6 pt-4 border-t border-slate-200">
          <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <PlusIcon className="w-5 h-5"/>
            Paketi Oluştur
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkPackageCreator;
