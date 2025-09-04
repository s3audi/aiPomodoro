import type { WorkPackageTemplate } from './types';

export const TEMPLATES: WorkPackageTemplate[] = [
  {
    id: 'tpl-elec-1',
    title: 'Pano Montajı ve Devreye Alma',
    description: 'Ana dağıtım panosunun montajı, kablolaması ve testlerinin yapılması.',
    tasks: [
      {
        title: 'Pano Fiziksel Montajı',
        durationMinutes: 45,
        subTasks: [
          { title: 'Pano yerinin hazırlanması ve işaretlenmesi' },
          { title: 'Pano şasesinin duvara sabitlenmesi' },
          { title: 'Topraklama barasının montajı' },
        ],
      },
      {
        title: 'Şalt Malzemelerinin Montajı',
        durationMinutes: 60,
        subTasks: [
          { title: 'Ana kesicinin montajı' },
          { title: 'Kaçak akım rölelerinin montajı' },
          { title: 'Sigortaların raya dizilmesi' },
          { title: 'Kontaktör ve termiklerin montajı' },
        ],
      },
      {
        title: 'Pano İçi Kablolama',
        durationMinutes: 90,
        subTasks: [
          { title: 'Güç devresi kablolarının çekilmesi' },
          { title: 'Kumanda devresi kablolarının çekilmesi' },
          { title: 'Kablo etiketlemesi ve numaralandırma' },
        ],
      },
      {
        title: 'Test ve Devreye Alma',
        durationMinutes: 50,
        subTasks: [
          { title: 'Gözle fiziksel kontrol yapılması' },
          { title: 'İzolasyon (meger) testi yapılması' },
          { title: 'Panoya enerji verilmesi ve fonksiyon testleri' },
        ],
      },
    ],
  },
  {
    id: 'tpl-elec-2',
    title: 'Aydınlatma Armatür Montajı',
    description: 'Ofis katı için LED aydınlatma armatürlerinin montajı ve bağlantıları.',
    tasks: [
      {
        title: 'Keşif ve Hazırlık',
        durationMinutes: 30,
        subTasks: [
          { title: 'Armatür yerlerinin projeye göre işaretlenmesi' },
          { title: 'Gerekli malzemelerin (dübel, vida) hazırlanması' },
        ],
      },
      {
        title: 'Armatürlerin Montajı',
        durationMinutes: 75,
        subTasks: [
          { title: 'Tavana montaj aparatlarının takılması' },
          { title: 'LED armatürlerin kasalarının sabitlenmesi' },
          { title: 'Difüzörlerin ve kapakların takılması' },
        ],
      },
      {
        title: 'Elektriksel Bağlantılar',
        durationMinutes: 50,
        subTasks: [
          { title: 'Sorti kablolarının armatür klemenslerine bağlanması' },
          { title: 'Topraklama bağlantılarının kontrolü' },
        ],
      },
    ],
  },
  {
    id: 'tpl-elec-3',
    title: 'Kablo Tavası Kurulumu',
    description: 'Koridor boyunca data ve enerji kabloları için kablo tavası montajı.',
    tasks: [
        {
            title: 'Güzergah İşaretleme ve Askı Montajı',
            durationMinutes: 60,
            subTasks: [
                { title: 'Kablo tavası güzergahının lazerle işaretlenmesi' },
                { title: 'Askı destek çubuklarının tavana montajı' },
            ]
        },
        {
            title: 'Tavaların Yerleştirilmesi',
            durationMinutes: 90,
            subTasks: [
                { title: 'Kablo tavalarının askı desteklerine yerleştirilmesi' },
                { title: 'Tava ek parçaları ile birleştirme yapılması' },
                { title: 'Dönüş ve T-ek parçalarının montajı' },
            ]
        },
        {
            title: 'Topraklama ve Son Kontroller',
            durationMinutes: 30,
            subTasks: [
                { title: 'Tavalar arası topraklama sürekliliğinin sağlanması' },
                { title: 'Tüm bağlantıların sıkılık kontrolü' },
            ]
        }
    ]
  },
  {
    id: 'tpl-elec-4',
    title: 'Priz ve Anahtar Montajı',
    description: 'Odalardaki priz ve anahtarların montajı ve bağlantılarının yapılması.',
    tasks: [
        {
            title: 'Buat ve Kasa Kontrolü',
            durationMinutes: 25,
            subTasks: [
                { title: 'Sıva altı kasaların temizlenmesi' },
                { title: 'Kablo uçlarının kontrol edilmesi' },
            ]
        },
        {
            title: 'Mekanizma Montajı',
            durationMinutes: 70,
            subTasks: [
                { title: 'Priz mekanizmalarının kasalara takılması ve kablo bağlantısı' },
                { title: 'Anahtar mekanizmalarının kasalara takılması ve kablo bağlantısı' },
                { title: 'Mekanizmaların teraziye alınarak sabitlenmesi' },
            ]
        },
        {
            title: 'Çerçeve ve Kapak Takılması',
            durationMinutes: 25,
            subTasks: [
                { title: 'Tüm priz ve anahtarlara çerçevelerin takılması' },
                { title: 'Kapakların ve butonların takılması' },
            ]
        }
    ]
  },
  {
    id: 'tpl-elec-5',
    title: 'Topraklama Tesisatı',
    description: 'Bina temeli için temel topraklama ve eşpotansiyel baranın kurulması.',
    tasks: [
        {
            title: 'Kazı ve Şerit Serimi',
            durationMinutes: 50,
            subTasks: [
                { title: 'Temel topraklaması için güzergahın kazılması' },
                { title: 'Galvaniz topraklama şeridinin güzergaha serilmesi' },
            ]
        },
        {
            title: 'Bağlantı ve Ölçüm',
            durationMinutes: 60,
            subTasks: [
                { title: 'Topraklama şeridinin bina kolon filizlerine bağlanması' },
                { title: 'Eşpotansiyel baraya bağlantı filizinin bırakılması' },
                // FIX: Corrected a syntax error caused by a string being split across multiple lines.
                { title: 'İlk topraklama direnci ölçümünün yapılması' },
            ]
        }
    ]
  }
];