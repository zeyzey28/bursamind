import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/ai/geminiAnalyzer';
import { analyzeReportRuleBased } from '@/lib/ai/ruleBasedAnalyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body as { title?: string; description?: string };

    if (!title || !description) {
      return NextResponse.json(
        { error: 'title ve description gereklidir.' },
        { status: 400 }
      );
    }

    // Try Gemini first (server-side, API key never reaches the client)
    const geminiResult = await analyzeWithGemini(title, description);

    if (geminiResult) {
      return NextResponse.json(geminiResult);
    }

    // Fallback: rule-based analyzer
    const ruleResult = analyzeReportRuleBased(title, description);
    return NextResponse.json(ruleResult);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
    console.error('[/api/analyze] Hata:', message);

    // Always return something valid so the client can continue
    return NextResponse.json(
      {
        category: 'Diğer',
        department: 'Genel Belediye Hizmetleri',
        riskScore: 15,
        priority: 'low',
        aiSummary: 'Standart belediye incelemesi için genel bildirim.',
        recommendedAction: 'Manuel kategorizasyon için genel sıraya ata.',
      },
      { status: 200 }
    );
  }
}
