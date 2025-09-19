import React from 'react';
import { AlertTriangleIcon, ExternalLinkIcon } from './icons';

interface AirtableInfoModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const AirtableInfoModal: React.FC<AirtableInfoModalProps> = ({ onClose, onConfirm }) => {
  const title = "Airtable Senkronizasyonu";
  const confirmButtonText = 'Onayla ve Tümünü Gönder';
  const warningText = "Bu işlem, Airtable'daki 'Pomodoro' tablosundaki tüm mevcut kayıtları VE 'PomoSablon' tablosundaki 'personel' ve 'task' statüsündeki tüm kayıtları silecek ve güncel uygulama verilerini yeniden oluşturacaktır. Airtable'daki eski veriler kaybolacaktır.";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <a 
            href="https://airtable.com/appgMyZNvnJMRCqT1/tblg2A332pWXoMTsY/viwzupg83gPAuVH1n?blocks=hide"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-bold rounded-md shadow-sm text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          >
            <ExternalLinkIcon className="w-5 h-5" />
            Canlı Veriyi Airtable'da Görüntüle
          </a>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Kurulum Talimatları</h4>
            <p className="text-base text-slate-600 mb-4">
              Verilerin Airtable'a doğru bir şekilde gönderilmesi için Airtable hesabınızda aşağıdaki yapıyı oluşturmanız gerekmektedir:
            </p>
            
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              {/* Pomodoro Table Instructions */}
              <div>
                <h5 className="font-bold text-slate-800">1. Görevler için `Pomodoro` Tablosu</h5>
                <ul className="list-decimal list-inside space-y-2 text-slate-600 mt-2 pl-2">
                  <li>
                    <strong>Table (Tablo):</strong> Base içinde tam olarak `Pomodoro` adında bir tablo oluşturun.
                  </li>
                  <li>
                    <strong>Fields (Alanlar):</strong> Bu tablodaki alanlar şunlar olmalıdır:
                    <ul className="list-disc list-inside space-y-1 text-slate-600 mt-2 pl-6">
                      <li><code>Task Title</code> (<strong>Ana Alan</strong>, Kısa metin)</li>
                      <li><code>Work Package</code> (Kısa metin)</li>
                      <li><code>Company</code> (Kısa metin)</li>
                      <li><code>Status</code> (Tekli seçim: `Bekliyor`, `Aktif`, `Tamamlandı`)</li>
                      <li><code>Duration</code> (Sayı, Tamsayı)</li>
                      <li><code>Assigned Workers</code> (Kısa metin)</li>
                      <li><code>Subtask Checklist</code> (Uzun metin)</li>
                      <li><code>Manager Notes</code> (Uzun metin)</li>
                      <li><code>Start Time</code> (Tarih, Saat gösterimi dahil & "Tüm ortak çalışanlar için aynı saat dilimini kullan" AÇIK)</li>
                      <li><code>End Time</code> (Tarih, Saat gösterimi dahil & "Tüm ortak çalışanlar için aynı saat dilimini kullan" AÇIK)</li>
                      <li><code>ImageUrl</code> (URL veya Kısa metin)</li>
                      <li><code>PdfUrl</code> (URL veya Kısa metin)</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <hr className="my-4"/>
              
              {/* PomoSablon Table Instructions */}
              <div>
                <h5 className="font-bold text-slate-800">2. Ekip ve Şablonlar için `PomoSablon` Tablosu</h5>
                 <ul className="list-decimal list-inside space-y-2 text-slate-600 mt-2 pl-2">
                  <li>
                    <strong>Table (Tablo):</strong> Base içinde tam olarak `PomoSablon` adında bir tablo oluşturun.
                  </li>
                  <li>
                    <strong>Fields (Alanlar):</strong> Bu tablodaki alanlar hem ekip hem de şablon verilerini tutacaktır:
                    <ul className="list-disc list-inside space-y-1 text-slate-600 mt-2 pl-6">
                      <li><code>Status</code> (Tekli seçim: `personel`, `task`) - Kaydın türünü belirtir.</li>
                      <li><strong>Şablonlar İçin:</strong>
                        <ul className="list--circle list-inside ml-4 text-sm">
                          <li><code>Template Title</code> (<strong>Ana Alan</strong>, Kısa metin)</li>
                          <li><code>Description</code> (Uzun metin)</li>
                          <li><code>Tasks</code> (Uzun metin)</li>
                        </ul>
                      </li>
                       <li><strong>Ekip İçin:</strong>
                        <ul className="list-circle list-inside ml-4 text-sm">
                          <li><code>Personel</code> (Kısa metin)</li>
                          <li><code>PersonelID</code> (Kısa metin)</li>
                          <li><code>Company</code> (Kısa metin)</li>
                          <li><code>Position</code> (Kısa metin)</li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
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
          <button onClick={onConfirm} className="px-4 py-2 text-base font-bold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AirtableInfoModal;