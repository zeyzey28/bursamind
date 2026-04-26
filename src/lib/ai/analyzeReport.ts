import { AnalysisResult } from './types';
import { analyzeReportRuleBased } from './ruleBasedAnalyzer';

/**
 * Client-side entry point: calls the server-side /api/analyze route.
 * Falls back to the rule-based analyzer if the API call fails.
 */
export async function analyzeReport(
  title: string,
  description: string
): Promise<AnalysisResult> {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data: AnalysisResult = await res.json();
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[analyzeReport] API çağrısı başarısız, kural tabanlı analize geçiliyor:', message);
    return analyzeReportRuleBased(title, description);
  }
}
