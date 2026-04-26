import { GoogleGenAI } from '@google/genai';
import { AnalysisResult } from './types';
import { postProcessAnalysis } from './analysisPostProcess';

const GEMINI_MODEL = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `Sen bir belediye entegre bildirim yönetim sisteminin analiz modülüsün.
Vatandaş bildirimleri için iç değerlendirme notu oluştur.
Bildirimi sınıflandır, sorumlu birimi belirle, 0-100 arası risk skoru ata, öncelik düzeyi belirle, kısa ve kurumsal bir ön değerlendirme özeti yaz, ilgili birime yönlendirme notunu hazırla.

ÖNEMLİ: Su patlakları, boru patlamaları ve caddeyi basan sular (flood, burst pipe) EN YÜKSEK öncelikli (high/critical) durumlardır. Bu durumlarda risk skoru 75'ten az olamaz. Eğer ulaşımı veya güvenliği tehlikeye atıyorsa (cadde göl oldu, yol kapalı, tehlike) risk skoru 85+ ve priority critical olmalıdır.

Kullanıcılar Türkçe karakter kullanmadan (ingilizce klavye) yazmış olabilir (ör: patladi, cukur, cope, agac). Analiz yaparken bunları doğru anla.

Risk puanı kuralları:
- 85-100: critical
- 65-84: high
- 35-64: medium
- 0-34: low

Birimler: Fen İşleri, Park ve Bahçeler, Ulaşım Hizmetleri, Su ve Kanalizasyon, Temizlik İşleri, Zabıta, Aydınlatma ve Elektrik Bakım

aiSummary şu kalıbı takip etsin: "Bildirim, [birim] birimini ilgilendiren [öncelik] öncelikli bir [konu türü] sorunu olarak değerlendirilmiştir."
recommendedAction şu kalıbı takip etsin: "[Birim] birimine [işlem türü] için yönlendirildi."

Yalnızca aşağıdaki JSON formatında döndür:
{
  "category": "string",
  "department": "string",
  "riskScore": 0,
  "priority": "low",
  "aiSummary": "string",
  "recommendedAction": "string"
}`;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export async function analyzeWithGemini(
  title: string,
  description: string
): Promise<AnalysisResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Gemini] API anahtarı bulunamadı, kural tabanlı analize geçiliyor.');
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `${SYSTEM_PROMPT}\n\nBildirim Başlığı: ${title}\n\nBildirim Açıklaması: ${description}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const rawText = response.text?.trim() ?? '';
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(cleaned);

    const initialResult: AnalysisResult = {
      category: String(parsed.category ?? 'Diğer'),
      department: String(parsed.department ?? 'Genel Belediye Hizmetleri'),
      riskScore: clamp(Number(parsed.riskScore ?? 0), 0, 100),
      priority: 'low', // Will be recalculated in postProcess
      aiSummary: String(parsed.aiSummary ?? ''),
      recommendedAction: String(parsed.recommendedAction ?? ''),
    };

    // Apply robust post-processing (normalization + priority sync + keyword overrides)
    return postProcessAnalysis(initialResult, title, description);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[Gemini] Analiz başarısız, kural tabanlı analize geçiliyor. Neden:', message);
    return null;
  }
}
