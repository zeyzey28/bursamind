import { Report, Status } from '@/types/report';
import { supabase } from './supabase/client';
import * as localStore from './reportStorage';

export async function createReport(report: Report): Promise<void> {
  if (supabase) {
    const dbPayload = {
      title: report.title,
      description: report.description,
      image_url: report.imageUrl,
      latitude: report.latitude,
      longitude: report.longitude,
      category: report.category,
      department: report.department,
      risk_score: report.riskScore,
      priority: report.priority,
      status: report.status,
      ai_summary: report.aiSummary,
      recommended_action: report.recommendedAction,
      user_id: report.userId
    };

    const { error } = await supabase.from('reports').insert([dbPayload]);
    if (error) {
      console.error('Supabase error inserting report', error);
      localStore.saveReport(report); // Fallback
    }
  } else {
    localStore.saveReport(report);
  }
}

export async function getReports(): Promise<Report[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('risk_score', { ascending: false });
    
    if (error) {
      console.error('SUPABASE FETCH ALL ERROR:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return localStore.getAllReports();
    }

    if (!data) return localStore.getAllReports();
    return data.map(mapDbToReport);
  }
  return localStore.getAllReports();
}

export async function getReportsForUser(userId: string): Promise<Report[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      // Log as warning for citizens to avoid noisy error overlays if column doesn't exist yet/RLS
      console.warn('SUPABASE FETCH USER REPORTS ERROR:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return []; // Return empty as per request
    }

    if (!data) return [];
    return data.map(mapDbToReport);
  }
  return [];
}

export async function getReportById(id: string): Promise<Report | undefined> {
  if (supabase) {
    // Basic catch if id format isn't uuid and we try to query it
    if (id.startsWith('RPT-')) {
      return localStore.getReportById(id);
    }
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return localStore.getReportById(id);
    return mapDbToReport(data);
  }
  return localStore.getReportById(id);
}

export async function updateReportStatus(id: string, status: Status): Promise<void> {
  if (supabase) {
    if (id.startsWith('RPT-')) {
      localStore.updateReportStatus(id, status);
      return;
    }
    const { error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', id);
    if (error) {
       console.error('Supabase error updating status', error);
       localStore.updateReportStatus(id, status);
    }
  } else {
    localStore.updateReportStatus(id, status);
  }
}

export async function updateMunicipalityResponse(id: string, response: string): Promise<void> {
  if (supabase) {
    if (id.startsWith('RPT-')) {
      // Local fallback not strictly needed for this specific feature but good for consistency
      return;
    }
    const { error } = await supabase
      .from('reports')
      .update({ 
        municipality_response: response,
        response_updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (error) {
       console.error('Supabase error updating municipality response', error);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToReport(dbObj: any): Report {
  return {
    id: dbObj.id,
    title: dbObj.title,
    description: dbObj.description,
    imageUrl: dbObj.image_url,
    latitude: dbObj.latitude,
    longitude: dbObj.longitude,
    category: dbObj.category,
    department: dbObj.department,
    riskScore: dbObj.risk_score,
    priority: dbObj.priority,
    status: dbObj.status,
    aiSummary: dbObj.ai_summary,
    recommendedAction: dbObj.recommended_action,
    userId: dbObj.user_id,
    municipalityResponse: dbObj.municipality_response,
    responseUpdatedAt: dbObj.response_updated_at,
    createdAt: dbObj.created_at,
    updatedAt: dbObj.updated_at,
  };
}
