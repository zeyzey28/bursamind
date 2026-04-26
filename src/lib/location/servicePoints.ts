/**
 * This dataset is sample data for MVP routing logic.
 * Production should use official municipal service point coordinates.
 */

import { normalizeTurkishText } from '../ai/textNormalize';

export type ServicePointType =
  | 'fire'
  | 'water_sewage'
  | 'public_works'
  | 'cleaning'
  | 'parks'
  | 'lighting'
  | 'municipal_police';

export interface ServicePoint {
  id: string;
  name: string;
  department: string;
  type: ServicePointType;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
}

// ── Dataset ─────────────────────────────────────────────────────────────────

export const SERVICE_POINTS: ServicePoint[] = [
  // İtfaiye
  {
    id: 'fire-osmangazi',
    name: 'Osmangazi İtfaiye İstasyonu',
    department: 'İtfaiye',
    type: 'fire',
    district: 'Osmangazi',
    address: 'Osmangazi / Bursa',
    latitude: 40.1985,
    longitude: 29.0609,
  },
  {
    id: 'fire-nilufer',
    name: 'Nilüfer İtfaiye İstasyonu',
    department: 'İtfaiye',
    type: 'fire',
    district: 'Nilüfer',
    address: 'Nilüfer / Bursa',
    latitude: 40.2181,
    longitude: 28.9867,
  },
  {
    id: 'fire-yildirim',
    name: 'Yıldırım İtfaiye İstasyonu',
    department: 'İtfaiye',
    type: 'fire',
    district: 'Yıldırım',
    address: 'Yıldırım / Bursa',
    latitude: 40.1912,
    longitude: 29.1124,
  },

  // Su ve Kanalizasyon
  {
    id: 'water-osmangazi',
    name: 'BUSKİ Osmangazi Hizmet Noktası',
    department: 'Su ve Kanalizasyon',
    type: 'water_sewage',
    district: 'Osmangazi',
    address: 'Osmangazi / Bursa',
    latitude: 40.1998,
    longitude: 29.0642,
  },
  {
    id: 'water-nilufer',
    name: 'BUSKİ Nilüfer Hizmet Noktası',
    department: 'Su ve Kanalizasyon',
    type: 'water_sewage',
    district: 'Nilüfer',
    address: 'Nilüfer / Bursa',
    latitude: 40.2138,
    longitude: 28.9849,
  },
  {
    id: 'water-yildirim',
    name: 'BUSKİ Yıldırım Hizmet Noktası',
    department: 'Su ve Kanalizasyon',
    type: 'water_sewage',
    district: 'Yıldırım',
    address: 'Yıldırım / Bursa',
    latitude: 40.1904,
    longitude: 29.1182,
  },

  // Fen İşleri
  {
    id: 'works-osmangazi',
    name: 'Osmangazi Fen İşleri Noktası',
    department: 'Fen İşleri',
    type: 'public_works',
    district: 'Osmangazi',
    address: 'Osmangazi / Bursa',
    latitude: 40.2022,
    longitude: 29.0581,
  },
  {
    id: 'works-nilufer',
    name: 'Nilüfer Fen İşleri Noktası',
    department: 'Fen İşleri',
    type: 'public_works',
    district: 'Nilüfer',
    address: 'Nilüfer / Bursa',
    latitude: 40.2165,
    longitude: 28.9755,
  },
  {
    id: 'works-yildirim',
    name: 'Yıldırım Fen İşleri Noktası',
    department: 'Fen İşleri',
    type: 'public_works',
    district: 'Yıldırım',
    address: 'Yıldırım / Bursa',
    latitude: 40.1885,
    longitude: 29.1251,
  },

  // Temizlik İşleri
  {
    id: 'cleaning-osmangazi',
    name: 'Osmangazi Temizlik İşleri Noktası',
    department: 'Temizlik İşleri',
    type: 'cleaning',
    district: 'Osmangazi',
    address: 'Osmangazi / Bursa',
    latitude: 40.2007,
    longitude: 29.0701,
  },
  {
    id: 'cleaning-nilufer',
    name: 'Nilüfer Temizlik İşleri Noktası',
    department: 'Temizlik İşleri',
    type: 'cleaning',
    district: 'Nilüfer',
    address: 'Nilüfer / Bursa',
    latitude: 40.2211,
    longitude: 28.9918,
  },

  // Park ve Bahçeler
  {
    id: 'parks-osmangazi',
    name: 'Osmangazi Park ve Bahçeler Noktası',
    department: 'Park ve Bahçeler',
    type: 'parks',
    district: 'Osmangazi',
    address: 'Osmangazi / Bursa',
    latitude: 40.1957,
    longitude: 29.0524,
  },
  {
    id: 'parks-nilufer',
    name: 'Nilüfer Park ve Bahçeler Noktası',
    department: 'Park ve Bahçeler',
    type: 'parks',
    district: 'Nilüfer',
    address: 'Nilüfer / Bursa',
    latitude: 40.2149,
    longitude: 28.9992,
  },

  // Aydınlatma ve Elektrik Bakım
  {
    id: 'lighting-osmangazi',
    name: 'Osmangazi Aydınlatma Bakım Noktası',
    department: 'Aydınlatma ve Elektrik Bakım',
    type: 'lighting',
    district: 'Osmangazi',
    address: 'Osmangazi / Bursa',
    latitude: 40.2015,
    longitude: 29.0755,
  },
  {
    id: 'lighting-nilufer',
    name: 'Nilüfer Aydınlatma Bakım Noktası',
    department: 'Aydınlatma ve Elektrik Bakım',
    type: 'lighting',
    district: 'Nilüfer',
    address: 'Nilüfer / Bursa',
    latitude: 40.2194,
    longitude: 28.9825,
  },

  // Zabıta
  {
    id: 'police-osmangazi',
    name: 'Osmangazi Zabıta Noktası',
    department: 'Zabıta',
    type: 'municipal_police',
    district: 'Osmangazi',
    address: 'Osmangazi / Bursa',
    latitude: 40.1969,
    longitude: 29.0617,
  },
  {
    id: 'police-yildirim',
    name: 'Yıldırım Zabıta Noktası',
    department: 'Zabıta',
    type: 'municipal_police',
    district: 'Yıldırım',
    address: 'Yıldırım / Bursa',
    latitude: 40.1898,
    longitude: 29.1168,
  },
];

