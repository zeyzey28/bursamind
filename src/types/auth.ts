export type UserRole = 'citizen' | 'municipality';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  created_at?: string;
  updated_at?: string;
}
