import { Report, Status } from '@/types/report';
import { mockReports } from './mockReports';

const STORAGE_KEY = 'bursamind_reports';

export function getStoredReports(): Report[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveReport(report: Report) {
  if (typeof window === 'undefined') return;
  const existing = getStoredReports();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([report, ...existing]));
}

export function getAllReports(): Report[] {
  if (typeof window === 'undefined') return mockReports;
  const combined = [...getStoredReports(), ...mockReports];
  // Sort descending by risk score
  return combined.sort((a, b) => b.riskScore - a.riskScore);
}

export function getReportById(id: string): Report | undefined {
  return getAllReports().find(r => r.id === id);
}

export function updateReportStatus(id: string, status: Status) {
  if (typeof window === 'undefined') return;
  const stored = getStoredReports();
  const reportIndex = stored.findIndex(r => r.id === id);
  if (reportIndex !== -1) {
    stored[reportIndex].status = status;
    stored[reportIndex].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } else {
    // If updating a mock report, clone it into local storage to persist the change locally
    const mockReport = mockReports.find(r => r.id === id);
    if (mockReport) {
      const updatedMock = { ...mockReport, status, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([updatedMock, ...stored]));
    }
  }
}
