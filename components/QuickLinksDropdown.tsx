import React, { useState, useEffect, useRef } from 'react';
import EditLinksModal, { QuickLink } from './EditLinksModal';
import { LinkIcon, ChevronDownIcon, PencilIcon, ExternalLinkIcon } from './icons';

const QUICK_LINKS_STORAGE_KEY = 'santiyePomodoro_quickLinks';

const QuickLinksDropdown: React.FC = () => {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedLinks = localStorage.getItem(QUICK_LINKS_STORAGE_KEY);
      if (storedLinks) {
        setLinks(JSON.parse(storedLinks));
      } else {
        // Set some default links for first-time users
        setLinks([
          {id: 'link-1', name: 'Airtable Proje Tablosu', url: 'https://airtable.com/appgMyZNvnJMRCqT1/tblg2A332pWXoMTsY'},
          {id: 'link-2', name: 'Proje Çizimleri', url: '#'},
        ]);
      }
    } catch (error) {
      console.error("Failed to load quick links from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSaveLinks = (newLinks: QuickLink[]) => {
    try {
      localStorage.setItem(QUICK_LINKS_STORAGE_KEY, JSON.stringify(newLinks));
      setLinks(newLinks);
    } catch (error) {
       console.error("Failed to save quick links to localStorage", error);
    }
  };

  const openEditModal = () => {
    setIsEditModalOpen(true);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(prev => !prev)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
        >
          <LinkIcon className="w-4 h-4" />
          <span>Hızlı Bağlantılar</span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              {links.length > 0 ? (
                links.map(link => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2 text-base text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    role="menuitem"
                  >
                    <ExternalLinkIcon className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{link.name}</span>
                  </a>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-slate-500">Henüz bağlantı eklenmemiş.</div>
              )}
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={openEditModal}
                className="w-full flex items-center gap-3 px-4 py-2 text-base text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                role="menuitem"
              >
                <PencilIcon className="w-4 h-4 text-slate-400" />
                <span>Bağlantıları Düzenle</span>
              </button>
            </div>
          </div>
        )}
      </div>
      <EditLinksModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialLinks={links}
        onSave={handleSaveLinks}
      />
    </>
  );
};

export default QuickLinksDropdown;
