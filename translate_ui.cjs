const fs = require('fs');

const appPath = 'src/App.jsx';
let appCode = fs.readFileSync(appPath, 'utf8');

const replaceList = [
    // Dashboard & Navigation
    ['> Yeni İşlem<', '> {t("Yeni İşlem")}<'],
    ['Harika! Şu an için kritik bir bildiriminiz yok.', '{t("Harika! Şu an için kritik bir bildiriminiz yok.")}'],
    ['Güvenli Bakiye (Abonelikler & Borçlar Düşüldü):', '{t("Güvenli Bakiye (Abonelikler & Borçlar Düşüldü):")}'],
    ['Sıradaki Gelir Beklentisi', '{t("Sıradaki Gelir Beklentisi")}'],
    ['Gün Sonra', '{t("Gün Sonra")}'],
    ['Aylık Bütçe:', '{t("Aylık Bütçe:")}'],
    ['>Harcama (', '>{t("Harcama")} ('],
    ['> Düzenle<', '> {t("Düzenle")}<'],
    ['>Gelir <', '>{t("Gelir")} <'],
    ['>Gider <', '>{t("Gider")} <'],
    ['>İşlem Geçmişi <', '>{t("İşlem Geçmişi")} <'],
    ['placeholder="İşlem ara..."', 'placeholder={t("İşlem ara...")}'],
    ['>Tümü<', '>{t("Tümü")}<'],
    ['>Sadece Giderler<', '>{t("Sadece Giderler")}<'],
    ['>Sadece Gelirler<', '>{t("Sadece Gelirler")}<'],
    ['<th>İşlem Adı</th>', '<th>{t("İşlem Adı")}</th>'],
    ['<th>Kategori</th>', '<th>{t("Kategori")}</th>'],
    ['<th>Tarih</th>', '<th>{t("Tarih")}</th>'],
    ['>Tutar</th>', '>{t("Tutar")}</th>'],
    ['>İşlem</th>', '>{t("İşlem")}</th>'],
    ['title="Fiş Ekli"', 'title={t("Fiş Ekli")}'],
    ['title="Sil"', 'title={t("Sil")}'],
    ['Kriterlerinize uygun işlem bulunamadı.', '{t("Kriterlerinize uygun işlem bulunamadı.")}'],

    // Analytics
    ['> Finansal İçgörüler<', '> {t("Finansal İçgörüler")}<'],
    ['<h2>Kategori Dağılımı</h2>', '<h2>{t("Kategori Dağılımı")}</h2>'],
    ['>Giderlerinizin seçili periyottaki dağılımı (', '>{t("Giderlerinizin seçili periyottaki dağılımı")} ('],
    ['Gösterilecek harcama verisi bulunmuyor.', '{t("Gösterilecek harcama verisi bulunmuyor.")}'],

    // Goals
    ['<h2>Birikim Hedefleri</h2>', '<h2>{t("Birikim Hedefleri")}</h2>'],
    ['>Gelecek planlarınız için para biriktirin.<', '>{t("Gelecek planlarınız için para biriktirin.")}<'],
    ['> Yeni Hedef<', '> {t("Yeni Hedef")}<'],
    ['>TAMAMLANDI 🎉<', '>{t("TAMAMLANDI")} 🎉<'],
    ['>Biriken: ', '>{t("Biriken")}: '],
    ['>Hedef: ', '>{t("Hedef")}: '],
    ['> Hedefe Ulaşıldı<', '> {t("Hedefe Ulaşıldı")}<'],
    ['> Para Ekle<', '> {t("Para Ekle")}<'],
    ['Henüz bir hedefiniz yok.', '{t("Henüz bir hedefiniz yok.")}'],

    // Subscriptions & Bills & Income
    ['> Yeni Kayıt<', '> {t("Yeni Kayıt")}<'],
    ['> Gelir Ekle<', '> {t("Gelir Ekle")}<'],
    ['<th>Servis / Abonelik</th>', '<th>{t("Servis / Abonelik")}</th>'],
    ['<th>Sonraki Çekim</th>', '<th>{t("Sonraki Çekim")}</th>'],
    ['<th>Tutar (Aylık)</th>', '<th>{t("Tutar (Aylık)")}</th>'],
    ['<th>Durum</th>', '<th>{t("Durum")}</th>'],
    ['<th>Fatura Tipi</th>', '<th>{t("Fatura Tipi")}</th>'],
    ['<th>Ödeme Tarihi</th>', '<th>{t("Ödeme Tarihi")}</th>'],
    ['<th>Gelir Tipi</th>', '<th>{t("Gelir Tipi")}</th>'],
    ['<th>Sonraki Tahsilat</th>', '<th>{t("Sonraki Tahsilat")}</th>'],
    ['<th>Aylık Tutar</th>', '<th>{t("Aylık Tutar")}</th>'],
    ['<th>Aktiflik</th>', '<th>{t("Aktiflik")}</th>'],
    ['Kayıtlı fatura yok.', '{t("Kayıtlı fatura yok.")}'],
    ['Kayıtlı düzenli gelir yok.', '{t("Kayıtlı düzenli gelir yok.")}'],

    // Debts
    ['<h2>Borç ve Alacak Defteri</h2>', '<h2>{t("Borç ve Alacak Defteri")}</h2>'],
    ['>Kişilere verdiğiniz veya aldığınız borçları takip edin.<', '>{t("Kişilere verdiğiniz veya aldığınız borçları takip edin.")}<'],
    ['>Toplam Alacak (Bana Ödenecek)<', '>{t("Toplam Alacak (Bana Ödenecek)")}<'],
    ['>Toplam Borç (Benim Ödeyeceğim)<', '>{t("Toplam Borç (Benim Ödeyeceğim)")}<'],
    ['<th>Kişi / Kurum</th>', '<th>{t("Kişi / Kurum")}</th>'],
    ['<th>Tür</th>', '<th>{t("Tür")}</th>'],
    ['<th>Veriliş Tarihi</th>', '<th>{t("Veriliş Tarihi")}</th>'],
    ['>Ödendi<', '>{t("Ödendi")}<'],
    ['>Bekliyor<', '>{t("Bekliyor")}<'],
    ['> Kapat<', '> {t("Kapat")}<'],

    // Assets
    ['> Varlık Ekle<', '> {t("Varlık Ekle")}<'],
    ['>Ana Bakiye: ', '>{t("Ana Bakiye")}: '],
    ['>Kayıtlı Varlıklar: ', '>{t("Kayıtlı Varlıklar")}: '],
    ['>Net Borç/Alacak: ', '>{t("Net Borç/Alacak")}: '],

    // Modals & Subpages
    ['<h2>Yeni İşlem Ekle</h2>', '<h2>{t("Yeni İşlem Ekle")}</h2>'],
    ['>İptal<', '>{t("İptal")}<'],
    ['>Kaydet<', '>{t("Kaydet")}<'],
    ['>Bölüştür (Alman Usulü)<', '>{t("Bölüştür (Alman Usulü)")}<'],
    ['>Opsiyonel OCR<', '>{t("Opsiyonel OCR")}<'],
    ['>Tutar (', '>{t("Tutar")} ('],
    ['>İşlem Başlığı<', '>{t("İşlem Başlığı")}<'],
    ['>Fiş / Fatura Görseli', '>{t("Fiş / Fatura Görseli")}'],
    ['>Seçiniz<', '>{t("Seçiniz")}<'],
    ['>Not (İsteğe Bağlı)<', '>{t("Not (İsteğe Bağlı)")}<'],
    ['>Kişi Sayısı (Siz Dahil):<', '>{t("Kişi Sayısı (Siz Dahil):")}<'],
    ['>Size Düşen: ', '>{t("Size Düşen")}: ']
];

