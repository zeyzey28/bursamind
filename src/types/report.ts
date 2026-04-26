export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'pending' | 'in_review' | 'resolved' | 'rejected';

export interface Report {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  category: string;
  department: string;
  riskScore: number;
  priority: Priority;
  status: Status;
  aiSummary: string;
  recommendedAction: string;
  userId?: string;
  municipalityResponse?: string;
  responseUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}
