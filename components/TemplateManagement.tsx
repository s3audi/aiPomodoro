

import React, { useState, useEffect } from 'react';
import type { WorkPackageTemplate, TaskTemplate } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, DatabaseIcon, DownloadIcon, AlertTriangleIcon, ExternalLinkIcon, LoaderIcon } from './icons';

type EditableTask = {
  title: string;
  durationMinutes: string;
  subTasks: { title: string }[];
};

interface TemplateEditorProps {
    template?: WorkPackageTemplate | null;
    onSave: (template: Omit<WorkPackageTemplate, 'id'> | WorkPackageTemplate) => void;
    onClose: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tasks, setTasks] = useState<EditableTask[]>([{ title: '', durationMinutes: '25', subTasks: [] }]);

    useEffect(() => {
        if (template) {
            setTitle(template.title);
            setDescription(template.description);
            setTasks(template.tasks.map(t => ({
                title: t.title,
                durationMinutes: String(t.durationMinutes),
                subTasks: t.subTasks.map(st => ({ title: st.title }))
            })));
        } else {
            setTitle('');
            setDescription('');
            setTasks([{ title: '', durationMinutes: '25', subTasks: [] }]);
        }
    }, [template]);

    const handleTaskChange = (index: number, field: 'title' | 'durationMinutes', value: string) => {
        const newTasks = [...tasks];
        if (field === 'durationMinutes') {
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

    const addTaskInput = () => setTasks([...tasks, { title: '', durationMinutes: '25', subTasks: [] }]);
    const addSubTaskInput = (taskIndex: number) => {
        const newTasks = [...tasks];
        newTasks[taskIndex].subTasks.push({ title: '' });
        setTasks(newTasks);
    };

    const removeTaskInput = (index: number) => setTasks(tasks.filter((_, i) => i !== index));
    const removeSubTaskInput = (taskIndex: number, subTaskIndex: number) => {
        const newTasks = [...tasks];
        newTasks[taskIndex].subTasks = newTasks[taskIndex].subTasks.filter((_, i) => i !== subTaskIndex);
        setTasks(newTasks);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || tasks.every(t => !t.title.trim())) {
            alert('Başlık ve en az bir görev gereklidir.');
            return;
        }

        const preparedTemplate = {
            title: title.trim(),
            description: description.trim(),
            tasks: tasks
                .filter(t => t.title.trim())
                .map((task): TaskTemplate => ({
                    title: task.title.trim(),
                    durationMinutes: parseInt(task.durationMinutes, 10) || 25,
                    subTasks: task.subTasks
                        .filter(st => st.title.trim())
                        .map(st => ({ title: st.title.trim() })),
                })),
        };

        if (template) {
            onSave({ ...preparedTemplate, id: template.id });
        } else {
            onSave(preparedTemplate);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-sky-50 text-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-800 p-6 border-b border-sky-200 flex-shrink-0">
                    {template ? 'Şablonu Düzenle' : 'Yeni Şablon Oluştur'}
                </h3>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
                    <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="tpl-title" className="block text-base font-medium text-slate-700">Şablon Başlığı</label>
                                    <input type="text" id="tpl-title" value={title} onChange={(e) => setTitle(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" required />
                                </div>
                                <div>
                                    <label htmlFor="tpl-description" className="block text-base font-medium text-slate-700">Açıklama</label>
                                    <textarea id="tpl-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" />
                                </div>
                            </div>
                            {/* Right Column */}
                            <div className="space-y-4">
                                <label className="block text-base font-medium text-slate-700">Görevler ve Alt Görevler</label>
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 bg-sky-100 p-3 rounded-md border border-sky-200">
                                    {tasks.map((task, taskIndex) => (
                                        <div key={taskIndex} className="p-3 bg-white rounded-lg border border-slate-200">
                                            {/* Task input fields */}
                                            <div className="flex items-center gap-2">
                                                <input type="text" value={task.title} onChange={(e) => handleTaskChange(taskIndex, 'title', e.target.value)}
                                                    className="flex-grow px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" placeholder={`Görev ${taskIndex + 1}`} />
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <input type="text" inputMode="numeric" value={task.durationMinutes} onChange={(e) => handleTaskChange(taskIndex, 'durationMinutes', e.target.value)}
                                                        className="w-16 text-center px-2 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" />
                                                    <span className="text-base text-slate-500">dk</span>
                                                </div>
                                                <button type="button" onClick={() => removeTaskInput(taskIndex)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full flex-shrink-0" aria-label="Görevi kaldır">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {/* SubTask inputs */}
                                            <div className="pl-6 mt-2 space-y-2">
                                                {task.subTasks.map((subTask, subTaskIndex) => (
                                                    <div key={subTaskIndex} className="flex items-center gap-2">
                                                        <span className="text-slate-400">└</span>
                                                        <input type="text" value={subTask.title} onChange={(e) => handleSubTaskChange(taskIndex, subTaskIndex, e.target.value)}
                                                            className="flex-grow px-2 py-1 bg-white border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder={`Alt Görev ${subTaskIndex + 1}`} />
                                                        <button type="button" onClick={() => removeSubTaskInput(taskIndex, subTaskIndex)}
                                                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full flex-shrink-0" aria-label="Alt görevi kaldır">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => addSubTaskInput(taskIndex)} className="text-sm font-medium text-blue-500 hover:text-blue-700 ml-5">+ Alt Görev Ekle</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addTaskInput} className="text-base font-medium text-blue-600 hover:text-blue-800">+ Yeni Görev Ekle</button>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-sky-100 border-t border-sky-200 flex justify-end gap-3 flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
                            İptal
                        </button>
                        <button type="submit" className="px-6 py-2 text-base font-bold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                            Şablonu Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface TemplateManagementProps {
    templates: WorkPackageTemplate[];
    onAddTemplate: (template: Omit<WorkPackageTemplate, 'id'>) => void;
    onUpdateTemplate: (template: WorkPackageTemplate) => void;
    onDeleteTemplate: (templateId: string, templateTitle: string) => void;
}

const TemplateManagement: React.FC<TemplateManagementProps> = ({ templates, onAddTemplate, onUpdateTemplate, onDeleteTemplate }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<WorkPackageTemplate | null>(null);
    
    const handleAddNew = () => {
        setEditingTemplate(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (template: WorkPackageTemplate) => {
        setEditingTemplate(template);
        setIsEditorOpen(true);
    };

    const handleSave = (template: Omit<WorkPackageTemplate, 'id'> | WorkPackageTemplate) => {
        if ('id' in template) {
            onUpdateTemplate(template);
        } else {
            onAddTemplate(template);
        }
        setIsEditorOpen(false);
    };

    return (
        <div className="space-y-8">
            {isEditorOpen && <TemplateEditor template={editingTemplate} onSave={handleSave} onClose={() => setIsEditorOpen(false)} />}
            
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-md">
                <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800">Şablon Yönetimi</h2>
                    <div className="flex items-center gap-2">
                         <button
                            onClick={handleAddNew}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <PlusIcon className="w-5 h-5"/>
                            Yeni Şablon
                        </button>
                    </div>
                </div>
                 <p className="text-base text-slate-500 mb-6">İş paketleri için özel şablonlar oluşturun, düzenleyin veya silin. Tüm verilerinizi ana sayfadaki düğmeleri kullanarak Airtable ile senkronize edebilirsiniz.</p>
                
                {templates.length > 0 ? (
                    <div className="space-y-3">
                        {templates.map(template => (
                        <div key={template.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-base text-slate-800 truncate">{template.title}</p>
                                <p className="text-sm text-slate-500 truncate">{template.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                               <button onClick={() => handleEdit(template)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-100 rounded-full" aria-label="Şablonu düzenle">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => onDeleteTemplate(template.id, template.title)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full" aria-label="Şablonu sil">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-10 px-6">
                        <p className="text-slate-500">Henüz oluşturulmuş bir şablon yok.</p>
                        <p className="text-slate-400 text-sm mt-1">"Yeni Şablon Oluştur" butonuyla ilk şablonunuzu ekleyebilirsiniz.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateManagement;