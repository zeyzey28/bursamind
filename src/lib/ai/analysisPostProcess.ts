import { AnalysisResult } from './types';
import { normalizeTurkishText } from './textNormalize';

function priorityFromScore(score: number): AnalysisResult['priority'] {
  if (score >= 85) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

/**
 * Universal post-processing to ensure critical categories and departments 
 * are correctly assigned even if the AI or basic rules miss them.
 * Handles English-keyboard Turkish text (normalized).
 */
export function postProcessAnalysis(
  result: AnalysisResult,
  originalTitle: string,
  originalDescription: string
): AnalysisResult {
  const normText = normalizeTurkishText(`${originalTitle} ${originalDescription}`);
  
  // Debug logs
  console.log("Normalized report text:", normText);

  let category = result.category;
  let department = result.department;
  let riskScore = result.riskScore;
  let aiSummary = result.aiSummary;
  let recommendedAction = result.recommendedAction;

  // 1. Water & Pipe Burst (Su ve Kanalizasyon)
  const isPipeBurst = [
    'boru patladi', 'boru patlagi', 'boru patlamasi', 'su borusu patladi', 
    'ana boru patladi', 'su kacagi', 'su sizintisi', 'yola su akiyor',
    'burst pipe', 'pipe burst', 'water leak', 'water main break'
  ].some(kw => normText.includes(kw));

  const isFlooded = [
    'cadde gol oldu', 'yol gol oldu', 'her yer gol oldu', 'su birikintisi', 
    'taskin', 'su tasmasi', 'su baskini', 'flooded road', 'sewage', 
    'kanalizasyon tasmasi', 'kanalizasyon tasti', 'gider tasti', 'logar tasti'
  ].some(kw => normText.includes(kw));

  if (isPipeBurst || isFlooded) {
    if (department !== 'Su ve Kanalizasyon') {
      department = 'Su ve Kanalizasyon';
      category = isPipeBurst ? 'Boru Patlağı' : 'Su ve Tesisat / Taşkın';
      aiSummary = 'Bildirim, Su ve Kanalizasyon birimini ilgilendiren öncelikli bir su/altyapı arızası olarak değerlendirilmiştir.';
      recommendedAction = 'Su ve Kanalizasyon birimine acil saha incelemesi ve hat müdahalesi için yönlendirildi.';
    }
    
    // Ensure minimum risk score for water issues
    const minRisk = isPipeBurst ? 75 : 70;
    if (riskScore < minRisk) riskScore = minRisk;

    // Critical escalation for severe flooding
    if (isFlooded && (
      normText.includes('gol oldu') || 
      normText.includes('yol kapali') || 
      normText.includes('arac gecemiyor') || 
      normText.includes('yaya gecemiyor') || 
      normText.includes('tehlike')
    )) {
      if (riskScore < 90) riskScore = 90;
      aiSummary = 'Bildirim, Su ve Kanalizasyon birimini ilgilendiren, ulaşımı engelleyen kritik bir taşkın/arıza olarak değerlendirilmiştir.';
    }
  }

  // 2. Emergency / Disaster (İtfaiye)
  if (
    normText.includes('yangin') || normText.includes('patlama') || 
    normText.includes('duman') || normText.includes('acil') ||
    normText.includes('fire') || normText.includes('explosion')
  ) {
    if (department !== 'İtfaiye') {
      department = 'İtfaiye';
      category = 'Acil Durum';
      aiSummary = 'Bildirim, İtfaiye birimini ilgilendiren kritik öncelikli bir acil durum olarak değerlendirilmiştir.';
      recommendedAction = 'İtfaiye birimine acil müdahale ve güvenlik koordinasyonu için yönlendirildi.';
    }
    if (riskScore < 95) riskScore = 95;
  }

  // 3. Road & Sidewalk (Fen İşleri / Ulaşım)
  if (normText.includes('cukur') || normText.includes('yol cukuru') || normText.includes('asfalt bozuldu')) {
    if (department === 'Genel Belediye Hizmetleri') {
      department = 'Ulaşım Hizmetleri';
      category = 'Altyapı';
    }
    if (riskScore < 60) riskScore = 60;
  }
  
  if (normText.includes('kaldirim coktu') || normText.includes('kaldirim kirildi')) {
    if (department === 'Genel Belediye Hizmetleri') {
      department = 'Fen İşleri';
      category = 'Altyapı';
    }
    if (riskScore < 50) riskScore = 50;
  }

  // 4. Lighting
  if (normText.includes('sokak lambasi') || normText.includes('lamba yanmiyor') || normText.includes('isik yanmiyor')) {
    if (department === 'Genel Belediye Hizmetleri') {
      department = 'Aydınlatma ve Elektrik Bakım';
      category = 'Elektrik';
    }
    if (riskScore < 40) riskScore = 40;
  }

  // 5. Cleaning
  if (normText.includes('cop birikti') || normText.includes('kotu koku') || normText.includes('konteyner dolu')) {
    if (department === 'Genel Belediye Hizmetleri') {
      department = 'Temizlik İşleri';
      category = 'Temizlik';
    }
    if (riskScore < 30) riskScore = 30;
  }

  // 6. Parks
  if (normText.includes('agac devrildi')) {
    if (department !== 'Park ve Bahçeler') {
      department = 'Park ve Bahçeler';
      category = 'Acil Durum'; // Escalated due to fallen tree hazard
    }
    if (riskScore < 75) riskScore = 75;
    aiSummary = 'Bildirim, Park ve Bahçeler birimini ilgilendiren yüksek öncelikli bir yol ve güvenlik sorunu olarak değerlendirilmiştir.';
  }

  // Final priority sync based on risk score (Strict Rule)
  const finalPriority = priorityFromScore(riskScore);

  const finalResult: AnalysisResult = {
    category,
    department,
    riskScore,
    priority: finalPriority,
    aiSummary,
    recommendedAction
  };

  console.log("Final post-processed analysis:", finalResult);
  return finalResult;
}