let modifiedCode = appCode;
for (const [search, replace] of replaceList) {
    modifiedCode = modifiedCode.split(search).join(replace);
}

fs.writeFileSync(appPath, modifiedCode, 'utf8');
console.log('App.jsx translated with direct matchers.');

// Now for Locales...
const localesPath = 'src/locales.js';
let localesCode = fs.readFileSync(localesPath, 'utf8');

const newEnKeys = {
    "Harika! Şu an için kritik bir bildiriminiz yok.": "Great! You have no critical notifications right now.",
    "Sıradaki Gelir Beklentisi": "Next Expected Income",
    "Gün Sonra": "Days Later",
    "Aylık Bütçe:": "Monthly Budget:",
    "Harcama": "Expense",
    "Düzenle": "Edit",
    "İşlem Geçmişi": "Transaction History",
    "İşlem ara...": "Search transaction...",
    "Tümü": "All",
    "Sadece Giderler": "Expenses Only",
    "Sadece Gelirler": "Incomes Only",
    "İşlem Adı": "Transaction Name",
    "Kategori": "Category",
    "Tarih": "Date",
    "Tutar": "Amount",
    "İşlem": "Action",
    "Fiş Ekli": "Receipt Attached",
    "Sil": "Delete",
    "Kriterlerinize uygun işlem bulunamadı.": "No transactions match your criteria.",
    "Finansal İçgörüler": "Financial Insights",
    "Kategori Dağılımı": "Category Breakdown",
    "Giderlerinizin seçili periyottaki dağılımı": "Distribution of your expenses in the selected period",
    "Gösterilecek harcama verisi bulunmuyor.": "No spending data to show.",
    "Birikim Hedefleri": "Savings Goals",
    "Gelecek planlarınız için para biriktirin.": "Save money for your future plans.",
    "Yeni Hedef": "New Goal",
    "TAMAMLANDI": "COMPLETED",
    "Biriken": "Saved",
    "Hedef": "Target",
    "Hedefe Ulaşıldı": "Goal Reached",
    "Para Ekle": "Add Funds",
    "Henüz bir hedefiniz yok.": "You don't have a goal yet.",
    "Yeni Kayıt": "New Entry",
    "Gelir Ekle": "Add Income",
    "Servis / Abonelik": "Service / Sub",
    "Sonraki Çekim": "Next Billing",
    "Tutar (Aylık)": "Amount (Monthly)",
    "Durum": "Status",
    "Fatura Tipi": "Bill Type",
    "Ödeme Tarihi": "Payment Date",
    "Gelir Tipi": "Income Type",
    "Sonraki Tahsilat": "Next Collection",
    "Aylık Tutar": "Monthly Amount",
    "Aktiflik": "Activity",
    "Kayıtlı fatura yok.": "No saved bills.",
    "Kayıtlı düzenli gelir yok.": "No saved regular incomes.",
    "Borç ve Alacak Defteri": "Debts & Receivables",
    "Kişilere verdiğiniz veya aldığınız borçları takip edin.": "Track the debts you have given or received from people.",
    "Toplam Alacak (Bana Ödenecek)": "Total Receivables (Owed to Me)",
    "Toplam Borç (Benim Ödeyeceğim)": "Total Debt (I Owe)",
    "Kişi / Kurum": "Person / Corporation",
    "Tür": "Type",
    "Veriliş Tarihi": "Issue Date",
    "Ödendi": "Paid",
    "Bekliyor": "Pending",
    "Kapat": "Close",
    "Varlık Ekle": "Add Asset",
    "Ana Bakiye": "Main Balance",
    "Kayıtlı Varlıklar": "Registered Assets",
    "Net Borç/Alacak": "Net Debt/Claim",
    "Yeni İşlem Ekle": "Add New Transaction",
    "İptal": "Cancel",
    "Kaydet": "Save",
    "Bölüştür (Alman Usulü)": "Split (Dutch Treat)",
    "Opsiyonel OCR": "Optional OCR",
    "İşlem Başlığı": "Title",
    "Fiş / Fatura Görseli": "Receipt / Invoice Image",
    "Seçiniz": "Select",
    "Not (İsteğe Bağlı)": "Note (Optional)",
    "Kişi Sayısı (Siz Dahil):": "Number of People (Inc. You):",
    "Size Düşen": "Your Share"
};

// Check if en already has it, if not, append to the object inside locales.js.
// Since it's a JS file, we'll rebuild the export object safely.
let extractEn = localesCode.match(/en:\s*\{([\s\S]*?)\}/)[1];
for (const [key, value] of Object.entries(newEnKeys)) {
    if (!extractEn.includes(`"${key}"`)) {
        extractEn += `\n        "${key}": "${value}",`;
    }
}

localesCode = localesCode.replace(/en:\\s*\\{([\\s\\S]*?)\\}/, "en: {" + extractEn + "\\n    }");
fs.writeFileSync(localesPath, localesCode, 'utf8');
console.log('Locales updated!');
