import React from 'react';
import { AlertTriangleIcon, ExternalLinkIcon } from './icons';

interface AirtableInfoModalProps {
  action: 'sync' | 'fetch';
  onClose: () => void;
  onConfirm: () => void;
}

const AirtableInfoModal: React.FC<AirtableInfoModalProps> = ({ action, onClose, onConfirm }) => {
  const isSync = action === 'sync';
  const title = isSync ? "Airtable'a Veri Gönder" : "Airtable'dan Veri Al";
  const confirmButtonText = isSync ? 'Onayla ve Gönder' : 'Onayla ve Al';
  const warningText = isSync 
    ? "Bu işlem, mevcut uygulama verilerinizi Airtable'daki kaydın üzerine yazacaktır. Airtable'da kayıt yoksa yeni bir kayıt oluşturulacaktır."
    : "Bu işlem, Airtable'dan alınan verileri mevcut uygulama verilerinizin üzerine yazacaktır. Mevcut verileriniz kaybolabilir.";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <a 
            href="https://airtable.com/appgMyZNvnJMRCqT1/tbly4plMhITLvABVr/viwf7PJ8pavjyfGCr?blocks=hide"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          >
            <ExternalLinkIcon className="w-5 h-5" />
            Canlı Data Görüntüle
          </a>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Kurulum Talimatları</h4>
            <p className="text-base text-slate-600 mb-4">
              Senkronizasyonun çalışması için Airtable hesabınızda aşağıdaki gibi bir yapı oluşturmanız gerekmektedir:
            </p>
            <ul className="list-decimal list-inside space-y-2 text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <li>
                <strong>Base (Veritabanı):</strong> Koddaki (`services/airtableService.ts`) ID ile eşleşen bir Base kullanın.
                <div className="text-sm text-slate-500 mt-1 ml-4 p-2 bg-slate-100 rounded">Base ID: `appgMyZNvnJMRCqT1`</div>
              </li>
              <li>
                <strong>Table (Tablo):</strong> Base içinde tam olarak `Pomodoro` adında bir tablo oluşturun.
              </li>
              <li>
                <strong>Fields (Alanlar):</strong> Tablonun birincil alanı (ilk sütun) `Name` adında ve `Single line text` tipinde olmalıdır. Tüm uygulama verileri bu alana kaydedilecektir. Başka bir alana gerek yoktur.
              </li>
            </ul>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
            <AlertTriangleIcon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
                <h5 className="font-semibold text-amber-800">Önemli Uyarı</h5>
                <p className="text-sm text-amber-700">{warningText}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
            İptal
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-base font-bold text-white rounded-lg transition-colors ${isSync ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AirtableInfoModal;