// ── Department → ServicePointType mapping ────────────────────────────────────

const DEPARTMENT_TYPE_MAP: Array<{ keywords: string[]; type: ServicePointType }> = [
  {
    keywords: ['itfaiye', 'fire', 'yangın', 'patlama', 'acil durum'],
    type: 'fire',
  },
  {
    keywords: [
      'su ve kanalizasyon', 'buski', 'su ve tesisat',
      'kanalizasyon', 'boru', 'flood', 'su baskını', 'sewage',
      'patlak', 'boru patlağı', 'su sızıntısı', 'su kaçağı'
    ],
    type: 'water_sewage',
  },
  {
    keywords: [
      'fen işleri', 'altyapı', 'yol', 'kaldırım',
      'ulaşım hizmetleri', 'pothole', 'çukur', 'road',
    ],
    type: 'public_works',
  },
  {
    keywords: [
      'temizlik işleri', 'çöp', 'atık', 'garbage',
      'graffiti', 'grafiti', 'cleaning',
    ],
    type: 'cleaning',
  },
  {
    keywords: [
      'park ve bahçeler', 'park', 'bahçe', 'ağaç',
      'parks', 'tree', 'devrilmiş',
    ],
    type: 'parks',
  },
  {
    keywords: [
      'aydınlatma ve elektrik bakım', 'aydınlatma',
      'elektrik', 'uedaş', 'sokak lambası', 'lighting',
    ],
    type: 'lighting',
  },
  {
    keywords: ['zabıta', 'municipal_police'],
    type: 'municipal_police',
  },
];

function resolveType(text: string): ServicePointType {
  const norm = normalizeTurkishText(text);
  for (const entry of DEPARTMENT_TYPE_MAP) {
    if (entry.keywords.some(kw => norm.includes(normalizeTurkishText(kw)))) {
      return entry.type;
    }
  }
  return 'public_works'; // default fallback
}

// ── Helper functions ─────────────────────────────────────────────────────────

/**
 * Returns all service points that belong to the given department name (exact match).
 */
export function getServicePointsByDepartment(department: string): ServicePoint[] {
  return SERVICE_POINTS.filter(sp => sp.department === department);
}

/**
 * Returns service points relevant to the given report department (and optionally category).
 * Uses keyword matching so partial / translated department names still resolve.
 * Falls back to public_works if no match is found.
 */
export function getRelevantServicePoints(
  reportDepartment: string,
  reportCategory?: string
): ServicePoint[] {
  const combined = reportCategory
    ? `${reportDepartment} ${reportCategory}`
    : reportDepartment;

  const resolvedType = resolveType(combined);
  return SERVICE_POINTS.filter(sp => sp.type === resolvedType);
}
