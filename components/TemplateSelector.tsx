import React, { useState } from 'react';
import type { WorkPackageTemplate, TaskTemplate } from '../types';
import { ZapIcon, PackageIcon } from './icons';

interface TemplateSelectorProps {
  templates: WorkPackageTemplate[];
  onSelectTemplate: (template: WorkPackageTemplate) => void;
}

const TemplatePreviewModal: React.FC<{
  template: WorkPackageTemplate;
  onConfirm: () => void;
  onClose: () => void;
}> = ({ template, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 sticky top-0 bg-white border-b border-slate-200">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg flex-shrink-0">
                <PackageIcon className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Şablon Önizleme</h3>
                <p className="text-base text-slate-500">{template.title}</p>
              </div>
            </div>
        </div>
        <div className="p-6">
          <p className="text-base text-slate-600 mb-6">{template.description}</p>
          <h4 className="text-base font-semibold text-slate-700 mb-3">Şablon Görevleri</h4>
          <div className="space-y-3">
            {template.tasks.map((task: TaskTemplate, index: number) => (
              <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-baseline gap-4">
                    <p className="font-semibold text-slate-800">{task.title}</p>
                    <p className="text-xl font-bold text-red-600 whitespace-nowrap">
                        {task.durationMinutes} dakika
                    </p>
                </div>
                 {task.subTasks && task.subTasks.length > 0 && (
                   <ul className="mt-2 pl-5 list-disc list-outside space-y-1">
                     {task.subTasks.map((subTask, subIndex) => (
                       <li key={subIndex} className="text-slate-600">{subTask.title}</li>
                     ))}
                   </ul>
                 )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
            İptal
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-base font-bold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            Bu Şablondan Paket Oluştur
          </button>
        </div>
      </div>
    </div>
  );
};


const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, onSelectTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkPackageTemplate | null>(null);

  const handleSelect = (template: WorkPackageTemplate) => {
    setSelectedTemplate(template);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      setSelectedTemplate(null);
    }
  };

  return (
    <>
      {selectedTemplate && (
        <TemplatePreviewModal 
          template={selectedTemplate}
          onConfirm={handleConfirm}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
      <div className="p-6 mb-8 bg-white border border-slate-200 rounded-xl shadow-md">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Hazır Şablon Kullan</h2>
        <p className="text-base text-slate-500 mb-4">Sık kullanılan iş paketlerini tek tıkla oluşturun. Sadece ekibi atamanız yeterli olacaktır.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => handleSelect(template)}
              className="text-left p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-center gap-3 mb-2">
                <ZapIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                <h3 className="font-semibold text-base text-slate-700 group-hover:text-blue-600">{template.title}</h3>
              </div>
              <p className="text-sm text-slate-500">{template.description}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default TemplateSelector;