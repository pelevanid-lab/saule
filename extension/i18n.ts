type Dict = Record<string, string>;

const dictionaries: Record<string, Dict> = {
  en: {
    "popup.title": "Saule Headquarters",
    "popup.connect_title": "Connect to Headquarters",
    "popup.connect_desc": "Please paste your 'Extension Token' from the SML Terminal here.",
    "popup.connect_placeholder": "Connection Code (Token)",
    "popup.connect_btn": "Connect",
    "popup.connected": "Connected",
    "popup.disconnect": "Disconnect",
    "popup.privacy_title": "Privacy (Blacklist)",
    "popup.privacy_desc": "Saule actively listens to provide context. Add domains here to disable Auto-Memory.",
    "popup.privacy_placeholder": "e.g. bank.com",
    "popup.privacy_add": "Add",
    "popup.privacy_empty": "No blacklisted domains",
    "content.listening": "SML is listening silently.",
    "content.placeholder": "Recall or save to memory...",
    "content.error_token": "Please enter your SML Token code from the extension menu (Popup) to connect.",
    "content.error_connection": "Failed to connect to Headquarters.",
    "content.auto_summary_prompt": "I navigated the page and my actions are included. Please write a response that summarizes my behavior on the page and saves notable information to memory, taking into account what I reviewed/clicked.",
    "content.new_chat": "New Chat",
    "content.open_terminal": "Open Terminal",
    "content.record_start_stop": "Start / Stop Recording",
    "content.new_chat_tooltip": "New Chat (Change Topic)",
    "content.close": "Close",
    "content.recorded_events": "Page Actions Recorded",
    "content.cancel": "Cancel",
    "content.drag_tooltip": "Drag or Click",
    "content.stop_recording": "Stop Recording",
    "content.click_event": "Clicked",
    "content.read_event": "Read/Selected Text",
    "content.scroll_event": "Reviewed part of the page (downwards)",
  },
  tr: {
    "popup.title": "Saule Merkezi",
    "popup.connect_title": "Merkeze Bağlan",
    "popup.connect_desc": "Lütfen SML Terminal'deki 'Extension Bağlantı Kodu'nu buraya yapıştırın.",
    "popup.connect_placeholder": "Bağlantı Kodu (Token)",
    "popup.connect_btn": "Bağlan",
    "popup.connected": "Bağlı",
    "popup.disconnect": "Bağlantıyı Kes",
    "popup.privacy_title": "Gizlilik (Kara Liste)",
    "popup.privacy_desc": "Saule bağlam sağlamak için aktif dinler. Otomatik hafızayı kapatmak için alan adlarını (domain) buraya ekleyin.",
    "popup.privacy_placeholder": "Örn. banka.com",
    "popup.privacy_add": "Ekle",
    "popup.privacy_empty": "Kara listede alan adı yok",
    "content.listening": "SML sessizce dinliyor.",
    "content.placeholder": "Hatırla veya hafızaya kaydet...",
    "content.error_token": "Lütfen eklenti menüsünden (Popup) SML Token kodunuzu girerek bağlanın.",
    "content.error_connection": "Merkez (Headquarters) ile bağlantı kurulamadı.",
    "content.auto_summary_prompt": "Sayfada gezindim ve hareketlerim eklidir. Lütfen incelediğim/tıkladığım şeyleri dikkate alarak bana sayfadaki davranışlarımı özetleyen ve kayda değer bilgileri hafızaya alan bir cevap yaz.",
    "content.new_chat": "Yeni Sohbet",
    "content.open_terminal": "Terminal'i Aç",
    "content.record_start_stop": "Kaydı Başlat / Durdur",
    "content.new_chat_tooltip": "Yeni Sohbet (Konu Değiştir)",
    "content.close": "Kapat",
    "content.recorded_events": "Sayfa Hareketi Kaydedildi",
    "content.cancel": "İptal",
    "content.drag_tooltip": "Sürükle veya Tıkla",
    "content.stop_recording": "Kaydı Durdur",
    "content.click_event": "Tıkladı",
    "content.read_event": "Metin Seçti/Okudu",
    "content.scroll_event": "Sayfanın belirtilen kısmı (aşağı doğru) incelendi",
  }
};

export function getLanguage(): string {
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language.startsWith('tr') ? 'tr' : 'en';
  }
  return 'en';
}

export function t(key: string): string {
  const lang = getLanguage();
  const dict = dictionaries[lang] || dictionaries.en;
  return dict[key] || dictionaries.en[key] || key;
}
