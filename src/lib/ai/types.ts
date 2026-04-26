export type AnalysisResult = {
  category: string;
  department: string;
  riskScore: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  aiSummary: string;
  recommendedAction: string;
};
