import { AnalysisResult } from "./types";
import { postProcessAnalysis } from "./analysisPostProcess";

/**
 * Basic rule-based analyzer that uses keyword matching.
 * It is used as a fallback or integrated into the main analysis flow.
 */
export function analyzeReportRuleBased(title: string, description: string): AnalysisResult {
  // We use a simple initial result and let the postProcessAnalysis do the heavy lifting
  // since it already contains the robust keyword matching and normalization.
  const initialResult: AnalysisResult = {
    category: 'Diğer',
    department: 'Genel Belediye Hizmetleri',
    riskScore: 15,
    priority: 'low',
    aiSummary: 'Bildirim, Genel Belediye Hizmetleri birimini ilgilendiren düşük öncelikli genel bir konu olarak değerlendirilmiştir.',
    recommendedAction: 'Genel Belediye Hizmetleri birimine manuel inceleme için yönlendirildi.'
  };

  return postProcessAnalysis(initialResult, title, description);
}
