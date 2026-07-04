export interface CRMEvent {
  action: 'view_product' | 'add_to_cart' | 'checkout' | 'page_view';
  productName?: string;
  price?: number;
  category?: string;
  url?: string;
  [key: string]: any;
}

export interface RuleResponse {
  triggered: boolean;
  message?: string;
  actionType?: 'notify' | 'redirect' | 'discount';
}

export class CRMRuleEngine {
  
  /**
   * Deterministic rule evaluator.
   * In a real production system, user budget/preferences would be injected here from the DB.
   */
  static evaluate(event: CRMEvent, userContext?: any): RuleResponse {
    // KURAL 1: Bütçe Aşımı Kontrolü
    // Varsayım: Kullanıcının 20000 TL bütçesi var (bunu veritabanından aldığımızı farz ediyoruz).
    const BUDGET_LIMIT = 20000;

    if (event.action === 'view_product' && event.price && event.price > BUDGET_LIMIT) {
      const excessAmount = event.price - BUDGET_LIMIT;
      return {
        triggered: true,
        actionType: 'notify',
        message: `İncelediğiniz ${event.productName || 'ürün'} belirlediğiniz bütçeyi ₺${excessAmount.toLocaleString('tr-TR')} aşıyor. Diğer Beiwe alternatiflerine göz atalım mı?`
      };
    }

    // KURAL 2: Sepet Ekleme
    if (event.action === 'add_to_cart') {
      return {
        triggered: true,
        actionType: 'notify',
        message: `Harika seçim! ${event.productName} sepetinize eklendi. Siparişi tamamlamak için kasaya geçebilirsiniz.`
      };
    }

    return { triggered: false };
  }
}
