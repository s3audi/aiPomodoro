import React from 'react';
import { AlertTriangleIcon } from './icons';

interface AirtableFetchConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const AirtableFetchConfirmModal: React.FC<AirtableFetchConfirmModalProps> = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Airtable'dan Veri Al</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
            <AlertTriangleIcon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
                <h5 className="font-semibold text-amber-800">Onay Gerekiyor</h5>
                <p className="text-base text-amber-700">
                  Bu işlem, Airtable'daki verileri çekecek ve mevcut tüm yerel verilerinizin (iş paketleri, görevler, ekip ve şablonlar) üzerine yazacaktır. Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?
                </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
            İptal
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-base font-bold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            Onayla ve Tüm Verileri Al
          </button>
        </div>
      </div>
    </div>
  );
};

export default AirtableFetchConfirmModal;