import React, { useState, useEffect } from 'react';
import { TrashIcon, PlusIcon, SaveIcon } from './icons';

export interface QuickLink {
  id: string;
  name: string;
  url: string;
}

interface EditLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLinks: QuickLink[];
  onSave: (links: QuickLink[]) => void;
}

const EditLinksModal: React.FC<EditLinksModalProps> = ({ isOpen, onClose, initialLinks, onSave }) => {
  const [links, setLinks] = useState<QuickLink[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Deep copy to avoid mutating the original state directly
      setLinks(JSON.parse(JSON.stringify(initialLinks)));
    }
  }, [isOpen, initialLinks]);

  if (!isOpen) return null;

  const handleLinkChange = (id: string, field: 'name' | 'url', value: string) => {
    setLinks(prevLinks =>
      prevLinks.map(link => (link.id === id ? { ...link, [field]: value } : link))
    );
  };

  const addLink = () => {
    setLinks(prevLinks => [...prevLinks, { id: `link-${Date.now()}`, name: '', url: '' }]);
  };

  const removeLink = (id: string) => {
    setLinks(prevLinks => prevLinks.filter(link => link.id !== id));
  };

  const handleSave = () => {
    const validLinks = links.filter(link => link.name.trim() && link.url.trim());
    onSave(validLinks);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-800 p-6 border-b border-slate-200 flex-shrink-0">
          Hızlı Bağlantıları Düzenle
        </h3>
        <div className="p-6 flex-grow overflow-y-auto space-y-4">
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-3">
              <input
                type="text"
                value={link.name}
                onChange={(e) => handleLinkChange(link.id, 'name', e.target.value)}
                placeholder="Bağlantı Adı"
                className="flex-grow px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                placeholder="URL (https://...)"
                className="flex-grow px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
              <button
                type="button"
                onClick={() => removeLink(link.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full flex-shrink-0"
                aria-label="Bağlantıyı kaldır"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
           <button
            type="button"
            onClick={addLink}
            className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Bağlantı Ekle
          </button>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
            İptal
          </button>
          <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-2 text-base font-bold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <SaveIcon className="w-5 h-5" />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLinksModal;