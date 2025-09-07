import React from 'react';
import { AlertTriangleIcon, ExternalLinkIcon } from './icons';

interface AirtableInfoModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const AirtableInfoModal: React.FC<AirtableInfoModalProps> = ({ onClose, onConfirm }) => {
  const title = "Airtable'a Veri Gönder";
  const confirmButtonText = 'Onayla ve Tümünü Gönder';
  const warningText = "Bu işlem, Airtable'daki 'Pomodoro' tablosundaki tüm mevcut kayıtları silecek ve güncel görev listesini yeniden oluşturacaktır. Airtable'daki eski veriler kaybolacaktır.";

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
              Görevlerin Airtable'a doğru bir şekilde gönderilmesi için Airtable hesabınızda aşağıdaki yapıyı oluşturmanız gerekmektedir:
            </p>
            <ul className="list-decimal list-inside space-y-3 text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <li>
                <strong>Base (Veritabanı):</strong> Koddaki (`services/airtableService.ts`) ID ile eşleşen bir Base kullanın.
                <div className="text-sm text-slate-500 mt-1 ml-4 p-2 bg-slate-100 rounded">Base ID: `appgMyZNvnJMRCqT1`</div>
              </li>
              <li>
                <strong>Table (Tablo):</strong> Base içinde tam olarak `Pomodoro` adında bir tablo oluşturun.
              </li>
              <li>
                <strong>Fields (Alanlar):</strong> Tablonuzda aşağıdaki alanların (sütunların) tam olarak belirtilen isimler ve tiplerde oluşturulduğundan emin olun:
                <ul className="list-disc list-inside space-y-2 text-slate-600 mt-2 pl-6">
                  <li><code>Task Title</code> (<strong>Ana Alan</strong>, Kısa metin)</li>
                  <li><code>Work Package</code> (Kısa metin)</li>
                  <li>
                    <code>Status</code> (Tekli seçim. Seçenekler tam olarak şunlar olmalıdır: <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-md text-sm">Bekliyor</code>, <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-md text-sm">Aktif</code>, <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-md text-sm">Tamamlandı</code>)
                  </li>
                  <li><code>Duration</code> (Sayı, Tamsayı formatında)</li>
                  <li><code>Assigned Workers</code> (Kısa metin)</li>
                  <li><code>Subtasks</code> (Uzun metin)</li>
                  <li><code>Manager Notes</code> (Uzun metin)</li>
                </ul>
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
          <button onClick={onConfirm} className="px-4 py-2 text-base font-bold text-white rounded-lg transition-colors bg-blue-600 hover:bg-blue-700">
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AirtableInfoModal;