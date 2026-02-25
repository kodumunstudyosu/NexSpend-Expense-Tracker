import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();
pptx.author = "NexSpend / Antigravity AI";
pptx.company = "NexSpend Personal Finance";
pptx.title = "NexSpend - Uygulama Özellikleri Sunumu";
pptx.layout = "LAYOUT_16x9";

// Tema Renkleri
const THEME = {
    primary: "6366f1",    // Indigo
    secondary: "8b5cf6",  // Violet
    dark: "0f172a",       // Slate 900
    light: "f8fafc",      // Slate 50
    text: "334155",       // Slate 700
    accent: "10b981",     // Emerald
    danger: "ef4444"      // Red
};

// Başlangıç Slaytı (Kapak)
let slide = pptx.addSlide();
slide.background = { color: THEME.dark };
slide.addText("NexSpend", { x: "10%", y: "30%", w: "80%", h: 2, fontSize: 64, color: THEME.primary, bold: true, align: "center", fontFace: "Arial" });
slide.addText("Kapsamlı V4 Özellik Sunumu", { x: "10%", y: "50%", w: "80%", h: 1, fontSize: 28, color: THEME.light, align: "center", fontFace: "Arial" });
slide.addText("Yeni Nesil Akıllı Kişisel Finans Asistanınız", { x: "10%", y: "60%", w: "80%", h: 1, fontSize: 18, color: "94A3B8", align: "center", fontFace: "Arial" });

const addFeatureSlide = (title, features, bgColor) => {
    let s = pptx.addSlide();
    s.background = { color: bgColor || THEME.light };

    // Başlık Şekli ve Metni
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.2, fill: { color: THEME.primary } });
    s.addText(title, { x: 0.5, y: 0.1, w: "90%", h: 1, fontSize: 32, color: "FFFFFF", bold: true, fontFace: "Arial" });

    // Özellik listesi (Bullet Points)
    if (features && features.length > 0) {
        let bulletOptions = { x: 0.5, y: 1.5, w: "90%", h: 5.5, fontSize: 18, color: THEME.text, bullet: true, lineSpacing: 35, fontFace: "Arial" };
        s.addText(features.join("\n"), bulletOptions);
    }
};

addFeatureSlide(
    "V1 - Temel Modern Bütünlük",
    [
        "Modüler & Premium Tasarım: Glassmorphism efektleri ve Vanilla CSS tabanlı animasyonlu arayüz.",
        "Dashboard Ekranı: Anlık bütçe hesaplamaları, son işlemlerin listelenmesi ve harcama kategorilerine göre pasta grafikleri.",
        "İşlem Yönetimi: Gelir ve gider ekleme, silme. Özel tasarım input fieldlar.",
        "Responsive Dark/Light Mod: Tarayıcı hafızalı ve CSS Variables ile yönetilen kusursuz gece/gündüz tema dönüşümleri."
    ]
);

addFeatureSlide(
    "V2 - Detaylı Analiz & Hedefler",
    [
        "Kapsamlı Analitik: 'recharts' kütüphanesi ile desteklenmiş haftalık ve 6 aylık trend çubuk grafikleri.",
        "Zaman Filtreleme: Tüm zamanlar, Bugün, Son 7 Gün, Ay, Yıl bazında anlık veri süzme özelliği.",
        "Tasarruf Hedefleri Yönetimi: Bütçe ayıracağınız hedefler belirleme, onlara ara bütçe atamaları (Mevduat vs) yapabilme.",
        "Arama ve Tablo (Datatable): Arama kutusu ile işlemlerde saniyelik filtreleme yetkisi."
    ]
);

addFeatureSlide(
    "V3 - Gelişmiş Finans & İleri Seviye Özellikler",
    [
        "Ortak Harcama (Split Expense): Restorandaki hesabı 3 kişi bölüşürseniz, sizin payınızı gider yazar, kalanları otomatik alacak kaydeder.",
        "Borç & Alacak Defteri (IOU): Arkadaşlara veya kurumlara olan borç/alacakları takip eder, kapatılınca bakiyeye yansıtır.",
        "Portföy/Varlık Yönetimi (Net Worth): Sadece harcama değil; Nakit, Altın, Kripto, Hisse Senedi kayıtları tutularak toplam servet hesaplanır.",
        "Yapay Zeka Fiş Simülasyonu: Fiş yükleyerek OCR mantığında form doldurma işlemini pratikleştirir.",
        "Gerçek Güvenli Bakiye (Safe Balance): Yaklaşan bekleyen borçları net bakiyeden düşerek 'Harcanabilir Net Parayı' listeler."
    ]
);

addFeatureSlide(
    "V4 - SaaS Vizyonu & Kullanıcı Sadakati (Akıllı Asistan)",
    [
        "Aylık Finansal Takvim: Harcamalarınız, gelirleriniz ve faturalarınız özel bir renkli takvimde nokta ikonlarla sergilenir.",
        "Otomatik Kategori Etiketleme: Starbucks, Martı vb. işlemleri yazarken sistem arkadan uygun kategoriyi sizin adınıza saniyesinde seçer.",
        "Live API (Canlı Kur) Entegrasyonu: Sahip olduğunuz yabancı dövizleri her gün TCMB (open.er-api) API'sinden çekilen gerçek dolar kurlarıyla hesaplar.",
        "Akıllı Bildirim Merkezi (Notification Bell): Bütçenin %80'i aşıldığında veya yaklaşan faturalar/abonelikler devreye girdiğinde, sağ üstteki çan bildirimle uyarır.",
        "PDF / Excel Veri Aktarımı: Verilerinizi tam destekle ve hatasız UTF-8 Excel standartında raporlamanıza imkan tanır."
    ]
);

// Kapanış Slaytı
let finishSlide = pptx.addSlide();
finishSlide.background = { color: THEME.secondary };
finishSlide.addText("Teşekkürler!", { x: "10%", y: "40%", w: "80%", h: 2, fontSize: 60, color: "FFFFFF", bold: true, align: "center", fontFace: "Arial" });
finishSlide.addText("NexSpend - Finansal Asistanınız", { x: "10%", y: "60%", w: "80%", h: 1, fontSize: 24, color: "EEEEEE", align: "center", fontFace: "Arial" });

// Dosyayı Kaydet
const pptxName = "NexSpend_Ozellik_Sunumu_V1_V4.pptx";
pptx.writeFile({ fileName: pptxName })
    .then(() => console.log(`Sunum dosyası başarıyla oluşturuldu: ${pptxName}`))
    .catch(err => console.error(err));
